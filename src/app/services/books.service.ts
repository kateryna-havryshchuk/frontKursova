import { Injectable } from '@angular/core';
import { Book } from '../models/book.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  baseApiUrl: string = "http://localhost:7031";

  constructor(private http: HttpClient) { }

  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.baseApiUrl + '/api/Book');
  }

  addBook(newBook: Book): Observable<Book> {
    newBook.id = 0;
    return this.http.post<Book>(this.baseApiUrl + '/api/Book', newBook);
  }
  
  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(this.baseApiUrl + '/api/Book/' + id);
  }
  
  updateBook(id: number, updateBookRequest: Book): Observable<Book> {
    return this.http.put<Book>(this.baseApiUrl + '/api/Book/', updateBookRequest);
  }
  
  deleteBook(id: number): Observable<Book> {
    return this.http.delete<Book>(this.baseApiUrl + '/api/Book/' + id);
  } 
}