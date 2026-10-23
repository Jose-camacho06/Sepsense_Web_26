import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { EyeIcon } from '../../../../shared/components/eye-icon/eye-icon';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, EyeIcon],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  step: 1 | 2 = 1;
  email = '';
  message = '';
  loading = false;
  showPassword = false;
  showConfirm = false;

  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetForm = this.fb.group({
    codigo: ['', Validators.required],
    nuevaContrasena: ['', [Validators.required, Validators.minLength(8)]],
    confirmarContrasena: ['', Validators.required],
  });

  enviarCodigo() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.email = (this.emailForm.value.email ?? '').trim().toLowerCase();
    this.solicitarCodigo();
  }

  reenviarCodigo() {
    this.solicitarCodigo();
  }

  private solicitarCodigo() {
    this.loading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.step = 2;
        // Solo mientras no haya correo real: el backend devuelve el código.
        this.message = response.codigo
          ? `Modo prueba: tu código es ${response.codigo}`
          : 'Te enviamos un código a tu correo.';
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible enviar el código.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  cambiarContrasena() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const value = this.resetForm.value;
    if (value.nuevaContrasena !== value.confirmarContrasena) {
      this.message = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.authService
      .resetPassword({
        email: this.email,
        codigo: String(value.codigo ?? '').trim(),
        nuevaContrasena: value.nuevaContrasena ?? '',
        confirmarContrasena: value.confirmarContrasena ?? '',
      })
      .subscribe({
        next: () => {
          alert('Contraseña actualizada. Ya puedes iniciar sesión.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.message = error.error?.message ?? 'No fue posible cambiar la contraseña.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  volver() {
    this.step = 1;
    this.message = '';
    this.resetForm.reset();
  }

  irRegistro() {
    this.router.navigate(['/registro']);
  }
}