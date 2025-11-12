import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: false,
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          this.noWhitespaceValidator,
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          // ✅ Strong password: upper, lower, number, special char
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]|:;"<>,.?/~`]).{8,}$'
          ),
        ],
      ],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  // ✅ Getter for easy access in template
  get f() {
    return this.signupForm.controls;
  }

  // ✅ Custom validator to prevent only whitespace
  noWhitespaceValidator(control: any) {
    const isWhitespace = (control.value || '').trim().length === 0;
    return !isWhitespace ? null : { whitespace: true };
  }

  // ✅ Submit form
  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.errorMessage = '⚠️ Please correct the highlighted fields.';
      Object.values(this.signupForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ✅ Trim all string inputs before sending to backend
    const formData = Object.fromEntries(
      Object.entries(this.signupForm.value).map(([k, v]) => [
        k,
        typeof v === 'string' ? v.trim() : v,
      ])
    );

    this.userService.registerUser(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = '✅ Registration successful! Redirecting...';
        this.userService.setUser(res);

        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.status === 409
            ? '❌ Email already exists. Please use another.'
            : '⚠️ Something went wrong. Please try again.';
      },
    });
  }
}
