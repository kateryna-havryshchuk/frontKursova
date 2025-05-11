// src/app/components/profile/profile-wishlist/profile-wishlist.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs'; // Subject тут не використовується, тому прибрав
import { delay } from 'rxjs/operators';

// Переконайся, що шляхи до моделей правильні
import { Book } from '../../../models/book.model'; // Твій інтерфейс Book
import { Author } from '../../../models/author.model'; // Твій інтерфейс Author
import { CartService } from '../../../services/cart.service'; // <--- ІМПОРТ CartService
// import { WishlistService } from '../../../services/wishlist.service'; // Розкоментуй для реального сервісу

@Component({
  selector: 'app-profile-wishlist',
  templateUrl: './profile-wishlist.component.html',
  styleUrls: ['./profile-wishlist.component.css']
})
export class ProfileWishlistComponent implements OnInit {
  wishlistItems: Book[] = []; // Використовуємо твій інтерфейс Book
  isLoading: boolean = true;
  currentView: 'grid' | 'list' = 'grid';

  // Заглушка для WishlistService (залишається як була, або замінюється на реальний сервіс)
  private mockWishlistService = {
    getWishlistItems: (): Observable<Book[]> => {
      const mockBooks: Book[] = [
        {
          id: 1, name: 'The Great Gatsby', price: 19.99, language: 'English', numberOfPages: 180, publicationYear: 1925, publisher: 'Scribner',
          author: { id: 1, name: 'F. Scott Fitzgerald', biography: 'An American novelist...' },
          coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81QuEGw8VPL.jpg',
          genreName: 'Classic Fiction', genreId: 1, isbn: '978-0743273565', description: 'A novel...'
        },
        {
          id: 2, name: 'To Kill a Mockingbird', price: 24.50, language: 'English', numberOfPages: 281, publicationYear: 1960, publisher: 'J.B. Lippincott & Co.',
          author: { id: 2, name: 'Harper Lee', biography: '...' },
          coverImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg/1200px-To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg',
          genreName: 'Southern Gothic', genreId: 2, isbn: '978-0061120084', description: 'A novel by Harper Lee...'
        },
        // Додай інші книги сюди для тестування
      ];
      return of(mockBooks).pipe(delay(800));
    },
    removeItemFromWishlist: (bookId: number): Observable<any> => {
      console.log(`MockWishlistService: removing bookId ${bookId} from wishlist`);
      return of({ success: true }).pipe(delay(300));
    }
  };

  constructor(
    private router: Router,
    private cartService: CartService, // <--- ІНЖЕКТУЄМО CartService
    // private wishlistService: WishlistService // Розкоментуй для реального сервісу
  ) { }

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    // Заміни на this.wishlistService.getWishlistItems(), коли буде реальний сервіс
    this.mockWishlistService.getWishlistItems().subscribe({
      next: (items) => {
        this.wishlistItems = items;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading wishlist items:", err);
        this.isLoading = false;
      }
    });
  }

  setView(view: 'grid' | 'list'): void {
    this.currentView = view;
  }

  removeFromWishlist(bookId: number, event: MouseEvent): void {
    event.stopPropagation();
    console.log('Attempting to remove book from wishlist:', bookId);
    // Заміни на this.wishlistService.removeItemFromWishlist(bookId)
    this.mockWishlistService.removeItemFromWishlist(bookId).subscribe({
      next: () => {
        this.wishlistItems = this.wishlistItems.filter(item => item.id !== bookId);
        console.log('Book removed successfully from wishlist (mock)');
        // Тут можна додати сповіщення для користувача
      },
      error: (err) => {
        console.error('Error removing book from wishlist:', err);
      }
    });
  }

  navigateToBookDetails(bookId: number): void {
    this.router.navigate(['/book-details', bookId]);
  }

  navigateToBooks(): void {
    this.router.navigate(['/books']);
  }

  // Оновлений метод addToCart
  addToCart(bookId: number, event: MouseEvent): void {
    event.stopPropagation(); // Запобігаємо переходу на сторінку деталей книги
    
    const bookToAdd = this.wishlistItems.find(item => item.id === bookId);

    if (bookToAdd) {
      // Переконайся, що об'єкт bookToAdd містить усі необхідні поля для CartService.addItem()
      // (id, name, price, coverImageUrl)
      // Якщо твій інтерфейс Book вже містить ці поля, то все гаразд.
      this.cartService.addItem(bookToAdd); // Викликаємо метод сервісу кошика
      alert(`"${bookToAdd.name}" added to your cart!`); // Заміни на краще сповіщення
      console.log('Book added to cart:', bookToAdd);
    } else {
      console.error(`Book with ID ${bookId} not found in wishlist.`);
      alert(`Error: Could not add book to cart.`);
    }
  }
}