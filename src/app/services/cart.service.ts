import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private baseUrl = 'http://localhost:8081/cart'; // Backend base URL

  constructor(private http: HttpClient) {}

  // 🧩 Add item to cart
  addToCart(cartItem: any): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/addtocart`, cartItem)
      .pipe(catchError(this.handleError));
  }

  // 📦 Get all cart items for a specific user
  getCartItems(uid: number): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/getcart/${uid}`)
      .pipe(catchError(this.handleError));
  }

  // ❌ Delete item by cart ID
  deleteCartItem(cartId: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/deletecart/${cartId}`)
      .pipe(catchError(this.handleError));
  }

  updateCartItem(cartId: number, updatedItem: any) {
    return this.http.put(`${this.baseUrl}/putcart/${cartId}`, updatedItem);
  }

  // Clear entire cart for a user
  clearCart(uid: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/clear/${uid}`, {
      responseType: 'text',
    });
  }

  // ⚙️ Handle backend errors
  private handleError(error: HttpErrorResponse) {
    console.error('🛑 CartService Error:', error);
    return throwError(
      () => new Error(error.message || 'Something went wrong!')
    );
  }
}
