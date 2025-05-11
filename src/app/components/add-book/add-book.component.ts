// src/app/components/add-book/add-book.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, filter } from 'rxjs/operators';

import { Book } from '../../models/book.model';
import { Author } from '../../models/author.model';
import { Genre } from '../../models/genre.model';

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css']
})
export class AddBookComponent implements OnInit {
  currentStep = 1;
  addBookForm!: FormGroup;

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
  errorMessage: string | null = null;

  showYearPicker = false;
  yearRange = {
    start: 1900,
    end: this.currentYear
  };

  private mockAuthorService = {
    searchAuthors: (term: string): Observable<Author[]> => {
      const mockAuthors: Author[] = [
        { id: 1, name: 'F. Scott Fitzgerald', biography: 'An American novelist...' },
        { id: 2, name: 'Harper Lee', biography: 'Known for To Kill a Mockingbird...' },
        { id: 3, name: 'George Orwell', biography: 'English novelist, essayist...' },
        { id: 4, name: 'Jane Austen', biography: 'English novelist known primarily...'}
      ];
      return of(mockAuthors.filter(a => a.name.toLowerCase().includes(term.toLowerCase()))).pipe(
        debounceTime(300)
      );
    }
  };
  private mockGenreService = {
    searchGenres: (term: string): Observable<Genre[]> => {
      const mockGenres: Genre[] = [
        { id: 1, name: 'Classic Fiction' }, { id: 2, name: 'Southern Gothic' },
        { id: 3, name: 'Dystopian' }, { id: 4, name: 'Fantasy' }, { id: 5, name: 'Romance'}
      ];
      return of(mockGenres.filter(g => g.name.toLowerCase().includes(term.toLowerCase()))).pipe(
        debounceTime(300)
      );
    }
  };
  private mockBookService = {
    addBook: (bookData: any): Observable<any> => {
      console.log('Mock BookService: addBook called with', bookData);
      return of({ id: Date.now(), ...bookData }).pipe(debounceTime(1000));
    }
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    const currentYear = new Date().getFullYear();
    this.yearRange.end = currentYear;
    this.yearRange.start = currentYear - 19;

    // Додаємо обробник кліку поза календариком
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.year-picker') && 
          !target.closest('.year-picker-toggle') && 
          !target.closest('input[formControlName="publicationYear"]')) {
        this.showYearPicker = false;
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.setupAuthorSearch();
    this.setupGenreSearch();

    document.addEventListener('click', (e: Event) => {
      if (this.showYearPicker && !(e.target as HTMLElement).closest('.year-picker') && 
          !(e.target as HTMLElement).closest('.year-input-wrapper')) {
        this.showYearPicker = false;
      }
    });
  }

  initForm(): void {
    const currentYear = new Date().getFullYear();
    
    this.addBookForm = this.fb.group({
      name: ['', Validators.required],
      authorSearch: [''],
      newAuthorName: [''],
      authorId: [null],
      genreSearch: [''],
      newGenreName: [''],
      genreId: [null],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      language: ['', [Validators.required]],
      publisher: ['', [Validators.required]],
      numberOfPages: ['', [Validators.required, Validators.min(1), Validators.pattern("^[1-9]\\d*$")]],
      publicationYear: ['', [
        Validators.required,
        Validators.min(1000),
        Validators.max(currentYear)
      ]],
      isbn: ['', [Validators.required, Validators.pattern(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/)]],
      description: [''],
      authorBiography: [''],
      coverImageUrl: ['']
    });
  }

  get coverImageUrl() { 
    return this.addBookForm.get('coverImageUrl'); 
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/book-placeholder.png';
  }

  getYearRange(): number[] {
    const years: number[] = [];
    for (let year = this.yearRange.start; year <= this.yearRange.end; year++) {
      years.push(year);
    }
    return years;
  }

  toggleYearPicker(): void {
    this.showYearPicker = !this.showYearPicker;
    if (this.showYearPicker) {
      const currentValue = this.addBookForm.get('publicationYear')?.value;
      if (currentValue) {
        // Центруємо діапазон років навколо вибраного року
        const middleYear = Math.floor(currentValue / 20) * 20;
        this.yearRange.start = middleYear;
        this.yearRange.end = middleYear + 19;
      } else {
        // Якщо рік не вибрано, показуємо останні 20 років
        this.yearRange.end = this.currentYear;
        this.yearRange.start = this.yearRange.end - 19;
      }
    }
  }

  changeYearRange(delta: number): void {
    const newStart = this.yearRange.start + delta;
    const newEnd = this.yearRange.end + delta;
    
    if (newStart >= 1000 && newEnd <= this.currentYear) {
      this.yearRange.start = newStart;
      this.yearRange.end = newEnd;
    }
  }

  selectYear(year: number): void {
    if (year <= this.currentYear) {
      this.addBookForm.patchValue({ publicationYear: year });
      this.showYearPicker = false;
    }
  }

  setupAuthorSearch(): void {
    this.authorSearchResults$ = this.authorSearchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
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
    if (!term) {
        this.selectedAuthor = null;
        this.addBookForm.get('authorId')?.patchValue(null);
        this.isAddingNewAuthor = false;
    } else {
        this.isAddingNewAuthor = false;
        this.selectedAuthor = null;
        this.addBookForm.get('authorId')?.patchValue(null);
    }
  }

  selectAuthor(author: Author): void {
    this.selectedAuthor = author;
    this.addBookForm.patchValue({
      authorId: author.id,
      authorSearch: author.name,
      newAuthorName: ''
    });
    this.authorSearchResults$ = of([]);
    this.isAddingNewAuthor = false;
  }

  toggleAddNewAuthor(): void {
    this.isAddingNewAuthor = !this.isAddingNewAuthor;
    this.selectedAuthor = null;
    this.addBookForm.patchValue({ authorId: null });
    if (this.isAddingNewAuthor) {
        const currentSearch = this.addBookForm.get('authorSearch')?.value;
        this.addBookForm.patchValue({ newAuthorName: currentSearch, authorSearch: '' });
        this.addBookForm.get('newAuthorName')?.setValidators([Validators.required, Validators.minLength(3)]);
    } else {
        this.addBookForm.get('newAuthorName')?.clearValidators();
        this.addBookForm.patchValue({ newAuthorName: '' });
    }
    this.addBookForm.get('newAuthorName')?.updateValueAndValidity();
    this.authorSearchResults$ = of([]);
  }

  setupGenreSearch(): void {
    this.genreSearchResults$ = this.genreSearchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((term: string) => term.length > 1 || term.length === 0),
      tap(() => this.isLoadingGenres = true),
      switchMap((term: string) => term ? this.mockGenreService.searchGenres(term) : of([])),
      tap(() => this.isLoadingGenres = false),
      catchError(() => { this.isLoadingGenres = false; return of([]); })
    );
  }

  onGenreSearchChange(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.genreSearchTerms.next(term);
    if (!term) {
        this.selectedGenre = null;
        this.addBookForm.get('genreId')?.patchValue(null);
        this.isAddingNewGenre = false;
    } else {
        this.isAddingNewGenre = false;
        this.selectedGenre = null;
        this.addBookForm.get('genreId')?.patchValue(null);
    }
  }

  selectGenre(genre: Genre): void {
    this.selectedGenre = genre;
    this.addBookForm.patchValue({
      genreId: genre.id,
      genreSearch: genre.name,
      newGenreName: ''
    });
    this.genreSearchResults$ = of([]);
    this.isAddingNewGenre = false;
  }

  toggleAddNewGenre(): void {
    this.isAddingNewGenre = !this.isAddingNewGenre;
    this.selectedGenre = null;
    this.addBookForm.patchValue({ genreId: null });
     if (this.isAddingNewGenre) {
        const currentSearch = this.addBookForm.get('genreSearch')?.value;
        this.addBookForm.patchValue({ newGenreName: currentSearch, genreSearch: '' });
        this.addBookForm.get('newGenreName')?.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
        this.addBookForm.get('newGenreName')?.clearValidators();
        this.addBookForm.patchValue({ newGenreName: '' });
    }
    this.addBookForm.get('newGenreName')?.updateValueAndValidity();
    this.genreSearchResults$ = of([]);
  }

  nextStep(): void {
    if (this.validateStep(this.currentStep)) {
      if (this.currentStep === 1) {
        this.currentStep = 2;
      } else if (this.currentStep === 2) {
        if (this.isAddingNewAuthor && this.addBookForm.get('newAuthorName')?.value?.trim()) {
          this.currentStep = 3;
        } else {
          this.onSubmit();
        }
      }
    }
  }

  prevStep(): void {
    if (this.currentStep === 3) {
        this.currentStep = 1;
    } else if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  private isAddingNewAuthorFromPreviousStep(): boolean {
      return !!this.addBookForm.get('newAuthorName')?.value && this.isAddingNewAuthor;
  }

  validateStep(step: number): boolean {
    let isValid = true;
    const controlsToValidate: string[] = [];

    if (step === 1) {
      controlsToValidate.push(
        'name',
        'price',
        'language', // Додаємо мову
        'publisher', // Додаємо видавництво
        'numberOfPages',
        'publicationYear'
      );
      const authorSearchValue = this.addBookForm.get('authorSearch')?.value?.trim();
      const newAuthorNameValue = this.addBookForm.get('newAuthorName')?.value?.trim();

      if (this.isAddingNewAuthor) {
        if (!newAuthorNameValue) {
          this.addBookForm.get('newAuthorName')?.setErrors({ required: true }); isValid = false;
        } else { this.addBookForm.get('newAuthorName')?.setErrors(null); }
      } else {
        if (!this.selectedAuthor && !authorSearchValue) {
            this.addBookForm.get('authorSearch')?.setErrors({ required: true }); isValid = false;
        } else if (!this.selectedAuthor && authorSearchValue) {
            this.addBookForm.get('authorSearch')?.setErrors({ selectionOrNewRequired: true }); isValid = false;
        }
        else { this.addBookForm.get('authorSearch')?.setErrors(null); }
      }
      const genreSearchValue = this.addBookForm.get('genreSearch')?.value?.trim();
      const newGenreNameValue = this.addBookForm.get('newGenreName')?.value?.trim();

      if (this.isAddingNewGenre) {
         if (!newGenreNameValue) {
          this.addBookForm.get('newGenreName')?.setErrors({ required: true }); isValid = false;
        } else { this.addBookForm.get('newGenreName')?.setErrors(null); }
      } else {
        if (!this.selectedGenre && !genreSearchValue) {
            this.addBookForm.get('genreSearch')?.setErrors({ required: true }); isValid = false;
        } else if (!this.selectedGenre && genreSearchValue) {
            this.addBookForm.get('genreSearch')?.setErrors({ selectionOrNewRequired: true }); isValid = false;
        }
         else { this.addBookForm.get('genreSearch')?.setErrors(null); }
      }

    } else if (step === 2) {
      controlsToValidate.push('isbn');
    }

    controlsToValidate.forEach(controlName => {
      const control = this.addBookForm.get(controlName);
      if (control) {
        control.markAsTouched(); control.updateValueAndValidity();
        if (control.invalid) isValid = false;
      }
    });
    this.addBookForm.get('newAuthorName')?.updateValueAndValidity();
    this.addBookForm.get('authorSearch')?.updateValueAndValidity();
    this.addBookForm.get('newGenreName')?.updateValueAndValidity();
    this.addBookForm.get('genreSearch')?.updateValueAndValidity();
    return isValid;
  }

  onSubmit(): void {
    if (this.addBookForm.invalid) {
        this.errorMessage = "Please fill all required fields correctly across all steps.";
        Object.values(this.addBookForm.controls).forEach(control => {
            control.markAsTouched();
            control.updateValueAndValidity();
        });
        if (!this.validateStep(1)) { this.currentStep = 1; return; }
        if (!this.validateStep(2)) { this.currentStep = 2; return; }
      return;
    }

    this.isSubmitting = true; this.errorMessage = null;
    const formData = this.addBookForm.getRawValue();

    const bookDataPayload: any = {
      name: formData.name, price: formData.price, language: formData.language,
      numberOfPages: formData.numberOfPages, publicationYear: formData.publicationYear,
      isbn: formData.isbn, description: formData.description,
    };

    if (this.selectedAuthor) {
      bookDataPayload.authorId = this.selectedAuthor.id;
    } else if (formData.newAuthorName) {
      bookDataPayload.newAuthor = { name: formData.newAuthorName };
      if (this.isAddingNewAuthor && formData.authorBiography) {
        bookDataPayload.newAuthor.biography = formData.authorBiography;
      }
    }

    if (this.selectedGenre) {
      bookDataPayload.genreId = this.selectedGenre.id;
    } else if (formData.newGenreName) {
      bookDataPayload.newGenre = { name: formData.newGenreName };
    }

    console.log('Submitting Book Data:', bookDataPayload);
    this.mockBookService.addBook(bookDataPayload).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Book added successfully! (Mock)');
        this.addBookForm.reset();
        this.currentStep = 1;
        this.selectedAuthor = null; this.isAddingNewAuthor = false;
        this.selectedGenre = null; this.isAddingNewGenre = false;
        this.addBookForm.get('authorSearch')?.setValue('');
        this.addBookForm.get('genreSearch')?.setValue('');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Failed to add book.';
        console.error('Error adding book', err);
      }
    });
  }

  get nameCtrl() { return this.addBookForm.get('name'); }
  get authorSearchCtrl() { return this.addBookForm.get('authorSearch'); }
  get newAuthorNameCtrl() { return this.addBookForm.get('newAuthorName'); }
  get genreSearchCtrl() { return this.addBookForm.get('genreSearch'); }
  get newGenreNameCtrl() { return this.addBookForm.get('newGenreName'); }
  get priceCtrl() { return this.addBookForm.get('price'); }
  get numberOfPagesCtrl() { return this.addBookForm.get('numberOfPages'); }
  get publicationYearCtrl() { return this.addBookForm.get('publicationYear'); }
  get isbnCtrl() { return this.addBookForm.get('isbn'); }
  get languageCtrl() { return this.addBookForm.get('language'); }
  get publisherCtrl() { return this.addBookForm.get('publisher'); }
}