// src/app/components/profile/orders/profile-orders.component.ts
import { Component, OnInit } from '@angular/core';
// import { OrderService } from '../../../services/order.service'; // Сервіс для замовлень
// import { Order } from '../../../models/order.model'; // Модель замовлення

// Заглушка для моделі Order
export interface Order {
  id: string;
  orderNumber: string;
  status: 'Delivered' | 'Pending' | 'Shipped' | 'Cancelled';
  totalAmount: number;
  orderDate: Date;
  items?: any[]; // Деталі замовлення
}


@Component({
  selector: 'app-profile-orders',
  templateUrl: './profile-orders.component.html',
  styleUrls: ['./profile-orders.component.css']
})
export class ProfileOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading: boolean = true;
  selectedOrderDetails: Order | null = null;

  constructor(/*private orderService: OrderService*/) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    // Приклад отримання даних. Заміни на реальний виклик сервісу
    // const userId = 'currentUserId'; // Отримати ID
    // this.orderService.getOrdersByUserId(userId).subscribe(
    //   (data) => {
    //     this.orders = data;
    //     this.isLoading = false;
    //   },
    //   (error) => {
    //     console.error('Error loading orders:', error);
    //     this.orders = []; // Порожній масив у випадку помилки
    //     this.isLoading = false;
    //   }
    // );

    // Заглушка, поки немає сервісу:
    setTimeout(() => {
      this.orders = [
        { id: '1', orderNumber: '#12345', status: 'Delivered', totalAmount: 45.99, orderDate: new Date('2024-04-15') },
        { id: '2', orderNumber: '#12346', status: 'Pending', totalAmount: 29.99, orderDate: new Date('2024-05-01') },
        { id: '3', orderNumber: '#12347', status: 'Shipped', totalAmount: 78.50, orderDate: new Date('2024-05-05') }
      ];
      this.isLoading = false;
    }, 1000);
  }

  viewOrderDetails(order: Order): void {
    // Тут може бути логіка для завантаження повних деталей замовлення, якщо вони не завантажені одразу
    // Або просто відображення в модальному вікні/окремій секції
    this.selectedOrderDetails = order;
    console.log('Viewing details for order:', order.orderNumber);
    // Для прикладу, можна реалізувати модальне вікно або розгортання деталей тут
  }

  // profile-orders.component.ts
// ...
  closeOrderDetailsModal(event: MouseEvent): void {
    // Закриваємо, якщо клік був саме по оверлею, а не по його дочірнім елементам
    if (event.target === event.currentTarget) {
      this.selectedOrderDetails = null;
    }
  }
// ...

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'pending': return 'status-pending';
      case 'shipped': return 'status-shipped';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}