// src/app/components/profile/profile.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators'; // Додаємо оператори

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  activeTab: string = 'overview'; // Вкладка за замовчуванням
  private queryParamsSubscription!: Subscription;
  private validTabs = ['overview', 'orders', 'wishlist', 'settings'];

  // Поля для даних профілю (якщо вони завантажуються тут)
  profileImageUrl: string = 'assets/user-icon.png';
  profileName: string = 'John Doe'; // Заміни на реальні дані або логіку завантаження
  profileEmail: string = 'johndoe@example.com';

  constructor(
    private activatedRoute: ActivatedRoute, // Перейменував для ясності
    private router: Router
  ) { }

  ngOnInit(): void {
    // this.loadUserProfileData(); // Якщо дані профілю завантажуються тут

    this.queryParamsSubscription = this.activatedRoute.queryParams.pipe(
      map(params => params['tab']), // Отримуємо тільки параметр 'tab'
      distinctUntilChanged()      // Обробляємо, тільки якщо 'tab' дійсно змінився
    ).subscribe(tabFromQuery => {
      if (tabFromQuery && this.validTabs.includes(tabFromQuery)) {
        this.activeTab = tabFromQuery;
      } else {
        // Якщо параметр 'tab' відсутній, невалідний, або ми просто зайшли на /profile
        // Встановлюємо вкладку за замовчуванням ('overview') і оновлюємо URL,
        // щоб він відповідав активній вкладці.
        // Це також спрацює при першому заході на /profile без параметрів.
        if (this.router.url.startsWith('/profile')) {
            // Якщо поточний активний таб не 'overview', або tabFromQuery був, але невалідний
            if (this.activeTab !== 'overview' || (tabFromQuery && !this.validTabs.includes(tabFromQuery))) {
                 this.router.navigate([], {
                    relativeTo: this.activatedRoute,
                    queryParams: { tab: 'overview' },
                    queryParamsHandling: 'merge', // 'merge' щоб зберегти інші параметри, або null/'' щоб перезаписати
                });
                // Підписка автоматично зловить цю зміну URL і встановить activeTab = 'overview'
            } else if (!tabFromQuery) { // Якщо зайшли на /profile без ?tab=...
                 this.router.navigate([], { // Встановлюємо ?tab=overview в URL
                    relativeTo: this.activatedRoute,
                    queryParams: { tab: this.activeTab }, // this.activeTab тут 'overview' за замовчуванням
                    queryParamsHandling: 'merge',
                });
            }
        }
      }
    });
  }

  // Метод, який викликається кнопками вкладок всередині profile.component.html
  public selectTab(tabName: string): void {
    if (this.validTabs.includes(tabName)) {
      // this.activeTab = tabName; // Встановлюється автоматично через підписку на queryParams
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { tab: tabName },
        queryParamsHandling: 'merge',
      });
    }
  }

  onEditProfile(): void {
    this.selectTab('settings'); // Перехід на вкладку налаштувань при кліку "Edit Profile"
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  // loadUserProfileData(): void {
  //   // Тут може бути твоя логіка завантаження даних користувача (ім'я, email, аватар)
  //   // наприклад, через сервіс
  // }
}