import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role, RolesService } from '../../../../services/roles/roles.service';

@Component({
  selector: 'app-roles',
  imports: [ReactiveFormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class Roles {
  private fb = inject(FormBuilder);
  private rolesService = inject(RolesService);

  roles: Role[] = [];
  selectedRoleId: number | null = null;
  message = '';
  isSaving = false;

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    is_active: [true],
  });

  constructor() {
    this.loadRoles();
  }

  loadRoles() {
    this.rolesService.list().subscribe({
      next: (response) => {
        this.roles = response.roles;
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible consultar los roles.';
      },
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const value = this.form.getRawValue();
    const data = {
      name: value.name ?? '',
      description: value.description || null,
      is_active: value.is_active ?? true,
    };

    const request$ = this.selectedRoleId
      ? this.rolesService.update(this.selectedRoleId, data)
      : this.rolesService.create(data);

    request$.subscribe({
      next: (response) => {
        this.message = response.message;
        this.cancelEdit();
        this.loadRoles();
        this.isSaving = false;
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible guardar el rol.';
        this.isSaving = false;
      },
    });
  }

  edit(role: Role) {
    this.selectedRoleId = role.id;
    this.form.patchValue({
      name: role.name,
      description: role.description ?? '',
      is_active: role.is_active,
    });
  }

  cancelEdit() {
    this.selectedRoleId = null;
    this.form.reset({ name: '', description: '', is_active: true });
  }

  deactivate(role: Role) {
    if (!role.is_active) {
      return;
    }
    this.rolesService.deactivate(role.id).subscribe({
      next: (response) => {
        this.message = response.message;
        this.loadRoles();
      },
      error: (error) => {
        this.message = error.error?.message ?? 'No fue posible inactivar el rol.';
      },
    });
  }
}