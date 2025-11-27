import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComboService {
  // private baseUrl = 'http://0.0.0.0:8081';
  private baseUrl = 'https://ecommerce-backenc.onrender.com';

  constructor(private http: HttpClient) {}

  // ---------------------------
  // COMBO APIs (Same style as Perfume APIs)
  // ---------------------------

  // ⭐ Get all combos
  getAllCombo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/combo/getallcombo`);
  }

  // ⭐ Get combos by gender
  getComboByGender(gender: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/combo/getcombo/${gender}`);
  }

  // ⭐ Get combos by name (search)
  getComboByName(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/combo/getcomboname/?name=${name}`);
  }

  // ⭐ Get combo by ID
  getComboById(cid: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/combo/getcombobyid/${cid}`);
  }
}
