// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UiStateService } from './services/ui-state.service';
import { AuthService} from './services/auth.service'; // <--- 1. ІМПОРТУЙ 'User' з AuthService
import { User } from './models/user.model'; // <--- 1. ІМПОРТУЙ 'User' з Auth
import { Router } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CartService } from './services/cart.service'; // <--- 1. ІМПОРТУЙ 'CartComponent' з CartService


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('dropdownAnimation', [
      state('void', style({ opacity: 0, transform: 'translateY(-10px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void <=> *', animate('200ms ease-in-out'))
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  searchQuery: string = '';
  showSearchBar$!: Observable<boolean>;

    
  cartItemCount$: Observable<number> = of(0);

  isProfileDropdownOpen = false;
  // username: string | null = 'Ket Jer'; // <--- 2. ЦЮ ЗАГЛУШКУ МИ ЗАМІНИМО
  username: string | null = 'Profile'; // Або інше значення за замовчуванням для незалогіненого
  isAuthenticated = false; // <--- 3. ДОДАЙ ЗМІННУ ДЛЯ СТАНУ АВТЕНТИФІКАЦІЇ

  private closeDropdownTimeout: any;
  private authSubscription!: Subscription;

  constructor(
    private uiStateService: UiStateService,
    public authService: AuthService, // <--- 4. РОЗКОМЕНТУЙ ТА ЗРОБИ PUBLIC для використання в шаблоні (*ngIf="authService.isAuthenticated$ | async")
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.showSearchBar$ = this.uiStateService.showSearchBar$;
     this.cartItemCount$ = this.cartService.getTotalItems();

    // --- 5. РОЗКОМЕНТУЙ ТА АДАПТУЙ БЛОК ПІДПИСКИ НА ЗМІНУ КОРИСТУВАЧА ---
    this.authSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.username = user.username; // Або user.email, або інше поле з твого інтерфейсу User
        this.isAuthenticated = true; // Користувач залогінений
      } else {
        this.username = 'Profile'; // Або "Login", якщо немає дропдауну для незалогінених
        this.isAuthenticated = false; // Користувач не залогінений
      }
    });
    // Примітка: Альтернативно, для *ngIf в шаблоні, ти можеш прямо використовувати
    // (authService.isAuthenticated$ | async) і (authService.currentUser$ | async)?.username
    // Це зменшить кількість коду в .ts файлі. `isAuthenticated` змінна тут може бути корисною для логіки всередині компонента.
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  searchBooks(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/books'], { queryParams: { search: this.searchQuery.trim() } });
    }
  }

  toggleProfileDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  openProfileDropdown(): void {
    this.cancelCloseDropdown();
    this.isProfileDropdownOpen = true;
  }

  closeProfileDropdownDebounced(): void {
    this.closeDropdownTimeout = setTimeout(() => {
      this.isProfileDropdownOpen = false;
    }, 200);
  }

  cancelCloseDropdown(): void {
    if (this.closeDropdownTimeout) {
      clearTimeout(this.closeDropdownTimeout);
    }
  }

  navigateToProfileTab(tab: string): void {
    this.router.navigate(['/profile'], { queryParams: { tab: tab } });
    this.isProfileDropdownOpen = false;
  }

  logout(): void {
    // --- 6. РОЗКОМЕНТУЙ ТА ВИКОРИСТОВУЙ РЕАЛЬНИЙ МЕТОД LOGOUT ---
    this.authService.logout(); // AuthService сам зробить навігацію після виходу
    this.isProfileDropdownOpen = false;
    // this.router.navigate(['/']); // Цей рядок може бути не потрібний, якщо AuthService робить навігацію
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.closeDropdownTimeout) {
      clearTimeout(this.closeDropdownTimeout);
    }
  }
}