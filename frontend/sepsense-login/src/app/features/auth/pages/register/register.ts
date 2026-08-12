import { Component, inject } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  showPassword = false;
  form = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  });
  submit() {
    console.log('Formulario enviado', this.form.value);
  }
}

