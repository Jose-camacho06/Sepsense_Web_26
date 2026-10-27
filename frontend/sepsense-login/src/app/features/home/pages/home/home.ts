import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../services/auth/auth.service';
import { HomeAdmin } from './home_admin/home';
import { HomeClinico } from './home_clinico/home_clinico';

@Component({
  selector: 'app-home',
  imports: [HomeAdmin, HomeClinico],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private role = inject(AuthService).getCurrentUser()?.role;
  isAdmin = this.role === 'admin';
  isClinico = this.role === 'doctor' || this.role === 'enfermero';
}