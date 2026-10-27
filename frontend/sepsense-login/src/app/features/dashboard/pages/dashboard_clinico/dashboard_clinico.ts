import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ClinicalService, ClinicalSummary } from '../../../../services/clinical/clinical.service';

@Component({
  selector: 'app-dashboard-clinico',
  imports: [DatePipe, RouterLink, BaseChartDirective],
  templateUrl: './dashboard_clinico.html',
  styleUrl: './dashboard_clinico.scss',
})
export class DashboardClinico {
  private clinical = inject(ClinicalService);
  private cdr = inject(ChangeDetectorRef);

  summary: ClinicalSummary | null = null;
  message = '';

  riskChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  riskOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  constructor() {
    this.load();
    const timer = setInterval(() => this.load(), 15000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  load() {
    this.clinical.getSummary().subscribe({
      next: (response) => {
        const s = response.summary;
        this.summary = s;
        this.riskChart = {
          labels: ['Alto', 'Medio', 'Bajo', 'Sin alertas'],
          datasets: [{
            data: [s.by_risk.alto, s.by_risk.medio, s.by_risk.bajo, s.by_risk.normal],
            backgroundColor: ['#b42318', '#dc6803', '#067647', '#94a3b8'],
          }],
        };
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible consultar el resumen.';
        this.cdr.markForCheck();
      },
    });
  }
}