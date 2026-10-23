import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  Homeir() {
    this.router.navigate(['/home']);
  }
  logout() {
    sessionStorage.removeItem('isLoggedIn');
    console.log('Cerrando sesión...');
    this.router.navigate(['/login']);
  }
}
