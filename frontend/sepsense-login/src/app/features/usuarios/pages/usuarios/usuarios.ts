import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LOGIN_USER_MOCK } from '../../../../mocks/login/login.mock';

@Component({
  selector: 'app-usuarios',
  imports: [RouterLink, CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  usuarios = LOGIN_USER_MOCK;
}
