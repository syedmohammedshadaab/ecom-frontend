import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = false;
  errorMessage: string = '';

  // ✅ Password show/hide toggle
  showPassword: boolean = false;

  // ✅ Toast message properties
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

        // ✅ Store user details
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('uid', res.uid);
          sessionStorage.setItem('username', res.name);
        }
        this.userService.setUser(res);

        // ✅ Show success toast
        this.showToastMessage(
          '✅ Login Successful! Welcome back, ' + res.name,
          'success'
        );

        // Redirect to home after 2 seconds
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

  // ✅ Toast helper
  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000); // Auto hide after 3 seconds
  }
}
