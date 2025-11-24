import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ComboService } from '../services/combo.service';
import { CartService } from '../services/cart.service';

// ⭐ ADD ANIMATION IMPORTS
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-combo',
  standalone: false,
  templateUrl: './combo.component.html',
  styleUrls: ['./combo.component.css'],

  // ⭐ ADD ANIMATIONS HERE
  animations: [
    // PAGE FADE-IN
    trigger('pageFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 }))
      ])
    ]),

    // COMBO CARD ANIMATION
    trigger('comboAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class CombosComponent implements OnInit {
  combos: any[] = [];
  filteredCombos: any[] = [];

  searchName: string = '';
  searchGender: string = '';
  selectedPriceRange: string = '';
  showLatestOnly: boolean = false;

  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private comboService: ComboService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllCombos();
  }

  getAllCombos(): void {
    this.comboService.getAllCombo().subscribe({
      next: (data) => {
        this.combos = data;
        this.filteredCombos = data;
      },
      error: (err) => console.error('Error fetching combos:', err),
    });
  }

  applyFilters(): void {
    let temp = [...this.combos];

    if (this.searchName.trim()) {
      const name = this.searchName.toLowerCase();
      temp = temp.filter((c) => c.name.toLowerCase().includes(name));
    }

    if (this.searchGender) {
      temp = temp.filter(
        (c) => c.gender?.toLowerCase() === this.searchGender.toLowerCase()
      );
    }

    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-').map(Number);
      temp = temp.filter((c) => c.price >= min && c.price <= max);
    }

    if (this.showLatestOnly) {
      temp = temp.filter((c) => c.latestLaunch === true);
    }

    this.filteredCombos = temp;
  }

  viewComboDetails(id: number) {
    this.router.navigate(['/combodetails', id]);
  }

  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
