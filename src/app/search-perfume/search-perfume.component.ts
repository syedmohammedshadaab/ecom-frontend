import { Component, OnInit } from '@angular/core';
import { PerfumeService } from '../services/perfume.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-search-perfume',
  templateUrl: './search-perfume.component.html',
  styleUrls: ['./search-perfume.component.css'],
  standalone: false,
})
export class SearchPerfumeComponent implements OnInit {
  perfumes: any[] = [];
  filteredPerfumes: any[] = [];

  searchName: string = '';
  searchGender: string = '';
  selectedPriceRange: string = '';

  // Toast state
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private perfumeService: PerfumeService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadAllPerfumes();
  }

  // ✅ Load all perfumes
  loadAllPerfumes(): void {
    this.perfumeService.getallperfume().subscribe({
      next: (data) => {
        this.perfumes = data;
        this.filteredPerfumes = data;
      },
      error: (err) => console.error('❌ Error fetching perfumes:', err),
    });
  }

  // ✅ Apply filters for name, gender, and price
  applyFilters(): void {
    let filtered = [...this.perfumes];

    // 🔹 Filter by name
    if (this.searchName.trim()) {
      const name = this.searchName.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(name));
    }

    // 🔹 Filter by gender
    if (this.searchGender) {
      filtered = filtered.filter(
        (p) => p.gender.toLowerCase() === this.searchGender.toLowerCase()
      );
    }

    // 🔹 Filter by price range
    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-').map(Number);
      filtered = filtered.filter((p) => p.price >= min && p.price <= max);
    }

    this.filteredPerfumes = filtered;
  }

  // ✅ Add perfume to cart (same logic as perfumes.component.ts)
  addToCart(perfume: any): void {
    const uidStr = sessionStorage.getItem('uid');
    const uid = uidStr ? Number(uidStr) : null;

    if (!uid) {
      this.showToastMessage(
        '⚠️ Please log in to add items to your cart.',
        'error'
      );
      return;
    }

    // Step 1️⃣: Get user's current cart items
    this.perfumeService.getCartItems(uid).subscribe({
      next: (cartItems: any[]) => {
        // Step 2️⃣: Check if perfume already exists
        const existingItem = cartItems.find(
          (item) =>
            item.id === perfume.id ||
            item.id === perfume.id ||
            item.uid === perfume.uid
        );

        if (existingItem) {
          // Step 3️⃣: Increase quantity if already in cart
          const updatedItem = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          };

          this.perfumeService.addtocart(updatedItem).subscribe({
            next: () => {
              console.log('Updated cart quantity:', updatedItem);
              this.showToastMessage(
                `✅ Increased quantity of ${perfume.name}`,
                'success'
              );
            },
            error: (err) => {
              console.error('Error updating cart:', err);
              this.showToastMessage('❌ Failed to update cart.', 'error');
            },
          });
        } else {
          // Step 4️⃣: Add as a new item
          const newCartItem = {
            uid: uid,
            id: perfume.id || perfume.Id,
            name: perfume.name,
            description: perfume.description,
            gender: perfume.gender,
            price: perfume.price,
            imageurl: perfume.imageUrl || perfume.imageurl,
            quantity: 1,
          };

          this.perfumeService.addtocart(newCartItem).subscribe({
            next: () => {
              console.log('Added to cart:', newCartItem);
              this.showToastMessage(
                '✅ Perfume added to cart successfully!',
                'success'
              );
            },
            error: (err) => {
              console.error('❌ Error adding to cart:', err);
              this.showToastMessage(
                '❌ Failed to add perfume to cart.',
                'error'
              );
            },
          });
        }
      },
      error: (err) => {
        console.error('Error fetching cart:', err);
        this.showToastMessage('❌ Could not fetch cart details.', 'error');
      },
    });
  }

  // ✅ Toast helper for notifications
  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
