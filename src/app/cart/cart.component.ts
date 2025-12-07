import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: false,

  animations: [
    trigger('pageFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 }))
      ])
    ]),

    trigger('itemSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CartComponent implements OnInit {

  cartItems: any[] = [];
  totalPrice = 0;
  finalTotal = 0;

  couponCode = '';
  couponApplied = false;
  couponMessage = '';
  discount = 0;

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  uid: number | null = null;

  showConfirmModal = false;
  itemToDelete: number | null = null;

  showClearCartModal = false;

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.uid = this.userService.getUserId();

    if (this.uid) {
      this.loadCart();
    } else {
      this.showToastMessage('⚠️ Please log in to view your cart.', 'error');
      setTimeout(() => this.router.navigate(['/login']), 2000);
    }
  }

  loadCart(): void {
    if (!this.uid) return;

    this.cartService.getCartItems(this.uid).subscribe({
      next: (res) => {
        this.cartItems = res;
        this.calculateTotal();
        this.cartService.setCartCount(this.cartItems.length);
      },
      error: () => this.showToastMessage('❌ Failed to load cart.', 'error'),
    });
  }

  applyCoupon(): void {
    const code = this.couponCode.trim().toUpperCase();

    if (!code) {
      this.couponMessage = '⚠️ Please enter a coupon code.';
      return;
    }

    if (this.couponApplied) {
      this.couponMessage = '✔️ Coupon already applied.';
      return;
    }

    this.validateCoupon(code);
  }

  validateCoupon(code: string): void {
    if (code === 'PERFUME10') {
      this.discount = this.totalPrice * 0.1;
      this.couponMessage = '🎉 10% discount applied!';
      this.couponApplied = true;
    } else if (code === 'SAVE200') {
      if (this.totalPrice >= 1000) {
        this.discount = 200;
        this.couponMessage = '🎉 ₹200 discount applied!';
        this.couponApplied = true;
      } else {
        this.discount = 0;
        this.couponApplied = false;
        this.couponMessage = '❌ Total must be at least ₹1000 for SAVE200.';
      }
    } else {
      this.discount = 0;
      this.couponApplied = false;
      this.couponMessage = '❌ Invalid coupon.';
    }

    this.updateFinalTotal();
  }

  revalidateCouponAfterChange(): void {
    if (!this.couponApplied || !this.couponCode.trim()) return;
    this.validateCoupon(this.couponCode.trim().toUpperCase());
  }

  removeCoupon(): void {
    this.discount = 0;
    this.couponApplied = false;
    this.couponMessage = '❌ Coupon removed.';
    this.couponCode = '';
    this.updateFinalTotal();
  }

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce(
      (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
      0
    );

    this.revalidateCouponAfterChange();
    this.updateFinalTotal();
  }

  updateFinalTotal(): void {
    this.finalTotal = this.totalPrice - this.discount;
    if (this.finalTotal < 0) this.finalTotal = 0;
  }

  updateQuantity(item: any, qty: number): void {
    if (qty < 1) return;

    this.cartService.updateCartItem(item.cartId || item.cartid, { ...item, quantity: qty })
      .subscribe({
        next: () => {
          item.quantity = qty;
          this.calculateTotal();
          this.showToastMessage(`🔁 Updated quantity for ${item.name}`, 'success');
        },
        error: () => this.showToastMessage('❌ Failed to update quantity.', 'error'),
      });
  }

  openConfirmModal(cartId: number) {
    this.itemToDelete = cartId;
    this.showConfirmModal = true;
  }

  confirmDelete(): void {
    if (!this.itemToDelete) return;

    this.cartService.deleteCartItem(this.itemToDelete).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(
          i => i.cartId !== this.itemToDelete && i.cartid !== this.itemToDelete
        );
        this.calculateTotal();
        this.cartService.setCartCount(this.cartItems.length);
        this.showToastMessage('🗑️ Item removed!', 'success');
      },
      complete: () => {
        this.showConfirmModal = false;
        this.itemToDelete = null;
      },
      error: () => this.showToastMessage('❌ Remove failed.', 'error'),
    });
  }

  cancelDelete() {
    this.showConfirmModal = false;
    this.itemToDelete = null;
  }

  openClearCartConfirm() {
    this.showClearCartModal = true;
  }

  cancelClearCart() {
    this.showClearCartModal = false;
  }

  confirmClearCart(): void {
    if (!this.uid) return;

    this.showClearCartModal = false;
    this.showToastMessage('🧹 Clearing cart...', 'success');

    this.cartService.clearCart(this.uid).subscribe({
      next: () => {
        this.cartItems = [];
        this.totalPrice = 0;
        this.discount = 0;
        this.finalTotal = 0;
        this.couponApplied = false;
        this.couponCode = '';

        this.cartService.resetCartCount();
        this.showToastMessage('🗑️ Cart cleared!', 'success');
      },
      error: () => this.showToastMessage('❌ Failed to clear cart.', 'error'),
    });
  }

  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2200);
  }

  copyCoupon(code: string): void {
    const upper = code.trim().toUpperCase();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(upper)
        .then(() => {
          this.showToastMessage(`Coupon "${upper}" copied!`, 'success');
        })
        .catch(() => {
          this.showToastMessage('Failed to copy coupon!', 'error');
        });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = upper;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        const success = document.execCommand('copy');
        success
          ? this.showToastMessage(`Coupon "${upper}" copied!`, 'success')
          : this.showToastMessage('Failed to copy coupon!', 'error');
      } catch {
        this.showToastMessage('Failed to copy coupon!', 'error');
      }

      document.body.removeChild(textarea);
    }

    this.couponCode = upper;
    this.applyCoupon();
  }
}
