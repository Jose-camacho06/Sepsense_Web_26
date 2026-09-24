import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ROL_USER_MOCK } from '../../../../mocks/login/roles.mock';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  ngOnInit(){
    const rol = sessionStorage.getItem('usuarioActivo');
    console.log("sfdsfgsgfdsgfds",rol);
  
    const roleValid = ROL_USER_MOCK.find(
        (role) => role.rol === rol)

    if (!roleValid) {
      alert('No tiene permiso de ingreso');
      sessionStorage.removeItem('isLoggedIn');
      this.router.navigate(['/login']);
    }
  };

   

  


perfil_button() {
    this.router.navigate(['/perfil']);
  }
}
