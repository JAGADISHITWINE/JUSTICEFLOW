import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="app-top-navbar">
      <div class="navbar-left">
        <button type="button" class="btn-sidebar-toggle" (click)="toggleSidebar()">
          <i class="bi bi-list"></i>
        </button>

        <div class="brand-container d-md-none">
          <span class="brand-icon"><i class="bi bi-shield-shaded"></i></span>
          <span class="brand-text">JusticeFlow</span>
        </div>

        <div class="search-box d-none d-md-flex">
          <i class="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search cases, clients, documents..."
            (input)="onSearch($event)"
            class="form-control-navbar"
          />
        </div>
      </div>

      <div class="navbar-right">
        <!-- Practice Area Quick Indicator -->
        <div class="practice-badge d-none d-lg-flex">
          <span class="pulse-indicator"></span>
          <span>Law Firm Gateway Active</span>
        </div>

        <!-- Notification Bell -->
        <div class="notification-wrapper">
          <button type="button" class="btn-icon-nav" title="Notifications">
            <i class="bi bi-bell"></i>
            <span class="notification-dot"></span>
          </button>
        </div>

        <!-- User Profile Dropdown -->
        <div class="user-profile-menu">
          <div class="profile-info-trigger" (click)="toggleDropdown()">
            <img
              [src]="currentUser?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'"
              alt="User Avatar"
              class="avatar-img"
            />
            <div class="user-meta d-none d-sm-block">
              <span class="user-fullname">{{ currentUser?.name || 'Alexander Vance, Esq.' }}</span>
              <span class="user-role">{{ currentUser?.role || 'Partner & Lead Attorney' }}</span>
            </div>
            <i class="bi bi-chevron-down ms-1 text-muted" style="font-size: 0.75rem;"></i>
          </div>

          <div *ngIf="dropdownOpen" class="user-dropdown-card">
            <div class="dropdown-header">
              <p class="mb-0 fw-semibold text-dark">{{ currentUser?.name }}</p>
              <small class="text-muted">{{ currentUser?.email }}</small>
            </div>
            <div class="dropdown-divider"></div>
            <a routerLink="/dashboard" class="dropdown-item-link" (click)="dropdownOpen = false">
              <i class="bi bi-speedometer2 me-2"></i> Dashboard
            </a>
            <a routerLink="/cases" class="dropdown-item-link" (click)="dropdownOpen = false">
              <i class="bi bi-briefcase me-2"></i> My Active Cases
            </a>
            <a routerLink="/time-tracking" class="dropdown-item-link" (click)="dropdownOpen = false">
              <i class="bi bi-clock-history me-2"></i> Logged Billable Hours
            </a>
            <div class="dropdown-divider"></div>
            <button type="button" class="dropdown-item-link text-danger border-0 bg-transparent w-100 text-start" (click)="onLogout()">
              <i class="bi bi-box-arrow-right me-2"></i> Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-top-navbar {
      height: 64px;
      background: #FFFFFF;
      border-bottom: 1px solid #E2E8F0;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 1020;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

      .navbar-left {
        display: flex;
        align-items: center;
        gap: 1.25rem;

        .btn-sidebar-toggle {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: #1E293B;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background-color: #F1F5F9;
            color: #2563EB;
          }
        }

        .brand-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .brand-icon {
            color: #2563EB;
            font-size: 1.25rem;
          }

          .brand-text {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 1.15rem;
            color: #0F172A;
          }
        }

        .search-box {
          position: relative;
          align-items: center;

          .search-icon {
            position: absolute;
            left: 0.85rem;
            color: #94A3B8;
            font-size: 0.9rem;
          }

          .form-control-navbar {
            padding: 0.45rem 0.85rem 0.45rem 2.25rem;
            border-radius: 20px;
            border: 1px solid #CBD5E1;
            background-color: #F8FAFC;
            font-size: 0.85rem;
            width: 280px;
            transition: all 0.2s ease;

            &:focus {
              outline: none;
              border-color: #2563EB;
              width: 340px;
              background-color: #FFFFFF;
              box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
            }
          }
        }
      }

      .navbar-right {
        display: flex;
        align-items: center;
        gap: 1.25rem;

        .practice-badge {
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.75rem;
          background: #E8F8F0;
          color: #27AE60;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;

          .pulse-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #27AE60;
            box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7);
            animation: pulse 1.8s infinite;
          }
        }

        .btn-icon-nav {
          background: none;
          border: none;
          position: relative;
          color: #7F8C8D;
          font-size: 1.2rem;
          cursor: pointer;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;

          &:hover {
            background-color: #F1F5F9;
            color: #0F172A;
          }

          .notification-dot {
            position: absolute;
            top: 7px;
            right: 8px;
            width: 7px;
            height: 7px;
            background-color: #EF4444;
            border-radius: 50%;
          }
        }

        .user-profile-menu {
          position: relative;

          .profile-info-trigger {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            cursor: pointer;
            padding: 0.25rem 0.5rem;
            border-radius: 8px;
            transition: background-color 0.2s;

            &:hover {
              background-color: #F1F5F9;
            }

            .avatar-img {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              object-fit: cover;
              border: 2px solid #2563EB;
            }

            .user-meta {
              display: flex;
              flex-direction: column;
              line-height: 1.2;

              .user-fullname {
                font-size: 0.85rem;
                font-weight: 600;
                color: #2C3E50;
              }

              .user-role {
                font-size: 0.75rem;
                color: #7F8C8D;
                text-transform: capitalize;
              }
            }
          }

          .user-dropdown-card {
            position: absolute;
            top: 115%;
            right: 0;
            width: 220px;
            background: #FFFFFF;
            border-radius: 10px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            border: 1px solid #ECF0F1;
            padding: 0.5rem 0;
            z-index: 1060;
            animation: fadeIn 0.15s ease-out;

            .dropdown-header {
              padding: 0.5rem 1rem;
            }

            .dropdown-divider {
              height: 1px;
              background-color: #ECF0F1;
              margin: 0.4rem 0;
            }

            .dropdown-item-link {
              display: flex;
              align-items: center;
              padding: 0.6rem 1rem;
              font-size: 0.85rem;
              color: #2C3E50;
              text-decoration: none;
              transition: background-color 0.15s;

              &:hover {
                background-color: #F8FAFC;
                color: #3498DB;
              }
            }
          }
        }
      }
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(39, 174, 96, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
    }
  `]
})
export class AppNavbarComponent {
  @Input() currentUser: User | null = null;
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() globalSearch = new EventEmitter<string>();

  dropdownOpen: boolean = false;

  constructor(private authService: AuthService) {}

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onSearch(event: any) {
    this.globalSearch.emit(event.target.value);
  }

  onLogout() {
    this.dropdownOpen = false;
    this.authService.logout();
  }
}
