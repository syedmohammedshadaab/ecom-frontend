import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly BASE_URL = 'http://localhost:8081/user'; // ✅ Match your backend port

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

    // Save full user object
    localStorage.setItem('user', JSON.stringify(user));

    // Save essential fields separately for fast access
    if (user.uid) sessionStorage.setItem('uid', String(user.uid));
    if (user.name) sessionStorage.setItem('name', user.name);
    if (user.email) sessionStorage.setItem('email', user.email);
  }

  /** Get complete user object */
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /** Get logged-in user ID */
  getUserId(): number | null {
    const uid = sessionStorage.getItem('uid');
    return uid ? Number(uid) : null;
  }

  /** Check if user is logged in */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  /** Logout user (clears both storages) */
  logout(): void {
    localStorage.removeItem('user');
    sessionStorage.clear();
  }
}
