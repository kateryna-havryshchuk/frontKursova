// src/app/components/book-details/book-details.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable, of, throwError } from 'rxjs'; // Додав throwError
import { delay, tap, catchError, map } from 'rxjs/operators';    // Додав delay, map

// Переконайся, що шляхи правильні та інтерфейси оновлені
import { Book } from '../../models/book.model';
import { Author } from '../../models/author.model'; // Якщо використовуєш
import { Review, NewReview } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service'; // Імпортуємо тільки AuthService
import { User } from '../../models/user.model';      // Перейменував User, щоб уникнути конфлікту, якщо є інша модель User

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css']
})
export class BookDetailsComponent implements OnInit, OnDestroy {
  book: Book | null = null;
  isLoadingBook = true;
  bookId!: number;

  reviews: Review[] = [];
  isLoadingReviews = false;
  showReviewForm = false;
  reviewForm!: FormGroup;
  isSubmittingReview = false;
  reviewError: string | null = null;
  userRating: number = 0;

  canWriteReview = false;
  hasUserReviewed = false;

  private routeSub!: Subscription;
  private authSub!: Subscription;

  // ЗАГЛУШКА ДЛЯ BookService
  // Переконайся, що дані тут ВІДПОВІДАЮТЬ оновленому інтерфейсу Book
  private mockBookService = {
    getBookById: (id: number): Observable<Book | null> => {
      const books: Book[] = [ // Припускаємо, що Book тепер включає author, isbn, description, coverImageUrl
        {
          id: 1, name: 'Book Title 1', price: 29.99, language: 'English',
          numberOfPages: 320, publicationYear: 2021,
          author: {id: 1, name: 'Author 1', biography: 'Bio 1'}, // Приклад об'єкта Author
          isbn: '123-456',
          description: 'A great book about adventures.',
          coverImageUrl: 'assets/images/book1.jpg', // Переконайся, що шлях правильний
          // genre: 'Fantasy' // Якщо genre - рядок
          genreName: 'Fantasy' // Якщо додав genreName
        },
        {
          id: 2, name: 'Another Great Story', price: 19.99, language: 'English',
          numberOfPages: 250, publicationYear: 2022,
          author: {id: 2, name: 'Author 2', biography: 'Bio 2'},
          isbn: '789-012',
          description: 'A captivating sci-fi novel.',
          coverImageUrl: 'assets/images/book2.jpg',
          // genre: 'Sci-Fi'
           genreName: 'Sci-Fi'
        }
      ];
      const foundBook = books.find(b => b.id === id) || null;
      return of(foundBook).pipe(delay(500)); // delay тепер має бути імпортований
    }
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router, // <--- ЗРОБИВ PUBLIC
    private fb: FormBuilder,
    private reviewService: ReviewService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.bookId = +params['id'];
      if (this.bookId) {
        this.loadBookDetails();
        this.loadReviews();
      }
    });

    this.initReviewForm();

    this.authSub = this.authService.currentUser$.subscribe((user: User | null) => {
      this.checkIfUserCanReview(user); // Передаємо користувача
    });
  }

  loadBookDetails(): void {
    this.isLoadingBook = true;
    this.mockBookService.getBookById(this.bookId).subscribe({
      next: (bookData) => {
        this.book = bookData;
        this.isLoadingBook = false;
        this.checkIfUserCanReview(this.authService.currentUserValue);
      },
      error: (err) => {
        console.error('Error loading book details:', err);
        this.isLoadingBook = false;
      }
    });
  }

  loadReviews(): void {
    this.isLoadingReviews = true;
    this.reviewService.getReviews(this.bookId).subscribe({
      next: (reviewsData) => {
        this.reviews = reviewsData;
        this.isLoadingReviews = false;
        this.checkIfUserCanReview(this.authService.currentUserValue);
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.isLoadingReviews = false;
      }
    });
  }

  initReviewForm(): void {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
    this.userRating = 0;
    this.reviewForm.get('rating')?.valueChanges.subscribe(value => {
      this.userRating = value;
    });
  }

  onRatingSet(rating: number): void {
    this.userRating = rating;
    this.reviewForm.get('rating')?.setValue(rating);
    this.reviewForm.get('rating')?.markAsTouched();
  }

  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    if (this.showReviewForm) {
      this.initReviewForm();
    }
    this.reviewError = null;
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const currentUser = this.authService.currentUserValue; // Отримуємо один раз
    if (!currentUser) {
        this.reviewError = "You must be logged in to submit a review.";
        return;
    }

    this.isSubmittingReview = true;
    this.reviewError = null;

    const newReviewData: NewReview = {
      bookId: this.bookId,
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment
      // userId та username будуть додані в ReviewService з currentUser
    };

    this.reviewService.addReview(newReviewData).subscribe({
      next: (addedReview) => {
        this.isSubmittingReview = false;
        this.loadReviews(); // Перезавантажуємо відгуки
        this.showReviewForm = false;
        alert('Thank you for your review!');
      },
      error: (err) => {
        this.isSubmittingReview = false;
        // Спробуємо отримати повідомлення з err.error, якщо воно є
        this.reviewError = (err.error && err.error.message) ? err.error.message : (err.message || 'Failed to submit review. Please try again.');
        console.error('Error submitting review:', err);
      }
    });
  }

  checkIfUserCanReview(currentUser: User | null): void { // Приймаємо користувача як параметр
    if (currentUser && this.book) { // Перевіряємо, чи завантажена книга
      this.hasUserReviewed = this.reviews.some(review => review.userId === currentUser.id && review.bookId === this.bookId);
    } else {
      this.hasUserReviewed = false;
    }
    this.canWriteReview = !!currentUser && !this.hasUserReviewed;
  }

  onEditBook(): void {
    console.log('Book object:', this.book); // Debug log to check the book object
    if (this.book && this.book.id) {
        this.router.navigate([`/books/edit/${this.book.id}`]);
    } else {
        console.warn('Book or Book ID is not available.'); // Debugging message
    }
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.authSub) this.authSub.unsubscribe();
  }

  get ratingCtrl() { return this.reviewForm.get('rating'); }
  get commentCtrl() { return this.reviewForm.get('comment'); }
}