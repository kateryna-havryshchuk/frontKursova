import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Review, NewReview } from '../models/review.model';
import { AuthService } from './auth.service'; // Потрібен для отримання ID поточного користувача

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:3000/api/reviews'; // Приклад URL твого API

  // Заглушка для зберігання відгуків (в реальному додатку це буде БД)
  private mockReviews: Review[] = [
    { id: 1, bookId: 1, userId: 'user-123', username: 'TestUser', rating: 5, comment: 'Absolutely fantastic book! A must-read.', createdAt: new Date('2024-05-01T10:00:00Z') },
    { id: 2, bookId: 1, userId: 'user-456', username: 'BookwormReader', rating: 4, comment: 'Great story, well-written characters. Enjoyed it a lot.', createdAt: new Date('2024-05-03T14:30:00Z') },
    { id: 3, bookId: 2, userId: 'user-123', username: 'TestUser', rating: 3, comment: 'It was okay, a bit slow for my taste.', createdAt: new Date('2024-05-05T09:15:00Z') },
  ];
  private nextReviewId = 4;


  constructor(private http: HttpClient, private authService: AuthService) { }

  getReviews(bookId: number): Observable<Review[]> {
    // В реальному додатку:
    // return this.http.get<Review[]>(`${this.apiUrl}/book/${bookId}`);

    // ЗАГЛУШКА:
    console.log(`Workspaceing reviews for bookId: ${bookId}`);
    const bookReviews = this.mockReviews.filter(review => review.bookId === bookId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Сортуємо: новіші спочатку
    return of(bookReviews).pipe(delay(500)); // Імітація затримки
  }

  addReview(reviewData: NewReview): Observable<Review> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated to add review.'));
    }

    const newReview: Review = {
      id: this.nextReviewId++,
      bookId: reviewData.bookId,
      userId: currentUser.id,
      username: currentUser.username, // Або інше поле з User-об'єкта
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date()
    };

    // В реальному додатку:
    // return this.http.post<Review>(this.apiUrl, newReview);

    // ЗАГЛУШКА:
    console.log('Adding new review:', newReview);
    this.mockReviews.push(newReview);
    // Оновлюємо BehaviorSubject в AuthService, якщо він там є, щоб показати оновлену к-сть відгуків користувача, наприклад
    return of(newReview).pipe(
      delay(800), // Імітація затримки
      tap(addedReview => console.log('Review added (mock):', addedReview))
    );
  }

  // Тут можуть бути методи для оновлення, видалення відгуків тощо.
}