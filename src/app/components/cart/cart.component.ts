import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from '../../services/cart.service'; // Адаптуй шлях
import { CartItem } from '../../models/cart-item.model';   // Адаптуй шлях

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  totalAmount$: Observable<number>;
  totalItems$: Observable<number>;

  constructor(public cartService: CartService, private router: Router) { // Зробив cartService public для шаблону
    this.cartItems$ = this.cartService.items$;
    this.totalAmount$ = this.cartService.getTotalAmount();
    this.totalItems$ = this.cartService.getTotalItems();
  }

  ngOnInit(): void {
    // Можна завантажити дані кошика тут, якщо сервіс не робить це автоматично при ініціалізації
    // this.cartService.loadCartFromStorage(); // Вже викликається в конструкторі сервісу
  }

  updateQuantity(item: CartItem, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let newQuantity = parseInt(inputElement.value, 10);

    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1; // Мінімальна кількість
      inputElement.value = newQuantity.toString(); // Оновлюємо значення в інпуті
    }
    this.cartService.updateItemQuantity(item.bookId, newQuantity);
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateItemQuantity(item.bookId, item.quantity + 1);
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateItemQuantity(item.bookId, item.quantity - 1);
    } else {
      // Якщо кількість 1 і натискають мінус, можна видалити або нічого не робити
      // Для видалення: this.removeItem(item.bookId);
    }
  }

  removeItem(bookId: number): void {
    if (confirm('Are you sure you want to remove this item from your cart?')) { // Просте підтвердження
      this.cartService.removeItem(bookId);
    }
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      this.cartService.clearCart();
    }
  }

  proceedToCheckout(): void {
    // Перевірка, чи кошик не порожній
    const currentItems = this.cartService.getCurrentCartItems();
    if (currentItems.length === 0) {
        alert("Your cart is empty. Please add some items before proceeding to checkout.");
        return;
    }
    // Перенаправлення на сторінку оформлення замовлення (поки що заглушка)
    this.router.navigate(['/checkout']); // Потрібно буде створити цей маршрут та компонент
    console.log('Proceeding to checkout with items:', currentItems);
  }

  continueShopping(): void {
    this.router.navigate(['/books']); // Або на головну сторінку каталогу
  }
}