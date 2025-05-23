import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1), // Беремо перше значення і відписуємось
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true; // Дозволяємо доступ
      } else {
        router.navigate(['/login']); // Перенаправляємо на логін, якщо не автентифікований
        return false; // Забороняємо доступ
      }
    })
  );
};