import { Book } from './book.model'; // Припускаємо, що Book модель вже містить id, name, price, coverImageUrl

export interface CartItem {
  bookId: number;
  name: string;
  price: number;
  coverImageUrl?: string;
  quantity: number;
  // Можна додати інші поля з Book, якщо вони потрібні в кошику,
  // наприклад, автор, щоб не робити зайвих запитів
  // authorName?: string;
}