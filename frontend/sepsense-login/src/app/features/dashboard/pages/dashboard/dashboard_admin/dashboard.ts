import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { DashboardData, DashboardService } from '../../../../../services/dashboard/dashboard.service';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  data: DashboardData | null = null;
  message = '';

  roleChart: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  monthChart: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };

  roleOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  monthOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  constructor() {
    this.dashboardService.get().subscribe({
      next: (response) => {
        const d = response.dashboard;
        this.data = d;

        this.roleChart = {
          labels: d.users_by_role.map((item) => item.role),
          datasets: [
            {
              data: d.users_by_role.map((item) => item.total),
              backgroundColor: ['#003a70', '#0ea5a4', '#5eead4', '#94a3b8', '#f59e0b', '#ef4444'],
            },
          ],
        };

        this.monthChart = {
          labels: d.registrations_by_month.map((item) => MONTHS[Number(item.month.slice(5, 7)) - 1]),
          datasets: [
            {
              data: d.registrations_by_month.map((item) => item.total),
              backgroundColor: '#0ea5a4',
              borderRadius: 6,
            },
          ],
        };

        this.cdr.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible consultar el dashboard.';
        this.cdr.markForCheck();
      },
    });
  }
}