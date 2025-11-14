import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private baseUrl = 'http://localhost:8081/cart';

  // 🔥 BehaviorSubject for instant cart count update across all pages
  private cartCountSource = new BehaviorSubject<number>(
    Number(sessionStorage.getItem('cartCount')) || 0
  );

  cartCount$ = this.cartCountSource.asObservable();

  constructor(private http: HttpClient) {}

  // ============================
  // 🟢 CART COUNT FUNCTIONS
  // ============================
  updateCartCount(count: number) {
    sessionStorage.setItem('cartCount', String(count));
    this.cartCountSource.next(count); // 🔥 instantly updates navbar + pages
  }

  incrementCartCount() {
    let current = Number(sessionStorage.getItem('cartCount')) || 0;
    current++;
    this.updateCartCount(current);
  }

  resetCartCount() {
    this.updateCartCount(0);
  }

  // ============================
  // 🟩 CART API METHODS
  // ============================

  addToCart(cartItem: any): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/addtocart`, cartItem)
      .pipe(catchError(this.handleError));
  }

  getCartItems(uid: number): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/getcart/${uid}`)
      .pipe(catchError(this.handleError));
  }

  deleteCartItem(cartId: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/deletecart/${cartId}`)
      .pipe(catchError(this.handleError));
  }

  updateCartItem(cartId: number, updatedItem: any) {
    return this.http.put(`${this.baseUrl}/putcart/${cartId}`, updatedItem);
  }

  clearCart(uid: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/clear/${uid}`, {
      responseType: 'text',
    });
  }

  // ============================
  // 🔴 ERROR HANDLER
  // ============================
  private handleError(error: HttpErrorResponse) {
    console.error('🛑 CartService Error:', error);
    return throwError(
      () => new Error(error.message || 'Something went wrong!')
    );
  }
}
