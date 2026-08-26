import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
    private router = inject(Router);
  titulo = 'Panel Principal';

  private titulos: Record<string, string> = {
    '/home': 'Home',
    '/perfil': 'Perfil',
    '/dashboard': 'Dashboard',
    '/usuarios': 'Usuarios',
  
};

constructor() {
  this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe(() => {
      this.titulo = this.titulos[this.router.url] || 'Panel Principal';
    });
}
}
