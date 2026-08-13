
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';



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
  showPassword = false;

  form = this.fb.group({
    user: ['', Validators.required],
    password: ['', Validators.required],
  });

  // Cuando el usuario pulse "Ingresar"
  ingresar() {
    if (this.form.valid) {
      this.router.navigate(['/home']);
    } else {
    
      this.form.markAllAsTouched();
    }
  }

  // Navegar a la ruta de registro (ajusta al path real)
  irRegistro() {
    this.router.navigate(['/registro']);
  }

  // Navegar a recuperar contraseña (ajusta al path real)
  irOlvideContrasena() {
    this.router.navigate(['/recuperar-contrasena']);
  }
}