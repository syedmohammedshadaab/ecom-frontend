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
  searchGender: string = '';
  selectedPriceRange: string = '';
  showLatestOnly: boolean = false;

  // Toast state
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private perfumeService: PerfumeService, private router: Router) {}

  ngOnInit(): void {
    this.getAllPerfumes();
  }

  // ✅ Fetch all perfumes from backend
  getAllPerfumes(): void {
    this.perfumeService.getallperfume().subscribe({
      next: (data) => {
        console.log('Perfume data:', data);
        this.perfume = data;
        this.filteredPerfumes = data;
      },
      error: (err) => console.error('Error fetching perfumes:', err),
    });
  }

  // ✅ Apply filters
  applyFilters(): void {
    let temp = [...this.perfume];

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

  // ✅ Add perfume to cart
  addtocart(perfume: any): void {
    const uidStr = sessionStorage.getItem('uid');
    const uid = uidStr ? Number(uidStr) : null;

    if (!uid) {
      this.showToastMessage(
        '⚠️ Please log in to add items to your cart.',
        'error'
      );
      return;
    }

    this.perfumeService.getCartItems(uid).subscribe({
      next: (cartItems: any[]) => {
        const existingItem = cartItems.find((item) => item.id === perfume.id);

        if (existingItem) {
          const updatedItem = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          };

          this.perfumeService.addtocart(updatedItem).subscribe({
            next: () => {
              this.showToastMessage(
                `✅ Increased quantity of ${perfume.name}`,
                'success'
              );
            },
            error: () => {
              this.showToastMessage('❌ Failed to update cart.', 'error');
            },
          });
        } else {
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
              console.log(newCartItem);
              this.showToastMessage(
                '✅ Perfume added to cart successfully!',
                'success'
              );
            },
            error: () => {
              this.showToastMessage(
                '❌ Failed to add perfume to cart.',
                'error'
              );
            },
          });
        }
      },
      error: () => {
        this.showToastMessage('❌ Could not fetch cart details.', 'error');
      },
    });
  }

  // ✅ View perfume details
  // viewDetails(id: number): void {
  //   this.router.navigate(['/perfumes', id]);
  // }
  viewPerfumeDetails(id: number) {
    this.router.navigate(['/perfumes', id]);
  }

  // ✅ Toast helper
  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
