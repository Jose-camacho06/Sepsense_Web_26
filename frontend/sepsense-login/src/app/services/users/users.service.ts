import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../../config/api.config';

export interface AppUser {
  id: number;
  identification: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface UsersResponse {
  ok: boolean;
  message: string;
  users: AppUser[];
  pagination: { page: number; pages: number; per_page: number; total: number };
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);

  list(page: number, search: string) {
    let params = new HttpParams().set('page', page).set('per_page', 10);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<UsersResponse>(`${API_URL}/users`, { params });
  }

  update(id: number, data: { role_id?: number; is_active?: boolean }) {
    return this.http.patch<{ ok: boolean; message: string }>(`${API_URL}/users/${id}`, data);
  }

  deactivate(id: number) {
    return this.http.delete<{ ok: boolean; message: string }>(`${API_URL}/users/${id}`);
  }
}