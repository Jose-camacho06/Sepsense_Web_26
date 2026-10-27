import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../../config/api.config';

export type RiskLevel = 'alto' | 'medio' | 'bajo' | 'normal';

export interface Reading {
  id: number;
  respiratory_rate: number | null;
  spo2: number | null;
  supplemental_oxygen: boolean | null;
  systolic: number | null;
  diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  consciousness: string | null;
  news2: number | null;
  qsofa: number | null;
  shock_index: number | null;
  modified_shock_index: number | null;
  source: string;
  created_at: string;
}

export interface Alert {
  id: number;
  patient_id: number;
  patient_name: string | null;
  kind: string;
  score: number | null;
  message: string;
  level: RiskLevel;
  status: 'pendiente' | 'atendida';
  note: string | null;
  attended_at: string | null;
  created_at: string;
}

export interface PatientSummary {
  id: number;
  identification: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  age: number | null;
  sex: string | null;
  notes: string | null;
  last_reading: Reading | null;
  pending_alerts: number;
  risk: RiskLevel;
}

export interface PatientDetail extends PatientSummary {
  readings: Reading[];
  alerts: Alert[];
}

export interface NewPatient {
  identification: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  sex: string | null;
}
export interface ClinicalSummary {
  total_patients: number;
  by_risk: Record<RiskLevel, number>;
  pending_alerts: number;
  readings_last_hour: number;
  worsening: { patient_id: number; name: string; from: number; to: number; risk: RiskLevel }[];
  recent_alerts: Alert[];
}

@Injectable({
  providedIn: 'root',
})
export class ClinicalService {
  private http = inject(HttpClient);

  listPatients(search: string) {
    const params = search ? new HttpParams().set('search', search) : undefined;
    return this.http.get<{ message: string; patients: PatientSummary[] }>(`${API_URL}/patients`, { params });
  }

  getPatient(id: number) {
    return this.http.get<{ message: string; patient: PatientDetail }>(`${API_URL}/patients/${id}`);
  }

  createPatient(data: NewPatient) {
    return this.http.post<{ message: string }>(`${API_URL}/patients`, data);
  }

  addReading(patientId: number, data: Partial<Reading>) {
    return this.http.post<{ message: string; alerts: Alert[] }>(`${API_URL}/patients/${patientId}/readings`, data);
  }

  listAlerts(status: 'pendiente' | 'atendida' | 'todas') {
    return this.http.get<{ message: string; alerts: Alert[] }>(`${API_URL}/alerts`, { params: { status } });
  }

  attendAlert(id: number, note: string) {
    return this.http.patch<{ message: string }>(`${API_URL}/alerts/${id}/attend`, { note });
  }
  
  getSummary() {
  return this.http.get<{ message: string; summary: ClinicalSummary }>(`${API_URL}/clinical/summary`);
}
}