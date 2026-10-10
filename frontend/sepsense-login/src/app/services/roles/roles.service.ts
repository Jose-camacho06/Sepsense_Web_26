import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../config/api.config';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface RolesResponse {
  ok: boolean;
  message: string;
  roles: Role[];
}

export interface RoleResponse {
  ok: boolean;
  message: string;
  role: Role;
}

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private http = inject(HttpClient);

  list() {
    return this.http.get<RolesResponse>(`${API_URL}/roles`);
  }

  create(data: { name: string; description: string | null; is_active: boolean }) {
    return this.http.post<RoleResponse>(`${API_URL}/roles`, data);
  }

  update(id: number, data: { name: string; description: string | null; is_active: boolean }) {
    return this.http.patch<RoleResponse>(`${API_URL}/roles/${id}`, data);
  }

  deactivate(id: number) {
    return this.http.delete<RoleResponse>(`${API_URL}/roles/${id}`);
  }
}