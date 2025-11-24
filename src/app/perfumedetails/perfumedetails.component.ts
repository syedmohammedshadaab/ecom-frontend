import {
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PerfumeService } from '../services/perfume.service';
import { CartService } from '../services/cart.service';

import {
  trigger,
  style,
  transition,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-perfumedetails',
  templateUrl: './perfumedetails.component.html',
  styleUrls: ['./perfumedetails.component.css'],
  standalone: false,

  animations: [
    trigger('pageFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 }))
      ])
    ]),

    trigger('slideRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(40px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        )
      ])
    ]),

    trigger('imageFade', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
      ])
    ]),

    trigger('cardFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate(
          '500ms ease-out',
          style({ opacity: 1, transform: 'scale(1)' })
        )
      ])
    ])
  ]
})
export class PerfumedetailsComponent implements OnInit {
  perfume: any = null;
  perfumeId!: number;

  imageList: string[] = [];
  currentImageIndex: number = 0;
  selectedImage: string = '';

  similarPerfumes: any[] = [];

  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  // LOADER FLAG
  isAdding: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private perfumeService: PerfumeService,
    private router: Router,
    private cartService: CartService
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
      }
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
      }
    });
  }

  nextImage(): void {
    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.imageList.length;
  }

  prevImage(): void {
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.imageList.length) %
      this.imageList.length;
  }

  setImage(index: number): void {
    this.currentImageIndex = index;
  }

  previewImage(img: string): void {
    this.selectedImage = img;
    const modalEl = document.getElementById('imageModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  // UPDATED ADD TO CART (with loader)
  addtocart(perfume: any): void {
    this.isAdding = true;

    const uidStr = sessionStorage.getItem('uid');
    const uid = uidStr ? Number(uidStr) : null;

    if (!uid) {
      this.isAdding = false;
      this.showToastMessage(
        '⚠️ Please log in to add items to your cart.',
        'error'
      );
      return;
    }

    this.cartService.getCartItems(uid).subscribe({
      next: (cartItems: any[]) => {
        const existing = cartItems.find(
          (item) => item.id === perfume.id && item.prodtype === 'perfume'
        );

        if (existing) {
          this.isAdding = false;
          this.showToastMessage(
            `🛑 ${perfume.name} is already in your cart.`,
            'error'
          );
          return;
        }

        const newItem = {
          uid: uid,
          id: perfume.id,
          name: perfume.name,
          description: perfume.description,
          gender: perfume.gender,
          price: perfume.price,
          imageurl: perfume.imageurl || perfume.imageUrl,
          quantity: 1,
          prodtype: 'perfume'
        };

        this.cartService.addToCart(newItem).subscribe({
          next: () => {
            this.cartService.incrementCartCount();
            this.isAdding = false;
            this.showToastMessage(
              `🛒 ${perfume.name} added to cart successfully!`,
              'success'
            );
          },
          error: () => {
            this.isAdding = false;
            this.showToastMessage('❌ Failed to add to cart.', 'error');
          }
        });
      },
      error: () => {
        this.isAdding = false;
        this.showToastMessage('❌ Failed to check cart.', 'error');
      }
    });
  }

  goToDetails(id: number): void {
    this.router.navigate(['/perfumes', id]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
