import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
})
export class AppComponent implements OnInit {
  username: string | null = null;
  showLogoutConfirm = false;
  cartCount: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateUsername();
    this.updateCartCount();

    // Refresh username + cart count on route change
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateUsername();
        this.updateCartCount();
      }
    });
  }

  // ✅ Safe check for sessionStorage (avoids SSR error)
  updateUsername(): void {
    if (typeof window !== 'undefined') {
      this.username = sessionStorage.getItem('username');
    }
  }

  // 📌 Reads totalCartCount from sessionStorage
  updateCartCount(): void {
    if (typeof window !== 'undefined') {
      const count = sessionStorage.getItem('cartCount');
      this.cartCount = count ? Number(count) : 0;
    }
  }

  confirmLogout(): void {
    this.showLogoutConfirm = true;
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }

    this.username = null;
    this.cartCount = 0;
    this.showLogoutConfirm = false;

    this.router.navigate(['/login']);
  }
}
