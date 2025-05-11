import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Для взаємодії з бекендом
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user.model'; // Імпортуємо модель користувача (якщо є)

// Інтерфейс для відповіді від бекенду при успішному логіні/реєстрації
export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
  role?: string;  // Add this line
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Використовуємо BehaviorSubject для зберігання стану поточного користувача
  // null означає, що користувач не залогінений
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable(); // Зовнішній доступ до потоку даних користувача
  public isAuthenticated$: Observable<boolean>; // Потік для перевірки, чи залогінений користувач
  public isAdmin$: Observable<boolean> = this.currentUser$.pipe(
    map(user => user?.role === 'ADMIN' || false)
  );

  // URL твого бекенду (заміни на реальні)
  private apiUrl = 'http://localhost:3000/api/auth'; // Приклад

  constructor(private http: HttpClient, private router: Router) {
    this.isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());
    this.loadCurrentUser(); // Спробувати завантажити користувача при старті сервісу
  }

  // Отримати поточне значення користувача (для синхронного доступу, якщо потрібно)
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  private loadCurrentUser(): void {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');

    if (token && userId && username && email) {
        this.currentUserSubject.next({
            id: userId,
            username: username,
            email: email,
            role: role || 'ADMIN' // Set default role if not stored
        });
        (this.isAuthenticated$ as BehaviorSubject<boolean>).next(true);
    } else {
        this.clearAuthData();
    }
  }

  register(userData: any): Observable<AuthResponse> {
    // В реальному додатку тут буде POST запит на твій бекенд
    // return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
    //   tap(response => {
    //     this.setAuthData(response);
    //   }),
    //   catchError(this.handleError)
    // );

    // ЗАГЛУШКА для реєстрації
    console.log('Registering user:', userData);
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        if (userData.email === 'test@test.com') { // Імітація вже існуючого користувача
          observer.error({ message: 'User with this email already exists' });
          return;
        }
        const mockResponse: AuthResponse = {
          token: 'mock-jwt-token-register',
          userId: 'user-' + Math.random().toString(36).substr(2, 9),
          username: userData.username || userData.email.split('@')[0],
          email: userData.email
        };
        this.setAuthData(mockResponse);
        observer.next(mockResponse);
        observer.complete();
      }, 1000);
    });
  }

  login(credentials: any): Observable<AuthResponse> {
    // В реальному додатку тут буде POST запит на твій бекенд
    // return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
    //   tap(response => {
    //     this.setAuthData(response);
    //   }),
    //   catchError(this.handleError)
    // );

    // ЗАГЛУШКА для логіну
    console.log('Logging in with:', credentials);
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        if (credentials.email === 'user@example.com' && credentials.password === 'password123') {
          const mockResponse: AuthResponse = {
            token: 'mock-jwt-token-login',
            userId: 'user-123',
            username: 'TestUser',
            email: credentials.email
          };
          this.setAuthData(mockResponse);
          observer.next(mockResponse);
          observer.complete();
        } else {
          observer.error({ message: 'Invalid credentials' });
        }
      }, 1000);
    });
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']); // Перенаправлення на сторінку логіну
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('userId', response.userId);
    localStorage.setItem('username', response.username);
    localStorage.setItem('email', response.email);
    localStorage.setItem('role', response.role || ''); // Add this line

    this.currentUserSubject.next({
      id: response.userId,
      username: response.username,
      email: response.email,
      role: response.role || 'USER' // Set default role if not provided
    });
    (this.isAuthenticated$ as BehaviorSubject<boolean>).next(true);
  }

  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    this.currentUserSubject.next(null);
    (this.isAuthenticated$ as BehaviorSubject<boolean>).next(false);
  }

  // Базова обробка помилок (можна розширити)
  // private handleError(error: HttpErrorResponse) {
  //   console.error('AuthService error:', error);
  //   let errorMessage = 'An unknown error occurred!';
  //   if (error.error instanceof ErrorEvent) {
  //     // Клієнтська помилка
  //     errorMessage = `Error: ${error.error.message}`;
  //   } else {
  //     // Серверна помилка
  //     errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
  //     if (error.error && error.error.message) {
  //       errorMessage = error.error.message;
  //     }
  //   }
  //   return throwError(() => new Error(errorMessage));
  // }
}