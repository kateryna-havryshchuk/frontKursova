// src/app/components/edit-book/edit-book.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, filter, take } from 'rxjs/operators';

// Переконайся, що ці шляхи правильні, і моделі оновлені
import { Book } from '../../models/book.model';
import { Author } from '../../models/author.model';
import { Genre } from '../../models/genre.model';
// import { BookService } from '../../services/book.service';
// import { AuthorService } from '../../services/author.service';
// import { GenreService } from '../../services/genre.service';

export function publicationYearValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value) {
    const year = parseInt(control.value, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1000 || year > currentYear) {
      return { invalidYearRange: true };
    }
  }
  return null;
}

@Component({
  selector: 'app-edit-book',
  templateUrl: './edit-book.component.html',
  styleUrls: ['./edit-book.component.css']
})
export class EditBookComponent implements OnInit, OnDestroy {
  currentStep = 1;
  editBookForm!: FormGroup; // <--- Назва форми для редагування
  bookId!: number;
  bookToEdit: Book | null = null;

  authorSearchResults$: Observable<Author[]> = of([]);
  private authorSearchTerms = new Subject<string>();
  selectedAuthor: Author | null = null;
  isAddingNewAuthor = false;
  isLoadingAuthors = false;

  genreSearchResults$: Observable<Genre[]> = of([]);
  private genreSearchTerms = new Subject<string>();
  selectedGenre: Genre | null = null;
  isAddingNewGenre = false;
  isLoadingGenres = false;

  currentYear = new Date().getFullYear();
  isSubmitting = false;
  isLoadingData = true;
  errorMessage: string | null = null;

  showYearPicker = false;
  yearRange = { start: this.currentYear - 19, end: this.currentYear };
  yearsToDisplay: number[] = [];

  private routeSubscription!: Subscription;

  private mockBookService = {
    getBookById: (id: number): Observable<Book | null> => {
      console.log('Mock BookService: getBookById for id:', id);
      // Приклад даних, що відповідають оновленій моделі Book
      const mockExistingBook: Book = {
        id: id,
        name: `The Lord of the Rings ${id}`,
        price: 35.50,
        language: 'English',
        publisher: 'Allen & Unwin',
        numberOfPages: 1216,
        publicationYear: 1954,
        isbn: '978-0618640157',
        description: 'A classic epic high-fantasy novel.',
        coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71jLBXtWJWL.jpg',
        author: { id: 5, name: 'J.R.R. Tolkien', biography: 'Was an English writer...' }, // Повний об'єкт автора
        authorId: 5, // ID автора
        genreName: 'Fantasy', // Назва жанру
        genreId: 4,           // ID жанру
      };
      if (id === mockExistingBook.id) return of(mockExistingBook);
      return of(null);
    },
    updateBook: (id: number, bookData: any): Observable<any> => { /* ... */ return of({ id, ...bookData }); },
    deleteBook: (id: number): Observable<any> => { /* ... */ return of({}); }
  };
  private mockAuthorService = {
    searchAuthors: (term: string): Observable<Author[]> => {
      const mockAuthors: Author[] = [ { id: 1, name: 'F. Scott Fitzgerald' }, { id: 5, name: 'J.R.R. Tolkien' } ];
      return of(mockAuthors.filter(a => a.name.toLowerCase().includes(term.toLowerCase())));
    }
  };
  private mockGenreService = {
    searchGenres: (term: string): Observable<Genre[]> => {
      const mockGenres: Genre[] = [ { id: 4, name: 'Fantasy' }, { id: 1, name: 'Classic Fiction' } ];
      return of(mockGenres.filter(g => g.name.toLowerCase().includes(term.toLowerCase())));
    }
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm(); // Спочатку ініціалізуємо форму
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.bookId = +idParam;
        this.loadBookData(); // Потім завантажуємо дані
      } else {
        this.isLoadingData = false;
        this.errorMessage = "Book ID not found. Cannot edit.";
      }
    });
    this.updateYearsToDisplay();
    this.setupAuthorSearch();
    this.setupGenreSearch();
  }

  initForm(): void {
    this.editBookForm = this.fb.group({ // <--- Використовуємо editBookForm
      name: ['', Validators.required],
      authorSearch: [''], newAuthorName: [''], authorId: [null],
      genreSearch: [''], newGenreName: [''], genreId: [null],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      language: ['', Validators.required],
      publisher: ['', Validators.required],
      numberOfPages: ['', [Validators.required, Validators.min(1), Validators.pattern("^[1-9]\\d*$")]],
      publicationYear: ['', [Validators.required, Validators.min(1000), Validators.max(this.currentYear), publicationYearValidator]],
      isbn: ['', [Validators.required, Validators.pattern(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/)]],
      coverImageUrl: ['', [Validators.pattern(/^(ftp|http|https):\/\/[^ "]+$/)]],
      description: [''],
      authorBiography: ['']
    });
  }

  loadBookData(): void {
    this.isLoadingData = true;
    this.mockBookService.getBookById(this.bookId).pipe(take(1)).subscribe({
      next: (book) => {
        if (book) {
          this.bookToEdit = book;
          this.editBookForm.patchValue({ // <--- Використовуємо editBookForm
            name: book.name,
            price: book.price,
            language: book.language,
            publisher: book.publisher,
            numberOfPages: book.numberOfPages,
            publicationYear: book.publicationYear,
            isbn: book.isbn,
            description: book.description,
            coverImageUrl: book.coverImageUrl
          });

          if (book.author) {
            this.selectAuthor(book.author); // Це встановить authorId, authorSearch та selectedAuthor
          } else if (book.authorId) {
            // Якщо є тільки ID, потрібно завантажити автора або мати його ім'я для відображення
            console.warn("Author object not provided, only authorId. UI might need adjustment or service call to fetch author name.");
            this.editBookForm.patchValue({authorId: book.authorId});
            // Можливо, потрібно знайти ім'я автора за ID і встановити в authorSearch
            // this.authorService.getAuthorById(book.authorId).subscribe(author => this.selectAuthor(author));
          }

          if (book.genreId && book.genreName) { // Якщо є genreId та genreName
            this.selectGenre({id: book.genreId, name: book.genreName});
          } else if (book.genreName) { // Якщо є тільки genreName (наприклад, зі старого book.genre)
            this.editBookForm.get('genreSearch')?.setValue(book.genreName);
             // Тут можна спробувати знайти жанр за назвою і встановити selectedGenre та genreId
          }

        } else {
          this.errorMessage = "Book not found.";
        }
        this.isLoadingData = false;
      },
      error: (err) => { /* ... обробка помилки ... */ }
    });
  }

  // --- Логіка для Автора (методи залишаються схожими, але працюють з editBookForm) ---
  setupAuthorSearch(): void {
    this.authorSearchResults$ = this.authorSearchTerms.pipe(
      debounceTime(300), distinctUntilChanged(),
      filter((term: string) => term.length > 1 || term.length === 0),
      tap(() => this.isLoadingAuthors = true),
      switchMap((term: string) => term ? this.mockAuthorService.searchAuthors(term) : of([])),
      tap(() => this.isLoadingAuthors = false),
      catchError(() => { this.isLoadingAuthors = false; return of([]); })
    );
  }
  onAuthorSearchChange(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.authorSearchTerms.next(term);
    if (!term.trim()) { this.selectedAuthor = null; this.editBookForm.get('authorId')?.patchValue(null); }
    this.isAddingNewAuthor = false;
  }
  selectAuthor(author: Author): void {
    this.selectedAuthor = author;
    this.editBookForm.patchValue({ authorId: author.id, authorSearch: author.name, newAuthorName: '' });
    this.authorSearchResults$ = of([]); this.isAddingNewAuthor = false;
  }
  toggleAddNewAuthor(): void {
    this.isAddingNewAuthor = !this.isAddingNewAuthor;
    this.selectedAuthor = null; this.editBookForm.patchValue({ authorId: null });
    const newAuthorNameCtrl = this.editBookForm.get('newAuthorName');
    const authorSearchCtrl = this.editBookForm.get('authorSearch');
    if (this.isAddingNewAuthor) {
      newAuthorNameCtrl?.setValue(authorSearchCtrl?.value || ''); authorSearchCtrl?.setValue('');
      newAuthorNameCtrl?.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      newAuthorNameCtrl?.clearValidators(); newAuthorNameCtrl?.setValue('');
    }
    newAuthorNameCtrl?.updateValueAndValidity(); this.authorSearchResults$ = of([]);
  }

  // --- Логіка для Жанру (аналогічно) ---
  setupGenreSearch(): void { /* ... (використовує editBookForm) ... */ }
  onGenreSearchChange(event: Event): void { /* ... (використовує editBookForm) ... */ }
  selectGenre(genre: Genre): void { /* ... (використовує editBookForm) ... */ }
  toggleAddNewGenre(): void { /* ... (використовує editBookForm) ... */ }


  // --- Логіка для Вибору Року (залишається) ---
  updateYearsToDisplay(): void { /* ... */ }
  getYearRange(): number[] { /* ... */ return []; } // Поверни this.yearsToDisplay
  toggleYearPicker(): void { /* ... (використовує editBookForm для selected year) ... */ }
  changeYearRange(delta: number): void { /* ... */ }
  selectYear(year: number): void { if (year <= this.currentYear) { this.editBookForm.patchValue({ publicationYear: year }); this.showYearPicker = false; } }
  handleImageError(event: Event): void { /* ... */ }

  // --- Навігація по кроках ---
  nextStep(): void {
    if (!this.validateStep(this.currentStep)) return;
    if (this.currentStep === 1) { this.currentStep = 2; }
    else if (this.currentStep === 2) {
      if (this.isAddingNewAuthor && this.editBookForm.get('newAuthorName')?.value?.trim()) { this.currentStep = 3; }
      else { this.onSubmit(); }
    }
  }
  prevStep(): void {
    if (this.currentStep === 3) { this.currentStep = 1; }
    else if (this.currentStep === 2) { this.currentStep = 1; }
  }

  // --- Валідація кроку ---
  validateStep(step: number): boolean {
    // ... (Логіка валідації, але для editBookForm) ...
    // Переконайся, що всі get(...) викликаються з this.editBookForm
    return true; // Тимчасова заглушка
  }

  // --- Відправка форми (оновлення) ---
  onSubmit(): void {
    if (this.editBookForm.invalid) { /* ... (як було, але для editBookForm) ... */ return; }
    this.isSubmitting = true; this.errorMessage = null;
    const formData = this.editBookForm.getRawValue();
    const bookUpdatePayload: any = {
      id: this.bookId, // ID для оновлення
      name: formData.name, price: parseFloat(formData.price), language: formData.language,
      publisher: formData.publisher,
      numberOfPages: parseInt(formData.numberOfPages, 10), publicationYear: formData.publicationYear,
      isbn: formData.isbn, description: formData.description || undefined,
      coverImageUrl: formData.coverImageUrl || undefined,
    };
    // Логіка для автора
    if (this.selectedAuthor) { bookUpdatePayload.authorId = this.selectedAuthor.id; bookUpdatePayload.newAuthor = undefined; }
    else if (this.isAddingNewAuthor && formData.newAuthorName) { bookUpdatePayload.newAuthor = { name: formData.newAuthorName.trim() }; if (formData.authorBiography) { bookUpdatePayload.newAuthor.biography = formData.authorBiography.trim(); } bookUpdatePayload.authorId = undefined; }
    else if (this.bookToEdit?.authorId) { bookUpdatePayload.authorId = this.bookToEdit.authorId; } // Залишаємо старого автора, якщо не змінено

    // Логіка для жанру
    if (this.selectedGenre) { bookUpdatePayload.genreId = this.selectedGenre.id; bookUpdatePayload.newGenre = undefined; }
    else if (this.isAddingNewGenre && formData.newGenreName) { bookUpdatePayload.newGenre = { name: formData.newGenreName.trim() }; bookUpdatePayload.genreId = undefined; }
    else if (this.bookToEdit?.genreId) { bookUpdatePayload.genreId = this.bookToEdit.genreId; } // Залишаємо старий жанр
    else if (this.bookToEdit?.genreName && !this.selectedGenre && !this.isAddingNewGenre) { // Якщо початковий жанр був рядком і не змінювався
        bookUpdatePayload.currentGenreName = this.bookToEdit.genreName; // Можливо, бекенд обробить це
    }


    console.log('Updating Book Data:', bookUpdatePayload);
    this.mockBookService.updateBook(this.bookId, bookUpdatePayload).subscribe({
      next: () => {
        this.isSubmitting = false; alert('Book updated successfully! (Mock)');
        this.router.navigate(['/book-details', this.bookId]);
      },
      error: (err) => { /* ... обробка помилки ... */ }
    });
  }

  // Getters для editBookForm
  get nameCtrl() { return this.editBookForm.get('name'); }
  get authorSearchCtrl() { return this.editBookForm.get('authorSearch'); }
  get newAuthorNameCtrl() { return this.editBookForm.get('newAuthorName'); }
  get genreSearchCtrl() { return this.editBookForm.get('genreSearch'); }
  get newGenreNameCtrl() { return this.editBookForm.get('newGenreName'); }
  get priceCtrl() { return this.editBookForm.get('price'); }
  get languageCtrl() { return this.editBookForm.get('language'); }
  get publisherCtrl() { return this.editBookForm.get('publisher'); }
  get numberOfPagesCtrl() { return this.editBookForm.get('numberOfPages'); }
  get publicationYearCtrl() { return this.editBookForm.get('publicationYear'); }
  get isbnCtrl() { return this.editBookForm.get('isbn'); }
  get coverImageUrlCtrl() { return this.editBookForm.get('coverImageUrl'); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.showYearPicker &&
        !target.closest('.year-input-wrapper input[formControlName="publicationYear"]') &&
        !target.closest('.year-picker-toggle-btn') &&
        !target.closest('.year-picker')) {
      this.showYearPicker = false;
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
  }
}