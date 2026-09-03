import { Component, inject , signal} from '@angular/core';
import { Router,NavigationEnd, RouterLink } from '@angular/router';
import{filter} from 'rxjs';


@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private router = inject(Router);
  pageTitle = signal('Dashboard');


  constructor(){
    this.updatePageTitle();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
    });
  }

private updatePageTitle() {
  const url = this.router.url;
  if (url.includes('usuarios')) {
    this.pageTitle.set('Usuarios');
    return;
  }
if (url.includes('dashboard')) {
    this.pageTitle.set('Dashboard');
    return;
  }
  if (url.includes('home')) {
    this.pageTitle.set('Home');
    return;
  }
}
}
  