import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guards';
export const routes: Routes= [


 
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/pages/home/home').then((component) => component.Home),
  },
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
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/pages/perfil/perfil').then((component) => component.Perfil),
  },
 {
  path: '',
  loadComponent: () =>
   import('./features/auth/pages/register/register').then((component) => component.Register),
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