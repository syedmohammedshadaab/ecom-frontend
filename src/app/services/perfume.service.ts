import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PerfumeService {
  private baseUrl = 'http://localhost:8081';

  // ⭐ Cart Counter BehaviorSubject
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  constructor(private http: HttpClient) {}

  // ⭐ Update cart count
  updateCartCount(count: number) {
    this.cartCount.next(count);
  }

  // ⭐ Refresh cart count from DB
  refreshCartCount(uid: number) {
    this.getCartItems(uid).subscribe((items) => {
      this.updateCartCount(items.length);
    });
  }

  // ---------------------------
  // PERFUME APIs
  // ---------------------------
  getallperfume(): Observable<any> {
    return this.http.get(`${this.baseUrl}/perfume/getallperfume`);
  }

  getperfumeByGender(gender: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/getperfume/${gender}`);
  }

  getPerfumeById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/perfume/getperfumebyid/${id}`);
  }

  // ---------------------------
  // CART APIs
  // ---------------------------

  // ⭐ Add to cart + update cart count automatically
  addtocart(cartItem: any): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/cart/addtocart`, cartItem, {
        responseType: 'text',
      })
      .pipe(
        tap(() => {
          if (cartItem.uid) {
            this.refreshCartCount(cartItem.uid);
          }
        })
      );
  }

  // Get cart items
  getCartItems(uid: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/cart/getcart/${uid}`);
  }

  // Delete from cart + refresh count
  removeFromCart(cartId: number, uid: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/deletecart/${cartId}`, {
        responseType: 'text',
      })
      .pipe(
        tap(() => this.refreshCartCount(uid))
      );
  }
}
