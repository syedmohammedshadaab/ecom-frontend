import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

// ⬇️ Animation imports
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,

  // ⬇️ Attach animations here
  animations: [
    // Whole page fade + slide
    trigger('pageFadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),

    // Login box animation
    trigger('boxFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-out', style({ opacity: 1 })),
      ]),
    ]),

    // Toast animation
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' })),
      ]),
    ]),
  ],
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = false;
  errorMessage: string = '';

  showPassword: boolean = false;

  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in valid email and password.';
      this.showToastMessage('⚠️ Please enter valid credentials.', 'error');
      Object.values(this.loginForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.userService.loginUser(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('uid', res.uid);
          sessionStorage.setItem('username', res.name);
        }
        this.userService.setUser(res);

        this.showToastMessage(
          '✅ Login Successful! Welcome back, ' + res.name,
          'success'
        );

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Invalid email or password!';
        this.showToastMessage('❌ Invalid email or password!', 'error');
      },
    });
  }

  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
