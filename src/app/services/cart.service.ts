import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private baseUrl = 'http://localhost:8081/cart';

  // ✅ BehaviorSubject with safe sessionStorage check
  private initialCount = (() => {
    if (typeof window !== 'undefined') {
      return Number(sessionStorage.getItem('cartCount')) || 0;
    }
    return 0; // SSR fallback
  })();

  private cartCountSubject = new BehaviorSubject<number>(this.initialCount);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ======================================================
  // 📌 UPDATE CART COUNT SAFELY (NO DIRECT sessionStorage)
  // ======================================================
  setCartCount(count: number) {
    this.cartCountSubject.next(count);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cartCount', String(count));
    }
  }

  incrementCartCount() {
    const newCount = this.cartCountSubject.value + 1;
    this.setCartCount(newCount);
  }

  resetCartCount() {
    this.setCartCount(0);
  }

  // ======================================================
  // 🧩 BACKEND APIs
  // ======================================================
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

  // ======================================================
  // ⚠️ ERROR HANDLER
  // ======================================================
  private handleError(error: HttpErrorResponse) {
    console.error('🛑 CartService Error:', error);
    return throwError(
      () => new Error(error.message || 'Something went wrong!')
    );
  }
}
