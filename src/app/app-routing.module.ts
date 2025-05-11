import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookComponent } from './components/book/book.component';
import { AddBookComponent } from './components/add-book/add-book.component';
import { EditBookComponent } from './components/edit-book/edit-book.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { authGuard } from './services/auth.guard'; // Додай тут свій authGuard
import { CartComponent } from './components/cart/cart.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/books', pathMatch: 'full'
  },
  {
    path: 'books',
    component: BookComponent
  },
  {
    path: 'books/add',
    component: AddBookComponent,
    data: { hideSearchBar: true }
  },
  {
    path: 'books/edit/:id',
    component: EditBookComponent,
    data: { hideSearchBar: true }
  },
  { path: 'login', 
    component: LoginComponent,
    data: { hideSearchBar: true }
  },
  { path: 'register',
    component: RegisterComponent,
    data: { hideSearchBar: true }
  },
  {
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [authGuard], // Додай тут свій authGuard
    data: { hideSearchBar: true }
  },
  {
    path: 'cart',
    component: CartComponent
  },
  // {
  //   path: 'checkout',
  //   component: CheckoutPlcaceholderComponent // Замініть на свій компонент
  // },
  { 
    path: 'book/:id',
    component: BookDetailsComponent,
    data: { hideSearchBar: true }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
