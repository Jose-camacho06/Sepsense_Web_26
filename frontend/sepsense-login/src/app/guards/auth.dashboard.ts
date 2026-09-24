import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';

export const authDashboard: CanActivateFn = () => {
    const router = inject(Router);

    const rol = sessionStorage.getItem('usuarioActivo');

    if(rol === 'admin'){
        return true
    }
    
    return false
};