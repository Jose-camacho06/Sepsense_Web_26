import { Component, inject } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  showPassword = false;
  showConfirmPassword = false;

  form = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  }, 
  { validators: this.passwordsMatch });
  
  passwordsMatch(form: any) {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}
  
  submit() {
    console.log('Formulario enviado', this.form.value);
    alert('Regsitrado con exito');
    this.router.navigate(['/login']);
}}


