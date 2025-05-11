// src/app/models/review.model.ts
export interface Review {
  id: number;         // ID самого відгуку
  bookId: number;     // ID книги, до якої відноситься відгук
  userId: string;     // ID користувача, що залишив відгук
  username: string;   // Ім'я користувача (можна отримувати з User-об'єкта)
  rating: number;     // Рейтинг (наприклад, від 1 до 5)
  comment: string;    // Текст відгуку
  createdAt: Date;    // Дата створення відгуку
  // Можна додати інші поля, наприклад, userAvatarUrl
}

// Інтерфейс для створення нового відгуку (без id, userId, createdAt - вони генеруються на бекенді або встановлюються в сервісі)
export interface NewReview {
  bookId: number;
  rating: number;
  comment: string;
  // userId буде додано в сервісі з поточного залогіненого користувача
}