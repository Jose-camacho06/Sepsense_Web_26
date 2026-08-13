
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

  
  ingresar() {
    if (this.form.valid) {
      this.router.navigate(['/home']);
         
    } else {
      alert('Por favor, complete todos los campos requeridos.');
      this.form.markAllAsTouched();
    }
  }

  
  irRegistro() {
    this.router.navigate(['/registro']);
  }
  irOlvideContrasena() {
    this.router.navigate(['/recuperar-contrasena']);
  }
}