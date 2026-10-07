import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  showPassword = false;

  form = this.fb.group({
    user: ['', Validators.required],
    password: ['', Validators.required],
  });

  ingresar() {
    if (this.form.invalid) {
      alert('Por favor, complete todos los campos requeridos.');
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.user ?? '';
    const password = this.form.value.password ?? '';

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.authService.saveSession(response);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        alert(error.error?.message ?? 'Usuario o contraseña incorrectos');
      },
    });
  }

  irRegistro() {
    this.router.navigate(['/registro']);
  }
  irOlvideContrasena() {
    this.router.navigate(['/recuperar-contrasena']);
  }
}