import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', Validators.email],
    codigo: ['', Validators.required],
  });

  ingresar() {
    if (this.form.valid) {
      console.log(' contraseña recuperada')
      this.router.navigate(['/login']);
    } else {
      //this.errorMessage = 'correo o código inválido';;
    }
  }
  irRegistro() {
    this.router.navigate(['/registro']);
  }

  reenviarCodigo() {
    console.log('Código reenviado');
    alert('Código reenviado');
  }

}
