import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicalService, PatientSummary, RiskLevel } from '../../../../services/clinical/clinical.service';

@Component({
  selector: 'app-pacientes',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.scss',
})
export class Pacientes {
  private fb = inject(FormBuilder);
  private clinical = inject(ClinicalService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  patients: PatientSummary[] = [];
  search = '';
  message = '';
  showForm = false;
  isSaving = false;

  form = this.fb.group({
    identification: ['', Validators.required],
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    birth_date: [''],
    sex: [''],
    floor: [''],
    room: [''],
  });

  constructor() {
    this.load();
  }

  load() {
    this.clinical.listPatients(this.search).subscribe({
      next: (response) => {
        this.patients = response.patients;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible consultar los pacientes.';
        this.cdr.markForCheck();
      },
    });
  }

  onSearch(value: string) {
    this.search = value.trim();
    this.load();
  }

  open(patient: PatientSummary) {
    this.router.navigate(['/pacientes', patient.id]);
  }

  riskLabel(risk: RiskLevel) {
    return { alto: 'Alto', medio: 'Medio', bajo: 'Bajo', normal: 'Sin alertas' }[risk];
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const v = this.form.getRawValue();
    this.clinical
      .createPatient({
        identification: v.identification ?? '',
        first_name: v.first_name ?? '',
        last_name: v.last_name ?? '',
        birth_date: v.birth_date || null,
        sex: v.sex || null,
        floor: v.floor || null,
        room: v.room || null,
      })
      .subscribe({
        next: (response) => {
          this.message = response.message;
          this.isSaving = false;
          this.showForm = false;
          this.form.reset({
            identification: '',
            first_name: '',
            last_name: '',
            birth_date: '',
            sex: '',
            floor: '',
            room: '',
          });
          this.load();
        },
        error: (error) => {
          this.message = error.error?.message ?? 'No fue posible registrar el paciente.';
          this.isSaving = false;
          this.cdr.markForCheck();
        },
      });
  }
}