// src/app/components/profile/overview/profile-overview.component.ts
import { Component, OnInit } from '@angular/core';
// import { StatisticsService } from '../../../services/statistics.service'; // Сервіс для отримання статистики

interface StatItem {
  value: number | string;
  label: string;
}

@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.css'] // Можеш додати, якщо потрібні специфічні стилі
})
export class ProfileOverviewComponent implements OnInit {
  welcomeMessage: string = "Welcome back!"; // Можна персоналізувати
  accountSummaryText: string = "Here’s a quick summary of your account.";
  
  overviewStats: StatItem[] = [];
  isLoading: boolean = true;

  constructor(/*private statsService: StatisticsService*/) { }

  ngOnInit(): void {
    this.loadOverviewStats();
  }

  loadOverviewStats(): void {
    this.isLoading = true;
    // Приклад отримання даних. Заміни на реальний виклик сервісу
    // const userId = 'currentUserId'; // Отримати ID
    // this.statsService.getUserStats(userId).subscribe(
    //   (data) => {
    //     this.welcomeMessage = `Welcome back, ${data.username || 'User'}!`; // Якщо сервіс повертає ім'я
    //     this.overviewStats = [
    //       { value: data.booksPurchased || 0, label: 'Books Purchased' },
    //       { value: data.booksInWishlist || 0, label: 'Books in Wishlist' },
    //       { value: data.pendingOrders || 0, label: 'Pending Orders' }
    //     ];
    //     this.isLoading = false;
    //   },
    //   (error) => {
    //     console.error('Error loading overview stats:', error);
    //     // Заглушка у випадку помилки
    //     this.overviewStats = [
    //       { value: 'N/A', label: 'Books Purchased' },
    //       { value: 'N/A', label: 'Books in Wishlist' },
    //       { value: 'N/A', label: 'Pending Orders' }
    //     ];
    //     this.isLoading = false;
    //   }
    // );

    // Заглушка, поки немає сервісу:
    setTimeout(() => {
        this.overviewStats = [
          { value: 5, label: 'Books Purchased' },
          { value: 3, label: 'Books in Wishlist' },
          { value: 2, label: 'Pending Orders' }
        ];
        this.isLoading = false;
    }, 1000);
  }
}