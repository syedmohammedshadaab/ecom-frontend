import {
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComboService } from '../services/combo.service';
import { CartService } from '../services/cart.service';

import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-combodetails',
  templateUrl: './combodetails.component.html',
  styleUrls: ['./combodetails.component.css'],
  standalone: false,

  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CombodetailsComponent implements OnInit {
  combo: any = null;
  comboId!: number;

  imageList: string[] = [];
  currentImageIndex: number = 0;
  selectedImage: string = '';

  similarCombos: any[] = [];

  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  cartItems: any[] = [];

  // ⭐ Spinner for Add to Cart
  isAddingToCart: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private comboService: ComboService,
    private router: Router,
    private cartService: CartService
  ) {}

  getUid(): number | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const uidStr = sessionStorage.getItem('uid');
      return uidStr ? Number(uidStr) : null;
    }
    return null;
  }

  ngOnInit(): void {
    const uid = this.getUid();

    if (uid) {
      this.cartService.getCartItems(uid).subscribe({
        next: (items) => (this.cartItems = items),
      });
    }

    this.route.paramMap.subscribe((params) => {
      this.comboId = Number(params.get('cid'));
      if (this.comboId) this.fetchComboDetails();
    });
  }

  fetchComboDetails(): void {
    this.comboService.getComboById(this.comboId).subscribe({
      next: (data) => {
        this.combo = data;

        const imgUrl =
          data.imageurl && data.imageurl.trim() !== ''
            ? data.imageurl
            : data.imageUrl && data.imageUrl.trim() !== ''
            ? data.imageUrl
            : 'https://placehold.co/400x400?text=No+Image';

        this.imageList = Array(4).fill(imgUrl);
        this.selectedImage = imgUrl;
        this.currentImageIndex = 0;

        this.fetchSimilarCombos(data.price);
      },
      error: () => {
        this.showToastMessage('❌ Failed to load combo details.', 'error');
      },
    });
  }

  fetchSimilarCombos(price: number): void {
    const lower = price * 0.9;
    const upper = price * 1.1;

    this.comboService.getAllCombo().subscribe({
      next: (data) => {
        this.similarCombos = data.filter(
          (c: any) =>
            c.cid !== this.comboId && c.price >= lower && c.price <= upper
        );
      },
      error: () => {
        this.showToastMessage('❌ Failed to fetch similar combos.', 'error');
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

  // ⭐ Add to Cart with Spinner
  addToCart(combo: any): void {
    const uid = this.getUid();

    if (!uid) {
      this.showToastMessage('⚠️ Please login before adding items to cart.', 'error');
      return;
    }

    this.isAddingToCart = true; // START spinner

    this.cartService.getCartItems(uid).subscribe({
      next: (cartItems) => {
        const exists = cartItems.find(
          (item) => item.id === combo.cid && item.prodtype === 'combo'
        );

        if (exists) {
          this.isAddingToCart = false; // STOP spinner
          this.showToastMessage(`🛑 ${combo.name} is already in your cart.`, 'error');
          return;
        }

        const cartItem = {
          uid: uid,
          id: combo.cid,
          name: combo.name,
          description: combo.description,
          prodtype: 'combo',
          gender: combo.gender,
          price: combo.price,
          imageurl: combo.imageurl || combo.imageUrl,
          quantity: 1,
        };

        this.cartService.addToCart(cartItem).subscribe({
          next: () => {
            this.cartService.incrementCartCount();
            this.isAddingToCart = false; // STOP spinner
            this.showToastMessage(
              `🛒 ${combo.name} added to cart successfully!`,
              'success'
            );
          },
          error: () => {
            this.isAddingToCart = false; // STOP spinner
            this.showToastMessage('❌ Failed to add combo to cart!', 'error');
          },
        });
      },
      error: () => {
        this.isAddingToCart = false; // STOP spinner
        this.showToastMessage('❌ Failed to fetch cart items.', 'error');
      },
    });
  }

  goToDetails(cid: number): void {
    this.router.navigate(['/combodetails', cid]).then(() => {
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
