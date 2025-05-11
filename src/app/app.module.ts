import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <--- ДОДАЙ ReactiveFormsModule сюди в імпорти з @angular/forms

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookComponent } from './components/book/book.component';
import { AddBookComponent } from './components/add-book/add-book.component';
import { EditBookComponent } from './components/edit-book/edit-book.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileOverviewComponent } from './components/profile/profile-overview/profile-overview.component'; // Перевір правильність шляху
import { ProfileOrdersComponent } from './components/profile/profile-orders/profile-orders.component';     // Перевір правильність шляху
import { ProfileWishlistComponent } from './components/profile/profile-wishlist/profile-wishlist.component'; // Перевір правильність шляху
import { ProfileSettingsComponent } from './components/profile/profile-settings/profile-settings.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { CartComponent } from './components/cart/cart.component'; // Перевір правильність шляху

@NgModule({
  declarations: [
    AppComponent,
    BookComponent,
    AddBookComponent,
    EditBookComponent,
    BookDetailsComponent,
    ProfileComponent,
    ProfileOverviewComponent,
    ProfileOrdersComponent,
    ProfileWishlistComponent,
    ProfileSettingsComponent,
    LoginComponent,
    RegisterComponent,
    CartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule // <--- ДОДАЙ ReactiveFormsModule сюди в масив imports
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }