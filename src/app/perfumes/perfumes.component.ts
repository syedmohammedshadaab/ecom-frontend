import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PerfumeService } from '../services/perfume.service';

@Component({
  selector: 'app-perfumes',
  standalone: false,
  templateUrl: './perfumes.component.html',
  styleUrls: ['./perfumes.component.css'],
})
export class PerfumesComponent implements OnInit {
  perfume: any[] = [];
  filteredPerfumes: any[] = [];

  // Filters
  searchName: string = '';
  searchGender: string = '';
  selectedPriceRange: string = '';
  showLatestOnly: boolean = false;

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private perfumeService: PerfumeService, private router: Router) {}

  ngOnInit(): void {
    this.getAllPerfumes();
  }

  // ================================
  // FETCH ALL PERFUMES
  // ================================
  getAllPerfumes(): void {
    this.perfumeService.getallperfume().subscribe({
      next: (data) => {
        this.perfume = data;
        this.filteredPerfumes = data;
      },
      error: (err) => console.error('Error fetching perfumes:', err),
    });
  }

  // ================================
  // APPLY FILTERS
  // ================================
  applyFilters(): void {
    let temp = [...this.perfume];

    if (this.searchName.trim()) {
      const name = this.searchName.toLowerCase();
      temp = temp.filter((p) => p.name.toLowerCase().includes(name));
    }

    if (this.searchGender) {
      temp = temp.filter(
        (p) => p.gender?.toLowerCase() === this.searchGender.toLowerCase()
      );
    }

    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-').map(Number);
      temp = temp.filter((p) => p.price >= min && p.price <= max);
    }

    if (this.showLatestOnly) {
      temp = temp.filter((p) => p.latestLaunch === true);
    }

    this.filteredPerfumes = temp;
  }

  // ================================
  // ADD TO CART (REAL-TIME UPDATE)
  // ================================
  addtocart(perfume: any): void {
    const uidStr = sessionStorage.getItem('uid');
    const uid = uidStr ? Number(uidStr) : null;

    if (!uid) {
      this.showToastMessage('⚠️ Please log in to add items to your cart.', 'error');
      return;
    }

    this.perfumeService.getCartItems(uid).subscribe({
      next: (cartItems: any[]) => {
        const existingItem = cartItems.find((item) => item.id === perfume.id);

        if (existingItem) {
          // UPDATE quantity
          const updatedItem = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          };

          this.perfumeService.addtocart(updatedItem).subscribe({
            next: () => {
              this.perfumeService.refreshCartCount(uid); // ⭐ real-time update
              this.showToastMessage(`🔁 Increased quantity of ${perfume.name}`, 'success');
            },
            error: () => this.showToastMessage('❌ Failed to update cart.', 'error'),
          });
        } else {
          // ADD new item
          const newCartItem = {
            uid: uid,
            id: perfume.id,
            name: perfume.name,
            description: perfume.description,
            gender: perfume.gender,
            price: perfume.price,
            imageurl: perfume.imageUrl || perfume.imageurl,
            quantity: 1,
            latestLaunch: perfume.latestLaunch,
          };

          this.perfumeService.addtocart(newCartItem).subscribe({
            next: () => {
              this.perfumeService.refreshCartCount(uid); // ⭐ real-time update
              this.showToastMessage('🛒 Perfume added to cart successfully!', 'success');
            },
            error: () => this.showToastMessage('❌ Failed to add perfume to cart.', 'error'),
          });
        }
      },
      error: () => {
        this.showToastMessage('❌ Could not fetch cart details.', 'error');
      },
    });
  }

  // ================================
  // VIEW DETAILS
  // ================================
  viewPerfumeDetails(id: number) {
    this.router.navigate(['/perfumes', id]);
  }

  // ================================
  // TOAST HELPER
  // ================================
  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
