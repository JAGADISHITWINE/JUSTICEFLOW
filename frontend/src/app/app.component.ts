import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { NotificationService, ToastMessage } from './core/services/notification.service';
import { ThemeService } from './core/services/theme.service';
import { User } from './core/models/models';
import { AppNavbarComponent } from './shared/components/navbar/navbar.component';
import { AppSidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, AppNavbarComponent, AppSidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthPage: boolean = true;
  sidebarCollapsed: boolean = false;
  sidebarMobileOpen: boolean = false;
  currentUser: User | null = null;
  toasts: ToastMessage[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private themeService: ThemeService
  ) {
    // Check path immediately on construction
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    this.isAuthPage = this.checkIsAuthPage(path);
  }

  private checkIsAuthPage(url: string): boolean {
    if (!url) return true; // Default to standalone if path is empty/root before redirect
    const cleanUrl = url.split('?')[0].split('#')[0];
    return cleanUrl === '' || cleanUrl === '/' || cleanUrl.includes('/login') || cleanUrl.startsWith('/portal');
  }

  ngOnInit(): void {
    // Initial check with router URL or window path
    const initialUrl = this.router.url || (typeof window !== 'undefined' ? window.location.pathname : '');
    this.isAuthPage = this.checkIsAuthPage(initialUrl);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.isAuthPage = this.checkIsAuthPage(url);
        this.sidebarMobileOpen = false;
      });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.notificationService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  toggleSidebar() {
    this.sidebarMobileOpen = !this.sidebarMobileOpen;
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  closeMobileSidebar() {
    this.sidebarMobileOpen = false;
  }

  removeToast(id: number) {
    this.notificationService.remove(id);
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill text-success';
      case 'error': return 'bi-exclamation-triangle-fill text-danger';
      case 'warning': return 'bi-exclamation-circle-fill text-warning';
      default: return 'bi-info-circle-fill text-info';
    }
  }
}
