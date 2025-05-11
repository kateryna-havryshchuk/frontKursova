import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem } from '../models/cart-item.model';
import { Book } from '../models/book.model'; // Потрібна для методу addItem

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  private readonly CART_STORAGE_KEY = 'myUserCart'; // Ключ для localStorage

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    if (storedCart) {
      this.itemsSubject.next(JSON.parse(storedCart));
    }
  }

  private saveCartToStorage(): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.itemsSubject.value));
  }

  addItem(book: Book, quantity: number = 1): void {
    const currentItems = this.itemsSubject.value;
    const existingItemIndex = currentItems.findIndex(item => item.bookId === book.id);

    if (existingItemIndex > -1) {
      // Книга вже в кошику, збільшуємо кількість
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += quantity;
      this.itemsSubject.next(updatedItems);
    } else {
      // Нова книга в кошику
      const newItem: CartItem = {
        bookId: book.id,
        name: book.name,
        price: book.price,
        coverImageUrl: book.coverImageUrl || 'assets/images/book_placeholder.png', // Плейсхолдер, якщо немає обкладинки
        quantity: quantity
        // authorName: book.author?.name // Якщо потрібно
      };
      this.itemsSubject.next([...currentItems, newItem]);
    }
    this.saveCartToStorage();
    // Тут можна додати сповіщення для користувача
    console.log(`${book.name} added to cart. Current cart:`, this.itemsSubject.value);
  }

  updateItemQuantity(bookId: number, newQuantity: number): void {
    const currentItems = this.itemsSubject.value;
    const itemIndex = currentItems.findIndex(item => item.bookId === bookId);

    if (itemIndex > -1 && newQuantity > 0) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex].quantity = newQuantity;
      this.itemsSubject.next(updatedItems);
      this.saveCartToStorage();
    } else if (itemIndex > -1 && newQuantity <= 0) {
      // Якщо кількість 0 або менше, видаляємо товар
      this.removeItem(bookId);
    }
  }

  removeItem(bookId: number): void {
    const updatedItems = this.itemsSubject.value.filter(item => item.bookId !== bookId);
    this.itemsSubject.next(updatedItems);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.itemsSubject.next([]);
    this.saveCartToStorage();
  }

  getTotalItems(): Observable<number> {
    return this.items$.pipe(
      map(items => items.reduce((sum, item) => sum + item.quantity, 0))
    );
  }

  getTotalAmount(): Observable<number> {
    return this.items$.pipe(
      map(items => items.reduce((sum, item) => sum + (item.price * item.quantity), 0))
    );
  }

  // Для прямого доступу, якщо потрібно (наприклад, в гард для checkout)
  getCurrentCartItems(): CartItem[] {
    return this.itemsSubject.value;
  }
}