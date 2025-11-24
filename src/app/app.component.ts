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

  constructor(private router: Router, private cartService: CartService) {}

  ngOnInit(): void {
    // ✅ Load username safely
    this.updateUsername();

    // ✅ Subscribe to cartCount observable for real-time updates
    this.cartService.cartCount$.subscribe((count) => {
      this.cartCount = count;
    });

    // ✅ Load cart count immediately if user is logged in
    this.loadCartCount();

    // ✅ Update username and cart count on route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateUsername();
        this.loadCartCount();
      }
    });
  }

  // ✅ Safe username retrieval
  updateUsername(): void {
    if (typeof window !== 'undefined') {
      this.username = sessionStorage.getItem('username');
    }
  }

  // ✅ Fetch cart items count for logged-in user and update BehaviorSubject
  loadCartCount(): void {
    if (typeof window === 'undefined') return;

    const uidStr = sessionStorage.getItem('uid');
    const uid = uidStr ? Number(uidStr) : null;

    if (uid) {
      this.cartService.getCartItems(uid).subscribe({
        next: (cartItems: any[]) => {
          this.cartService.setCartCount(cartItems.length); // update count reactively
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

    // ✅ Reset cart count on logout
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
