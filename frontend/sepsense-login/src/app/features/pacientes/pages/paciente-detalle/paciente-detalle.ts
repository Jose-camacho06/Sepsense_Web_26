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
}