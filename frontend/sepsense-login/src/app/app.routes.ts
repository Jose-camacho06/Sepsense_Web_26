import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guards';
import { authDashboard } from './guards/auth.dashboard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((component) => component.Login),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((component) => component.Register),
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password/forgot-password').then(
        (component) => component.ForgotPassword,
      ),
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout').then((component) => component.MainLayout),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/pages/home/home').then((component) => component.Home),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/roles/pages/roles/roles').then((component) => component.Roles),
      },
        {
    path: 'dashboard',
    canActivate: [authDashboard],
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard').then((component) => component.Dashboard),
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./features/usuarios/pages/usuarios/usuarios').then((component) => component.Usuarios),
  },

    ],
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];