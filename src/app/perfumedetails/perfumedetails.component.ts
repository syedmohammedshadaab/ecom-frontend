import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PerfumeService } from '../services/perfume.service';
import { CartService } from '../services/cart.service'; // ✅ Inject CartService

@Component({
  selector: 'app-perfumedetails',
  templateUrl: './perfumedetails.component.html',
  styleUrls: ['./perfumedetails.component.css'],
  standalone: false,
})
export class PerfumedetailsComponent implements OnInit {
  perfume: any = null;
  perfumeId!: number;

  // Carousel
  imageList: string[] = [];
  currentImageIndex: number = 0;
  selectedImage: string = '';

  // Similar perfumes
  similarPerfumes: any[] = [];

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private perfumeService: PerfumeService,
    private router: Router,
    private cartService: CartService // ✅ Added
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.perfumeId = Number(params.get('id'));
      if (this.perfumeId) {
        this.fetchPerfumeDetails();
      }
    });
  }

  fetchPerfumeDetails(): void {
    this.perfumeService.getPerfumeById(this.perfumeId).subscribe({
      next: (data) => {
        this.perfume = data;

        const imgUrl =
          data.imageurl && data.imageurl.trim() !== ''
            ? data.imageurl
            : data.imageUrl && data.imageUrl.trim() !== ''
            ? data.imageUrl
            : 'https://placehold.co/400x400?text=No+Image';

        this.imageList = Array(4).fill(imgUrl);
        this.selectedImage = imgUrl;
        this.currentImageIndex = 0;

        this.fetchSimilarPerfumes(data.price);
      },
      error: () => {
        this.showToastMessage('❌ Failed to load perfume details.', 'error');
      },
    });
  }

  fetchSimilarPerfumes(price: number): void {
    this.perfumeService.getallperfume().subscribe({
      next: (data) => {
        const lower = price * 0.9;
        const upper = price * 1.1;

        this.similarPerfumes = data.filter(
          (p: any) =>
            p.id !== this.perfumeId && p.price >= lower && p.price <= upper
        );
      },
      error: () => {
        this.showToastMessage('❌ Failed to fetch similar perfumes.', 'error');
      },
    });
  }

  nextImage(): void {
    if (this.imageList.length) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.imageList.length;
    }
  }

  prevImage(): void {
    if (this.imageList.length) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.imageList.length) %
        this.imageList.length;
    }
  }

  setImage(index: number): void {
    if (index >= 0 && index < this.imageList.length) {
      this.currentImageIndex = index;
    }
  }

  previewImage(img: string): void {
    this.selectedImage = img;
    const modalEl = document.getElementById('imageModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  // ===============================
  // 🛒 Add to cart + update cartCount
  // ✅ Only increase cart count for unique perfumes
  // ===============================
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
          // ✅ Already in cart, show message, do NOT increment cart count
          this.showToastMessage(
            `🛑 ${perfume.name} is already in your cart.`,
            'error'
          );
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
              this.cartService.incrementCartCount(); // ✅ increment only for new perfume
              this.showToastMessage(
                '🛒 Perfume added to cart successfully!',
                'success'
              );
            },
            error: () =>
              this.showToastMessage(
                '❌ Failed to add perfume to cart.',
                'error'
              ),
          });
        }
      },
      error: () => {
        this.showToastMessage('❌ Could not fetch cart details.', 'error');
      },
    });
  }

  // ===============================
  // 🔗 Navigate to similar perfume
  // ===============================
  goToDetails(id: number): void {
    this.router.navigate(['/perfumes', id]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===============================
  // 🔔 Toast controller
  // ===============================
  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
