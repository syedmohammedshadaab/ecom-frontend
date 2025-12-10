import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CartService } from './services/cart.service';

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

  // ✅ Add this: Controls footer visibility
  showFooter: boolean = true;

  constructor(private router: Router, private cartService: CartService) {}

  ngOnInit(): void {
    this.updateUsername();

    this.cartService.cartCount$.subscribe((count) => {
      this.cartCount = count;
    });

    this.loadCartCount();

    // 🔥 Update username, cart count, and footer visibility on route change
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateUsername();
        this.loadCartCount();

        // ✅ Hide footer for login & signup pages
        const currentUrl = event.urlAfterRedirects;
        this.showFooter = !(currentUrl === '/login' || currentUrl === '/signup');
      }
    });
  }

  updateUsername(): void {
    if (typeof window !== 'undefined') {
      this.username = sessionStorage.getItem('username');
    }
  }

  loadCartCount(): void {
    if (typeof window === 'undefined') return;

    const uidStr = sessionStorage.getItem('uid');
    const uid = uidStr ? Number(uidStr) : null;

    if (uid) {
      this.cartService.getCartItems(uid).subscribe({
        next: (cartItems: any[]) => {
          this.cartService.setCartCount(cartItems.length);
        },
        error: (err) => {
          console.error('Error fetching cart count:', err);
        },
      });
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
    this.cartService.resetCartCount();

    this.router.navigate(['/login']);
  }

  closeNavbar() {
    const navbar = document.getElementById('navbarNav');
    if (navbar?.classList.contains('show')) {
      navbar.classList.remove('show');
    }
  }
}
