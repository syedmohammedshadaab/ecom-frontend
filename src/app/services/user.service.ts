import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // private readonly BASE_URL = 'http://0.0.0.0:8081/user';
  private readonly BASE_URL = 'https://ecommerce-backenc.onrender.com/user';
  constructor(private http: HttpClient) {}

  // =============================
  // 🟢 AUTHENTICATION METHODS
  // =============================

  /** Register a new user */
  registerUser(user: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/postuser`, user);
  }

  /** Login existing user */
  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/loginuser`, credentials);
  }

  // =============================
  // 🟢 LOCAL & SESSION STORAGE
  // =============================

  /** Save logged-in user details */
  setUser(user: any): void {
    if (!user) return;

    // SSR Check
    if (typeof window === 'undefined') return;

    localStorage.setItem('user', JSON.stringify(user));

    if (user.uid) sessionStorage.setItem('uid', String(user.uid));
    if (user.name) sessionStorage.setItem('name', user.name);
    if (user.email) sessionStorage.setItem('email', user.email);
  }

  /** Get complete user object */
  getUser(): any {
    if (typeof window === 'undefined') return null;

    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /** Get logged-in user ID */
  getUserId(): number | null {
    if (typeof window === 'undefined') return null;

    const uid = sessionStorage.getItem('uid');
    return uid ? Number(uid) : null;
  }

  /** Check if user is logged in */
  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;

    return !!localStorage.getItem('user');
  }

  /** Logout user */
  logout(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('user');
    sessionStorage.clear();
  }
}
