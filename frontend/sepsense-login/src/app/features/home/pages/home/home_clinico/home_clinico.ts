import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClinicalService, PatientSummary } from '../../../../../services/clinical/clinical.service';

@Component({
  selector: 'app-home-clinico',
  imports: [RouterLink],
  templateUrl: './home_clinico.html',
  styleUrl: './home_clinico.scss',
})
export class HomeClinico {
  private clinical = inject(ClinicalService);
  private cdr = inject(ChangeDetectorRef);

  patients: PatientSummary[] = [];
  floors: string[] = [];
  selectedFloor = 'todos';
  updatedAt = '';
  message = '';

  constructor() {
    this.load();
    const timer = setInterval(() => this.load(), 15000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  load() {
    this.clinical.listPatients('').subscribe({
      next: (response) => {
        this.patients = response.patients;
        this.floors = [...new Set(response.patients.map((p) => p.floor).filter((f): f is string => !!f))]
          .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
        this.updatedAt = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible consultar los pacientes.';
        this.cdr.markForCheck();
      },
    });
  }

  get visible(): PatientSummary[] {
    if (this.selectedFloor === 'todos') {
      return this.patients;
    }
    if (this.selectedFloor === 'sin') {
      return this.patients.filter((p) => !p.floor);
    }
    return this.patients.filter((p) => p.floor === this.selectedFloor);
  }

  get needAttention(): number {
    return this.visible.filter((p) => p.risk === 'alto' || p.risk === 'medio').length;
  }

    get priority(): PatientSummary[] {
    return this.visible.filter((p) => p.risk === 'alto' || p.risk === 'medio').slice(0, 4);
  }

  get hasUnassigned(): boolean {
    return this.patients.some((p) => !p.floor);
  }

  minutesAgo(date: string): string {
    const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return 'hace menos de 1 min';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `hace ${hours} h`;
  }

  riskLabel(risk: string): string {
    return { alto: 'Alto', medio: 'Medio', bajo: 'Bajo', normal: 'Estable' }[risk] ?? risk;
  }
}