import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
 
@Component({
  selector: 'app-header',
 
  imports: [],
 
  templateUrl: './header.html',
 
  styleUrl: './header.scss',
})
export class Header {
  private router = inject(Router);
 
  pageTitle = signal('Dashboard');
 
  showProfileMenu = false;
  showProfileModal = false;
 
  constructor() {
    this.updatePageTitle();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
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
  }
 
  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    console.log('showProfileMenu:', this.showProfileMenu);
  }
 
  openProfileModal() {
    this.showProfileModal = true;
    this.showProfileMenu = false;
  }
 
  closeProfileModal() {
    this.showProfileModal = false;
  }
 
  logout() {
    sessionStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }
}