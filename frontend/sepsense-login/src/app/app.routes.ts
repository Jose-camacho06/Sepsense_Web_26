import { Routes } from '@angular/router';
export const routes: Routes = [
 
  {
    path: 'home',
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
  path: '',
  pathMatch: 'full',
  redirectTo: 'login',
 },
 {
  path: '**',
  redirectTo: 'login',
 },
];