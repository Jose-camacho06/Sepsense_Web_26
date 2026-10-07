import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { API_URL } from '../../config/api.config';

export interface AuthUser {
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

export interface LoginResponse {
  ok: boolean;

  message: string;

  access_token: string;

  refresh_token: string;

  token_type: string;

  expires_in: number;

  user: AuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  login(
    email: string,

    password: string,
  ) {
    return this.http.post<LoginResponse>(
      `${API_URL}/auth/login`,

      {
        email,

        password,
      },
    );
  }

  register(data: {
    identification: string;

    first_name: string;

    last_name: string;

    email: string;

    password: string;
  }) {
    return this.http.post<any>(
      `${API_URL}/auth/register`,

      data,
    );
  }

  saveSession(response: LoginResponse) {
    sessionStorage.setItem(
      'access_token',

      response.access_token,
    );

    sessionStorage.setItem(
      'refresh_token',

      response.refresh_token,
    );

    sessionStorage.setItem(
      'current_user',

      JSON.stringify(response.user),
    );
  }

  getAccessToken() {
    return sessionStorage.getItem('access_token');
  }

  getCurrentUser(): AuthUser | null {
    const data = sessionStorage.getItem('current_user');

    if (!data) {
      return null;
    }

    return JSON.parse(data) as AuthUser;
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  isAdmin() {
    return this.getCurrentUser()?.role === 'admin';
  }

  getMe() {
    return this.http.get<any>(`${API_URL}/auth/me`);
  }

  updateMe(data: {
    identification?: string;

    first_name?: string;

    last_name?: string;

    email?: string;
  }) {
    return this.http.patch<any>(
      `${API_URL}/auth/me`,

      data,
    );
  }

  clearSession() {
    sessionStorage.removeItem('access_token');

    sessionStorage.removeItem('refresh_token');

    sessionStorage.removeItem('current_user');
  }
}
