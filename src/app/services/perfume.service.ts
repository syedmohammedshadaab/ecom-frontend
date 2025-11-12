import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PerfumeService {
  private baseUrl = 'http://localhost:8081'; // ✅ your Spring Boot backend URL

  constructor(private http: HttpClient) {}

  // ✅ Get all perfumes
  getallperfume(): Observable<any> {
    return this.http.get(`${this.baseUrl}/perfume/getallperfume`);
  }

  // ✅ Get perfumes by gender (optional API)
  getperfumeByGender(gender: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/getperfume/${gender}`);
  }

  // ✅ Add perfume to cart
  addtocart(cartItem: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cart/addtocart`, cartItem);
  }

  // ✅ (Optional) Get cart items by user ID
  getCartItems(uid: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/cart/getcart/${uid}`);
  }

  // ✅ (Optional) Remove item from cart
  removeFromCart(cartId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deletecart/${cartId}`);
  }
}
