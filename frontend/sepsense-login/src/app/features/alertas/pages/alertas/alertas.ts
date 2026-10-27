import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Alert, ClinicalService } from '../../../../services/clinical/clinical.service';

type Filter = 'pendiente' | 'atendida' | 'todas';

@Component({
  selector: 'app-alertas',
  imports: [DatePipe, RouterLink],
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss',
})
export class Alertas {
  private clinical = inject(ClinicalService);
  private cdr = inject(ChangeDetectorRef);

  alerts: Alert[] = [];
  filter: Filter = 'pendiente';
  attendingId: number | null = null;
  message = '';

  filters: { value: Filter; label: string }[] = [
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'atendida', label: 'Atendidas' },
    { value: 'todas', label: 'Todas' },
  ];

  constructor() {
    this.load();
    const timer = setInterval(() => this.load(), 15000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  setFilter(filter: Filter) {
    this.filter = filter;
    this.attendingId = null;
    this.load();
  }

  load() {
    this.clinical.listAlerts(this.filter).subscribe({
      next: (response) => {
        this.alerts = response.alerts;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible consultar las alertas.';
        this.cdr.markForCheck();
      },
    });
  }

  attend(alert: Alert, note: string) {
    this.clinical.attendAlert(alert.id, note).subscribe({
      next: (response) => {
        this.message = `${response.message} (${alert.patient_name})`;
        this.attendingId = null;
        this.load();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible atender la alerta.';
        this.cdr.markForCheck();
      },
    });
  }
}