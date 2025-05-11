// src/app/models/book.model.ts
import { Author } from './author.model';
import { Genre } from './genre.model';

export interface Book {
  id: number;
  name: string;
  price: number;
  language?: string;
  publisher?: string; // Додамо видавництво
  numberOfPages: number;
  publicationYear: number; // Числовий рік
  isbn?: string;
  description?: string;
  coverImageUrl?: string;

  // Для зв'язків
  authorId?: number;    // ID існуючого автора
  author?: Author;      // Об'єкт автора (може завантажуватися окремо або разом з книгою)
  genreId?: number;     // ID існуючого жанру
  genreName?: string;   // Назва жанру (може бути корисною, якщо genreId)
                        // або замість genreName можна використовувати genre?: Genre;
  isInWishlist?: boolean;
}