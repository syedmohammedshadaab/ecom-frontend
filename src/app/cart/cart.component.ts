import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: false,
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  uid: number | null = null;

  // 🌸 Custom Modal States
  showConfirmModal: boolean = false;
  itemToDelete: number | null = null;

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
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2500);
    }
  }

  // ✅ Load all items
  loadCart(): void {
    if (!this.uid) return;

    this.cartService.getCartItems(this.uid).subscribe({
      next: (response: any) => {
        this.cartItems = response;
        this.calculateTotal();

        // ✅ Update cart count reactively
        this.cartService.setCartCount(this.cartItems.length);
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.showToastMessage(
          '❌ Failed to load cart. Try again later.',
          'error'
        );
      },
    });
  }

  // ✅ Open themed confirmation modal
  openConfirmModal(cartId: number): void {
    this.itemToDelete = cartId;
    this.showConfirmModal = true;
  }

  // ✅ Confirm deletion
  confirmDelete(): void {
    if (!this.itemToDelete) return;

    this.cartService.deleteCartItem(this.itemToDelete).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(
          (item) =>
            item.cartid !== this.itemToDelete &&
            item.cartId !== this.itemToDelete
        );

        this.calculateTotal();
        this.showToastMessage('🗑️ Item removed successfully!', 'success');

        // ✅ Update cart count reactively
        this.cartService.setCartCount(this.cartItems.length);
      },
      error: (err) => {
        console.error('Error deleting item:', err);
        this.showToastMessage('❌ Failed to remove item.', 'error');
      },
      complete: () => {
        this.showConfirmModal = false;
        this.itemToDelete = null;
      },
    });
  }

  // ✅ Cancel deletion
  cancelDelete(): void {
    this.showConfirmModal = false;
    this.itemToDelete = null;
  }

  // ✅ Calculate total
  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce((sum: number, item: any) => {
      const quantity = item.quantity ?? 1;
      const price = item.price ?? 0;
      return sum + price * quantity;
    }, 0);
  }

  // ✅ Update quantity
  updateQuantity(item: any, newQty: number): void {
    if (newQty < 1) return;

    const updatedItem = { ...item, quantity: newQty };

    this.cartService
      .updateCartItem(item.cartId || item.cartid, updatedItem)
      .subscribe({
        next: () => {
          item.quantity = newQty;
          this.calculateTotal();
          this.showToastMessage(
            `🔁 Updated quantity for ${item.name}`,
            'success'
          );
        },
        error: (err) => {
          console.error('Error updating quantity:', err);
          this.showToastMessage('❌ Failed to update quantity.', 'error');
        },
      });
  }

  // ✅ Toast Notification
  showToastMessage(
    message: string,
    type: 'success' | 'error' = 'success'
  ): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2500);
  }

  // 🗑️ Clear Cart Button
  clearCart() {
    if (!this.uid) {
      this.showToastMessage('⚠️ Please log in to clear the cart.', 'error');
      return;
    }

    if (confirm('Are you sure you want to clear the entire cart?')) {
      this.cartService.clearCart(this.uid).subscribe({
        next: () => {
          this.cartItems = [];
          this.totalPrice = 0;
          this.showToastMessage('🗑️ Cart cleared successfully!', 'success');

          // ✅ Reset cart count reactively
          this.cartService.resetCartCount();
        },
        error: (err) => {
          console.error('Error clearing cart:', err);
          this.showToastMessage('❌ Failed to clear cart!', 'error');
        },
      });
    }
  }
}
