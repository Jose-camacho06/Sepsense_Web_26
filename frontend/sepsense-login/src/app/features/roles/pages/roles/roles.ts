import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ROL_USER_MOCK } from '../../../../mocks/login/roles.mock';

@Component({
  selector: 'app-roles',
  imports: [RouterLink, CommonModule],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class Roles {
    roles = ROL_USER_MOCK;
}