import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../services/auth/auth.service';
import { DashboardData, DashboardService } from '../../../../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-home-admin',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeAdmin {
  private cdr = inject(ChangeDetectorRef);

  name = inject(AuthService).getCurrentUser()?.first_name ?? 'Administrador';
  today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  stats: DashboardData['stats'] | null = null;

  constructor() {
    inject(DashboardService).get().subscribe({
      next: (response) => {
        this.stats = response.dashboard.stats;
        this.cdr.markForCheck();
      },
    });
  }
}