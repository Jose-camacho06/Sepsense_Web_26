import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  showPassword = false;
  showConfirmPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  },
  { validators: this.passwordsMatch });

  passwordsMatch(form: any) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = {
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
      confirmPassword: this.form.value.confirmPassword ?? '',
    };

    this.authService.register(data).subscribe({
      next: (response) => {
        alert(response.message);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        alert(error.error?.message ?? 'No fue posible registrar el usuario.');
      },
    });
  }
}
