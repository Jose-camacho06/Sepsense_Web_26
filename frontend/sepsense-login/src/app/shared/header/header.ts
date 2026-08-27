import { Component, inject , ChangeDetectorRef} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private router = inject(Router);
  private cdRef = inject(ChangeDetectorRef);

  get pageTitle() {
    if (this.router.url.includes('usuarios')) {
      this.cdRef.detectChanges();
      return 'Usuarios';
    }
    if (this.router.url.includes('dashboard')) {
      return 'Dashboard';
    }
    if (this.router.url.includes('perfil')) {
      return 'Perfil';
    }
    if (this.router.url.includes('home')) {
      return 'Home';
    }
    return 'Panel Principal';
  }
}
