import { inject } from '@angular/core';

import { HttpInterceptorFn } from '@angular/common/http';

import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  request,

  next,
) => {
  const authService = inject(AuthService);

  const token = authService.getAccessToken();

  if (!token) {
    return next(request);
  }

  const requestWithToken = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(requestWithToken);
};
