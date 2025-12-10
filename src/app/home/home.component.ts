import { Component, HostListener } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [

    // 🌟 Full page fade-in
    trigger('pageFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-out', style({ opacity: 1 }))
      ])
    ]),

    // 🌅 Hero fade + scale
    trigger('heroFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.96)' }),
        animate('1000ms cubic-bezier(0.16,1,0.3,1)',
          style({ opacity: 1, transform: 'scale(1)' })
        )
      ])
    ]),

    // 🟦 Section fade-up
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(35px)' }),
        animate('900ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ]),

    // 🟩 Stagger for product cards
    trigger('staggerCards', [
      transition(':enter', [
        query('.perfume-card', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate(
              '700ms ease-out',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ])
      ])
    ]),
  ]
})
export class HomeComponent {

  // 🔹 Toast properties
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  // Navbar scroll effect
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
      if (window.scrollY > 60) navbar.classList.add('navbar-scrolled');
      else navbar.classList.remove('navbar-scrolled');
    }
  }

  // 🔹 Copy coupon with toast
  copyCoupon(code: string) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(code)
        .then(() => this.showToastMessage(`Coupon "${code}" copied!`, 'success'))
        .catch(() => this.showToastMessage('Failed to copy coupon!', 'error'));
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        const success = document.execCommand('copy');
        success
          ? this.showToastMessage(`Coupon "${code}" copied!`, 'success')
          : this.showToastMessage('Failed to copy coupon!', 'error');
      } catch {
        this.showToastMessage('Failed to copy coupon!', 'error');
      }

      document.body.removeChild(textarea);
    }
  }

  // Toast message
  private showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2000);
  }
}
