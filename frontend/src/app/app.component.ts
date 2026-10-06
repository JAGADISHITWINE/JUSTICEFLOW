import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { NotificationService, ToastMessage } from './core/services/notification.service';
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
  isAuthPage: boolean = false;
  sidebarCollapsed: boolean = false;
  sidebarMobileOpen: boolean = false;
  currentUser: User | null = null;
  toasts: ToastMessage[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isAuthPage = event.url.includes('/login') || event.url.includes('/portal');
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
