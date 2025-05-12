// src/app/components/book/book.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Book } from '../../models/book.model';
import { CartService } from '../../services/cart.service'; // <--- ІМПОРТУЄМО CartService
import { Router } from '@angular/router'; // Додайте імпорт Router

@Component({
  selector: 'app-book', // Або твій селектор
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {
  books$: Observable<Book[]> = of([]);
  isLoadingBooks = true;

  // Заглушка для BooksService (використовуй свій реальний сервіс)
  private mockBooksService = {
    getBooks: (): Observable<Book[]> => {
      const mockBooksData: Book[] = [
        { id: 1, name: 'The Great Gatsby', price: 19.99, author: {id: 1, name: 'F. Scott Fitzgerald'}, coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81QuEGw8VPL.jpg', genreName: 'Classic', numberOfPages:180, publicationYear:1925, publisher: 'Scribner' },
        { id: 2, name: 'To Kill a Mockingbird', price: 24.50, author: {id: 2, name: 'Harper Lee'}, coverImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg/1200px-To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg', genreName: 'Classic', numberOfPages:281, publicationYear:1960, publisher: 'J.B. Lippincott & Co.' },
        { id: 3, name: '1984', price: 15.00, author: {id: 3, name: 'George Orwell'}, coverImageUrl: 'https://neelkanthpublishers.com/assets/bookcover_cover.png', genreName: 'Dystopian', numberOfPages:328, publicationYear:1949, publisher: 'Secker & Warburg' },
      ];
      return of(mockBooksData).pipe(delay(300));
    }
  };

  constructor(
    private cartService: CartService,    // <--- ІНЖЕКТУЄМО CartService
    private router: Router               // Інжектуємо Router
  ) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoadingBooks = true;
    // this.books$ = this.booksService.getBooks();
    this.books$ = this.mockBooksService.getBooks(); // Використовуємо заглушку
    this.books$.subscribe({
        next: () => this.isLoadingBooks = false,
        error: () => this.isLoadingBooks = false
    });
  }

  // НОВИЙ МЕТОД для додавання книги в кошик
  onAddToCart(book: Book, event: MouseEvent): void {
    event.stopPropagation(); // Зупиняємо спливання події, якщо картка книги клікабельна
    this.cartService.addItem(book);
    // Тут ти можеш додати сповіщення для користувача (наприклад, toast message)
    alert(`"${book.name}" added to your cart!`); // Просте сповіщення
    console.log('Added to cart from book list:', book);
  }

  // Метод для переходу на деталі книги (якщо картка клікабельна)
  viewBookDetails(bookId: number | undefined): void {
    if (bookId) {
      this.router.navigate([`/book/${bookId}`]); // Переконайся, що тут bookId правильний
    }
  }

  toggleWishlist(book: Book, event: MouseEvent): void {
    event.stopPropagation(); // Prevent card click event
    book.isInWishlist = !book.isInWishlist; // Toggle wishlist state
    
    // Here you would typically call a wishlist service
    // this.wishlistService.toggleWishlist(book.id).subscribe();
    
    console.log(`${book.isInWishlist ? 'Added to' : 'Removed from'} wishlist:`, book.name);
  }
}