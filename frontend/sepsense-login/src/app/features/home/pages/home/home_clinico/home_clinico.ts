import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../services/auth/auth.service';
import { ClinicalService, ClinicalSummary, PatientSummary } from '../../../../../services/clinical/clinical.service';

@Component({
  selector: 'app-home-clinico',
  imports: [RouterLink],
  templateUrl: './home_clinico.html',
  styleUrl: './home_clinico.scss',
})
export class HomeClinico {
  private clinical = inject(ClinicalService);
  private cdr = inject(ChangeDetectorRef);
  private user = inject(AuthService).getCurrentUser();

  name = this.user?.first_name ?? '';
  roleLabel = this.user?.role === 'enfermero' ? 'ENFERMERÍA' : 'MÉDICO';
  today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  summary: ClinicalSummary | null = null;
  priority: PatientSummary[] = [];

  constructor() {
    this.clinical.getSummary().subscribe({
      next: (response) => {
        this.summary = response.summary;
        this.cdr.markForCheck();
      },
    });
    this.clinical.listPatients('').subscribe({
      next: (response) => {
        // La lista ya viene ordenada por riesgo; tomamos los 3 que tienen alertas.
        this.priority = response.patients.filter((p) => p.risk !== 'normal').slice(0, 3);
        this.cdr.markForCheck();
      },
    });
  }
}