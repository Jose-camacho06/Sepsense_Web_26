import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private role = inject(AuthService).getCurrentUser()?.role ?? '';

  get esAdmin(): boolean {
    return this.role === 'admin';
  }

  get esClinico(): boolean {
    return this.role === 'doctor' || this.role === 'enfermero';
  }
}