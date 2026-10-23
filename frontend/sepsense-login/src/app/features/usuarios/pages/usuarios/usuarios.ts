import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Role, RolesService } from '../../../../services/roles/roles.service';
import { AppUser, UsersService } from '../../../../services/users/users.service';

@Component({
  selector: 'app-usuarios',
  imports: [],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  private usersService = inject(UsersService);
  private rolesService = inject(RolesService);
  private cdr = inject(ChangeDetectorRef);

  users: AppUser[] = [];
  roles: Role[] = [];
  search = '';
  page = 1;
  pages = 1;
  total = 0;
  message = '';

  constructor() {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles() {
    this.rolesService.list().subscribe({
      next: (response) => {
        this.roles = response.roles;
        this.cdr.markForCheck();
      },
    });
  }

  loadUsers() {
    this.usersService.list(this.page, this.search).subscribe({
      next: (response) => {
        this.users = response.users;
        this.pages = response.pagination.pages;
        this.total = response.pagination.total;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible consultar los usuarios.';
        this.cdr.markForCheck();
      },
    });
  }

  onSearch(value: string) {
    this.search = value.trim();
    this.page = 1;
    this.loadUsers();
  }

  goTo(page: number) {
    if (page < 1 || page > this.pages) {
      return;
    }
    this.page = page;
    this.loadUsers();
  }

  changeRole(user: AppUser, roleId: string) {
    this.usersService.update(user.id, { role_id: Number(roleId) }).subscribe({
      next: (response) => {
        this.message = response.message;
        this.loadUsers();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible cambiar el rol.';
        this.loadUsers();
        this.cdr.markForCheck();
      },
    });
  }

  toggleActive(user: AppUser) {
    const request$ = user.is_active
      ? this.usersService.deactivate(user.id)
      : this.usersService.update(user.id, { is_active: true });

    request$.subscribe({
      next: (response) => {
        this.message = response.message;
        this.loadUsers();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible cambiar el estado.';
        this.cdr.markForCheck();
      },
    });
  }
}