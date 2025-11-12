import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
 title = 'perfume-store';
  // 👇 Detect scroll position
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
      if (window.scrollY > 60) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    }
  }
}
