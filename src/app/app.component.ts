import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
})
export class AppComponent implements OnInit {
  username: string | null = null;
  showLogoutConfirm = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateUsername();

    // Update username whenever route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateUsername();
      }
    });
  }

  // ✅ Read username from sessionStorage
  updateUsername(): void {
    if (typeof window !== 'undefined') {
      this.username = sessionStorage.getItem('username');
    }
  }
  confirmLogout(): void {
    this.showLogoutConfirm = true;
  }
  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  // ✅ Logout function
  logout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('uid');
      this.username = null;
      this.showLogoutConfirm = false;
      this.router.navigate(['/login']); // redirect to login page
    }
  }
}
