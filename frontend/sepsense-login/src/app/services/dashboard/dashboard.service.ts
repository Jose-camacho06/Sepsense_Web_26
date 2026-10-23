import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../config/api.config';
import { AppUser } from '../users/users.service';

export interface DashboardData {
  stats: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    total_roles: number;
    active_roles: number;
  };
  users_by_role: { role: string; total: number }[];
  registrations_by_month: { month: string; total: number }[];
  recent_users: AppUser[];
}

export interface DashboardResponse {
  ok: boolean;
  message: string;
  dashboard: DashboardData;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  get() {
    return this.http.get<DashboardResponse>(`${API_URL}/dashboard`);
  }
}