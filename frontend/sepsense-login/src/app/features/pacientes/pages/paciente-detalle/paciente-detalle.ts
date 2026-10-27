import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Alert, ClinicalService, PatientDetail, Reading } from '../../../../services/clinical/clinical.service';

@Component({
  selector: 'app-paciente-detalle',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, BaseChartDirective],
  templateUrl: './paciente-detalle.html',
  styleUrl: './paciente-detalle.scss',
})
export class PacienteDetalle {
  private clinical = inject(ClinicalService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  patient: PatientDetail | null = null;
  last: Reading | null = null;
  breakdown: { label: string; value: string; points: number }[] = [];
  clinicalResponse: { level: string; title: string; text: string } | null = null;
  message = '';
  attendingId: number | null = null;
  showForm = false;
  isSaving = false;

  consciousnessLabels: Record<string, string> = {
    A: 'Alerta',
    C: 'Confusión nueva',
    V: 'Responde a la voz',
    P: 'Responde al dolor',
    U: 'No responde',
  };

  vitalsChart: ChartData<'line'> = { labels: [], datasets: [] };
  news2Chart: ChartData<'line'> = { labels: [], datasets: [] };

  vitalsOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: { title: { display: true, text: 'FC (lpm)' } },
      y1: { position: 'right', title: { display: true, text: 'Temp. (°C)' }, grid: { drawOnChartArea: false } },
    },
  };

  news2Options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, suggestedMax: 20, ticks: { precision: 0 } } },
  };

  readingForm = this.fb.group({
    respiratory_rate: [null as number | null],
    spo2: [null as number | null],
    supplemental_oxygen: [false],
    systolic: [null as number | null],
    diastolic: [null as number | null],
    heart_rate: [null as number | null],
    temperature: [null as number | null],
    consciousness: ['A'],
  });

  constructor() {
    this.load();
    // Se actualiza sola cada 10 segundos, para ver llegar las lecturas.
    const timer = setInterval(() => this.load(), 10000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  load() {
    this.clinical.getPatient(this.id).subscribe({
      next: (response) => {
        this.patient = response.patient;
        const readings = response.patient.readings;
        this.last = readings.length ? readings[readings.length - 1] : null;
        this.buildBreakdown();
        this.buildCharts(readings);
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible consultar el paciente.';
        this.cdr.markForCheck();
      },
    });
  }

  private buildCharts(readings: Reading[]) {
    const labels = readings.map((r) =>
      new Date(r.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    );
    this.vitalsChart = {
      labels,
      datasets: [
        { label: 'FC (lpm)', data: readings.map((r) => r.heart_rate), borderColor: '#003a70', backgroundColor: '#003a70', yAxisID: 'y', tension: 0.3, pointRadius: 0 },
        { label: 'Temp. (°C)', data: readings.map((r) => r.temperature), borderColor: '#d9480f', backgroundColor: '#d9480f', yAxisID: 'y1', tension: 0.3, pointRadius: 0 },
      ],
    };
    this.news2Chart = {
      labels,
      datasets: [
        { label: 'NEWS2', data: readings.map((r) => r.news2), borderColor: '#0b807f', backgroundColor: 'rgba(14,165,164,0.15)', fill: true, tension: 0.3, pointRadius: 0 },
      ],
    };
  }

  attend(alert: Alert, note: string) {
    this.clinical.attendAlert(alert.id, note).subscribe({
      next: (response) => {
        this.message = response.message;
        this.attendingId = null;
        this.load();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible atender la alerta.';
        this.cdr.markForCheck();
      },
    });
  }

  saveReading() {
    const raw = this.readingForm.getRawValue();
    // Solo se envían los campos que se llenaron.
    const data = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== null && v !== ''));
    this.isSaving = true;
    this.clinical.addReading(this.id, data).subscribe({
      next: (response) => {
        const alerts = response.alerts.length ? ` Alertas nuevas: ${response.alerts.map((a) => a.message).join(', ')}.` : '';
        this.message = response.message + alerts;
        this.isSaving = false;
        this.showForm = false;
        this.readingForm.reset({ supplemental_oxygen: false, consciousness: 'A' });
        this.load();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible registrar la lectura.';
        this.isSaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  private buildBreakdown() {
    const r = this.last;
    this.breakdown = [];
    this.clinicalResponse = null;
    if (!r) {
      return;
    }
    const points = r.news2_points ?? {};
    const rows: [string, string, string | null][] = [
      ['respiratory_rate', 'Frec. respiratoria', r.respiratory_rate !== null ? `${r.respiratory_rate} rpm` : null],
      ['spo2', 'SpO₂', r.spo2 !== null ? `${r.spo2} %` : null],
      ['supplemental_oxygen', 'Oxígeno suplementario', r.supplemental_oxygen === null ? null : r.supplemental_oxygen ? 'Sí' : 'No'],
      ['systolic', 'PA sistólica', r.systolic !== null ? `${r.systolic} mmHg` : null],
      ['heart_rate', 'Frec. cardíaca', r.heart_rate !== null ? `${r.heart_rate} lpm` : null],
      ['temperature', 'Temperatura', r.temperature !== null ? `${r.temperature} °C` : null],
      ['consciousness', 'Conciencia', r.consciousness ? this.consciousnessLabels[r.consciousness] : null],
    ];
    this.breakdown = rows
      .filter(([key]) => key in points)
      .map(([key, label, value]) => ({ label, value: value ?? '—', points: points[key] }));
    const anyThree = Object.values(points).some((p) => p === 3);
    this.clinicalResponse = this.responseFor(r.news2, anyThree);
  }

  // Basado en la interpretación del NEWS2 (Royal College of Physicians), la misma del documento.
  private responseFor(news2: number | null, anyThree: boolean) {
    if (news2 === null) {
      return { level: 'normal', title: 'NEWS2 incompleto', text: 'Faltan parámetros para calcular el total. Registra los 7 parámetros.' };
    }
    if (news2 >= 7) {
      return { level: 'alto', title: 'Riesgo alto · respuesta de emergencia', text: 'Evaluación de emergencia por un equipo con competencias en cuidado crítico. Monitoreo continuo de signos vitales.' };
    }
    if (news2 >= 5) {
      return { level: 'medio', title: 'Riesgo medio · respuesta urgente', text: 'Evaluación urgente por un clínico con competencias en paciente agudo. Monitoreo como mínimo cada hora.' };
    }
    if (anyThree) {
      return { level: 'medio', title: 'Un parámetro en rango crítico', text: 'Revisión urgente por el clínico de la sala para decidir si se escala la atención. Monitoreo como mínimo cada hora.' };
    }
    if (news2 >= 1) {
      return { level: 'bajo', title: 'Riesgo bajo', text: 'Valoración por enfermería para decidir si aumentar la frecuencia de monitoreo. Monitoreo como mínimo cada 4 a 6 horas.' };
    }
    return { level: 'normal', title: 'Sin puntaje de riesgo', text: 'Monitoreo rutinario, como mínimo cada 12 horas.' };
  }
}