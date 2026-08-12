import { Component, inject } from '@angular/core';
import {Router} from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';  
import { required } from '@angular/forms/signals';

// ##Para formularios de inicio
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  userTest = "Jose"
  password="1234567"

  form =this.fb.group({
    user: ['',Validators.required],
    password:['',Validators.required],
  
  });
  initLogin() {
  console.log('Login Iniciado');
  //window.location.href = '/home';
  this.router.navigate(['/home']);

}
submit(){
  
}
}

 