import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface MenuItem {
  title: string;
  path: string;
  icon: string;
  badge?: string | number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="app-sidebar" [class.collapsed]="collapsed" [class.mobile-open]="mobileOpen">
      <!-- Sidebar Brand Header -->
      <div class="sidebar-header">
        <div class="brand-wrapper">
          <div class="brand-symbol">
            <img src="assets/logo-icon.png" alt="JusticeFlow Logo" class="brand-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
            <i class="bi bi-shield-shaded" style="display: none;"></i>
          </div>
          <div class="brand-text-block" *ngIf="!collapsed">
            <span class="brand-name">JUSTICEFLOW</span>
            <span class="brand-tagline">Legal Practice OS</span>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <div class="nav-section-title" *ngIf="!collapsed">MAIN PRACTICE</div>
        <ul class="nav-list">
          <li *ngFor="let item of menuItems" class="nav-item">
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
              class="nav-link"
              (click)="onNavigate()"
              [title]="collapsed ? item.title : ''">
              <i class="bi nav-icon" [ngClass]="item.icon"></i>
              <span class="nav-title" *ngIf="!collapsed">{{ item.title }}</span>
              <span *ngIf="!collapsed && item.badge" class="badge-nav">{{ item.badge }}</span>
            </a>
          </li>
        </ul>

        <div class="nav-section-title mt-3" *ngIf="!collapsed">CLIENT PORTAL</div>
        <ul class="nav-list" *ngIf="!collapsed">
          <li class="nav-item">
            <a
              routerLink="/portal/login"
              target="_blank"
              class="nav-link text-success border border-success-subtle bg-success-subtle bg-opacity-10"
              title="Open Client Portal in New Window">
              <i class="bi bi-box-arrow-up-right nav-icon text-success"></i>
              <span class="nav-title fw-bold">Client Self-Service</span>
              <span class="badge bg-success ms-auto" style="font-size: 10px;">Portal</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <button type="button" class="btn-collapse" (click)="toggleCollapse()" [title]="collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'">
          <i class="bi" [ngClass]="collapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'"></i>
          <span *ngIf="!collapsed" class="ms-2">Collapse Menu</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: 260px;
      min-width: 260px;
      background: linear-gradient(180deg, #0B132B 0%, #0F172A 100%);
      color: #F1F5F9;
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 1030;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);

      &.collapsed {
        width: 72px;
        min-width: 72px;

        .sidebar-header {
          justify-content: center;
          padding: 1.25rem 0.5rem;
        }

        .nav-link {
          justify-content: center;
          padding: 0.85rem 0;

          .nav-icon {
            font-size: 1.35rem;
            margin: 0;
          }
        }

        .sidebar-footer {
          justify-content: center;
        }
      }

      .sidebar-header {
        height: 64px;
        display: flex;
        align-items: center;
        padding: 0 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);

        .brand-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .brand-symbol {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
            padding: 3px;
            overflow: hidden;

            .brand-logo-img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }

            i {
              color: #2563EB;
              font-size: 1.3rem;
            }
          }

          .brand-text-block {
            display: flex;
            flex-direction: column;
            line-height: 1.15;

            .brand-name {
              font-family: 'Outfit', sans-serif;
              font-weight: 700;
              font-size: 1.15rem;
              letter-spacing: 0.05em;
              color: #FFFFFF;
            }

            .brand-tagline {
              font-size: 0.7rem;
              color: #94A3B8;
              letter-spacing: 0.05em;
            }
          }
        }
      }

      .sidebar-nav {
        flex: 1;
        padding: 1.25rem 0.75rem;
        overflow-y: auto;

        .nav-section-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: #94A3B8;
          letter-spacing: 0.08em;
          padding: 0.5rem 0.75rem;
        }

        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          .nav-item {
            .nav-link {
              display: flex;
              align-items: center;
              gap: 0.85rem;
              padding: 0.75rem 0.75rem;
              border-radius: 10px;
              color: #94A3B8;
              font-size: 0.9rem;
              font-weight: 500;
              text-decoration: none;
              transition: all 0.2s ease;

              .nav-icon {
                font-size: 1.15rem;
                color: #64748B;
                transition: color 0.2s ease;
              }

              &:hover {
                background-color: rgba(255, 255, 255, 0.06);
                color: #FFFFFF;

                .nav-icon {
                  color: #38BDF8;
                }
              }

              &.active {
                background: linear-gradient(90deg, #2563EB, #1D4ED8);
                color: #FFFFFF;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);

                .nav-icon {
                  color: #FFFFFF;
                }
              }

              .badge-nav {
                margin-left: auto;
                background-color: #27AE60;
                color: #FFFFFF;
                font-size: 0.7rem;
                padding: 0.2rem 0.5rem;
                border-radius: 9999px;
                font-weight: 600;
              }
            }
          }
        }

        .microservices-status-panel {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-top: 0.5rem;

          .service-pill {
            font-size: 0.7rem;
            color: #BDC3C7;
            background: #243342;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 0.35rem;

            &.gateway {
              width: 100%;
              justify-content: center;
              background: rgba(52, 152, 219, 0.2);
              color: #3498DB;
              font-weight: 600;
            }

            .dot-green {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #27AE60;
            }

            .dot-blue {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #3498DB;
            }
          }
        }
      }

      .sidebar-footer {
        padding: 0.75rem 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);

        .btn-collapse {
          width: 100%;
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #7F8C8D;
          font-size: 0.85rem;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #FFFFFF;
            border-color: rgba(255, 255, 255, 0.2);
          }
        }
      }
    }
  `]
})
export class AppSidebarComponent {
  @Input() collapsed: boolean = false;
  @Input() mobileOpen: boolean = false;
  @Output() collapseChange = new EventEmitter<boolean>();
  @Output() navigate = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { title: 'Dashboard', path: '/dashboard', icon: 'bi-grid-1x2-fill' },
    { title: 'Clients', path: '/clients', icon: 'bi-people-fill' },
    { title: 'Cases', path: '/cases', icon: 'bi-briefcase-fill' },
    { title: 'Documents', path: '/documents', icon: 'bi-file-earmark-text-fill' },
    { title: 'Time Tracking', path: '/time-tracking', icon: 'bi-stopwatch-fill' },
    { title: 'Billing & Invoices', path: '/invoices', icon: 'bi-receipt-cutoff' },
    { title: 'Court Calendar', path: '/calendar', icon: 'bi-calendar3' },
    { title: 'Conflict Checker', path: '/conflicts', icon: 'bi-shield-check' },
    { title: 'Retainer Agreements', path: '/retainers', icon: 'bi-pen-fill' },
    { title: 'AI Assistant', path: '/ai-assistant', icon: 'bi-cpu-fill' }
  ];

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.collapseChange.emit(this.collapsed);
  }

  onNavigate() {
    this.navigate.emit();
  }
}
