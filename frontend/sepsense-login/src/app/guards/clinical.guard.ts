import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const clinicalGuard: CanActivateFn = () => {
  const role = inject(AuthService).getCurrentUser()?.role;
  if (role === 'doctor' || role === 'enfermero') {
    return true;
  }
  return inject(Router).createUrlTree(['/home']);
};