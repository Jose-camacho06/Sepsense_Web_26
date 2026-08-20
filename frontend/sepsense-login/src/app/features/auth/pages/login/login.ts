import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LOGIN_USER_MOCK } from '../../../../mocks/login/login.mock';

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
    if (this.form.invalid) {
      alert('Por favor, complete todos los campos requeridos.');
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.user;
    const password = this.form.value.password;
    console.log(email,password);
    const userfound = LOGIN_USER_MOCK.find(
      (user) => user.email === email && user.password === password
    );
    console.log(userfound)
    if (!userfound) {
      alert('Usuario o contraseña incorrectos');
      return;
    }
    sessionStorage.setItem('isLoggedIn', 'true');
    this.router.navigate(['/home']);
  }

  irRegistro() {
    this.router.navigate(['/registro']);
  }
  irOlvideContrasena() {
    this.router.navigate(['/recuperar-contrasena']);
  }
}