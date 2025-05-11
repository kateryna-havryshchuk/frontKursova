import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private showSearchBarSubject = new BehaviorSubject<boolean>(true);
  public showSearchBar$: Observable<boolean> = this.showSearchBarSubject.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        // Перевіряємо, чи активний маршрут або його батьківські маршрути є 'profile'
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        // Альтернативно, можна перевіряти URL: event.urlAfterRedirects.startsWith('/profile')
        // Але перевірка компонента може бути надійнішою, якщо URL складні
        // Тут ми будемо використовувати дані маршруту (route data)
        return route.snapshot.data?.['hideSearchBar'] === true;
      })
    ).subscribe(hideBar => {
      this.showSearchBarSubject.next(!hideBar);
    });
  }

  // Можна додати методи для явного керування, якщо потрібно
  // public setShowSearchBar(show: boolean): void {
  //   this.showSearchBarSubject.next(show);
  // }
}