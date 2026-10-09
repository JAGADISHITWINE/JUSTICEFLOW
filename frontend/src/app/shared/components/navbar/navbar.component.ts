import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService, AppNotification } from '../../../core/services/notification.service';
import { User } from '../../../core/models/models';
import { AppThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, AppThemeToggleComponent],
  template: `
    <header class="app-top-navbar">
      <div class="navbar-left">
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
        <!-- Day / Night Mode Toggle Switch -->
        <div class="theme-toggle-container d-none d-sm-flex align-items-center">
          <app-theme-toggle variant="segmented"></app-theme-toggle>
        </div>
        <div class="theme-toggle-container d-flex d-sm-none align-items-center">
          <app-theme-toggle variant="icon"></app-theme-toggle>
        </div>

        <!-- Active Secure Session Indicator -->
        <div class="session-timer-badge d-none d-lg-flex align-items-center gap-1 px-2 py-1 rounded-pill border bg-light text-secondary border-secondary-subtle"
             title="Session is secure & active. Your work will not be interrupted.">
          <i class="bi bi-shield-check text-success"></i>
          <span class="small fw-semibold" style="font-size: 11px;">Active Session</span>
        </div>

        <!-- Practice Area Quick Indicator -->
        <div class="practice-badge d-none d-xl-flex">
          <span class="pulse-indicator"></span>
          <span>Active</span>
        </div>

        <!-- Notification Center Bell & Dropdown Flyout -->
        <div class="notification-wrapper position-relative">
          <button
            type="button"
            class="btn-icon-nav"
            (click)="toggleNotifications($event)"
            [class.active]="notificationsOpen"
            [attr.aria-expanded]="notificationsOpen"
            title="Notification Center - Court Notices, Retainers & Deadlines"
          >
            <i class="bi bi-bell"></i>
            <span *ngIf="(unreadCount$ | async) as count" class="notification-badge-count">
              {{ count > 9 ? '9+' : count }}
            </span>
          </button>

          <!-- Notification Center Dropdown Flyout -->
          <div *ngIf="notificationsOpen" class="notification-dropdown-card" (click)="$event.stopPropagation()">
            <!-- Flyout Header -->
            <div class="notif-card-header">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="notif-header-icon"><i class="bi bi-bell-fill"></i></span>
                  <div>
                    <h6 class="mb-0 fw-bold notif-header-title">Notification Center</h6>
                    <small class="text-muted notif-header-sub">Court & Practice Alerts</small>
                  </div>
                  <span *ngIf="(unreadCount$ | async) as count" class="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-2">
                    {{ count }} new
                  </span>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <button
                    type="button"
                    class="btn btn-sm btn-link text-decoration-none notif-header-action-btn"
                    (click)="markAllAsRead($event)"
                    title="Mark all notifications as read"
                  >
                    <i class="bi bi-check2-all me-1"></i>Mark all read
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-link text-decoration-none notif-header-action-btn text-danger"
                    (click)="clearAll($event)"
                    title="Clear all notifications"
                  >
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              </div>

              <!-- Filter Tabs -->
              <div class="notif-filter-tabs d-flex gap-1">
                <button
                  type="button"
                  class="notif-tab-btn"
                  [class.active]="selectedCategory === 'all'"
                  (click)="setCategory('all', $event)"
                >
                  All ({{ (notifications$ | async)?.length || 0 }})
                </button>
                <button
                  type="button"
                  class="notif-tab-btn"
                  [class.active]="selectedCategory === 'hearing'"
                  (click)="setCategory('hearing', $event)"
                >
                  <i class="bi bi-calendar2-event me-1"></i>Hearings
                </button>
                <button
                  type="button"
                  class="notif-tab-btn"
                  [class.active]="selectedCategory === 'billing'"
                  (click)="setCategory('billing', $event)"
                >
                  <i class="bi bi-currency-rupee me-1"></i>Billing & Trust
                </button>
                <button
                  type="button"
                  class="notif-tab-btn"
                  [class.active]="selectedCategory === 'conflict'"
                  (click)="setCategory('conflict', $event)"
                >
                  <i class="bi bi-shield-check me-1"></i>Conflicts
                </button>
              </div>
            </div>

            <!-- Notification Items Scrollable Body -->
            <div class="notif-card-body">
              <ng-container *ngIf="getFilteredList(notifications$ | async) as list">
                <div *ngIf="list.length === 0" class="notif-empty-state">
                  <i class="bi bi-bell-slash text-muted notif-empty-icon"></i>
                  <p class="mb-1 fw-semibold text-muted">All caught up!</p>
                  <small class="text-secondary">No notices in this category right now.</small>
                </div>

                <div
                  *ngFor="let item of list"
                  class="notif-item"
                  [class.unread]="!item.isRead"
                  (click)="onNotificationClick(item)"
                >
                  <div class="notif-icon-col">
                    <span class="notif-icon-badge" [ngClass]="getCategoryBadgeClass(item.category)">
                      <i class="bi" [ngClass]="getCategoryIcon(item.category)"></i>
                    </span>
                  </div>

                  <div class="notif-content-col">
                    <div class="d-flex align-items-start justify-content-between gap-1 mb-1">
                      <span class="notif-item-title" [class.fw-bold]="!item.isRead">{{ item.title }}</span>
                      <span *ngIf="item.priority === 'critical'" class="badge bg-danger text-white notif-priority-badge">Critical</span>
                      <span *ngIf="item.priority === 'high'" class="badge bg-warning text-dark notif-priority-badge">High</span>
                    </div>

                    <p class="notif-item-msg mb-1">{{ item.message }}</p>

                    <div class="d-flex align-items-center justify-content-between">
                      <span class="notif-item-time">
                        <i class="bi bi-clock me-1"></i>{{ item.timestamp }}
                      </span>
                      <div class="d-flex align-items-center gap-1" (click)="$event.stopPropagation()">
                        <button
                          *ngIf="!item.isRead"
                          type="button"
                          class="btn-notif-action"
                          (click)="markAsRead(item.id, $event)"
                          title="Mark as read"
                        >
                          <i class="bi bi-check2"></i>
                        </button>
                        <button
                          type="button"
                          class="btn-notif-action text-danger"
                          (click)="removeNotification(item.id, $event)"
                          title="Remove notification"
                        >
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>

            <!-- Footer Quick Link -->
            <div class="notif-card-footer text-center">
              <a routerLink="/calendar" (click)="notificationsOpen = false" class="text-decoration-none small fw-semibold text-primary">
                View Full Court Cause List & Calendar <i class="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
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
              <span class="user-fullname" [title]="currentUser?.name || ''">{{ displayName }}</span>
              <span class="user-role" [title]="displayDesignation">{{ displayDesignation }}</span>
            </div>
            <i class="bi bi-chevron-down ms-1 text-muted" style="font-size: 0.75rem;"></i>
          </div>

          <div *ngIf="dropdownOpen" class="user-dropdown-card">
            <div class="dropdown-header">
              <div class="dropdown-user-name">{{ displayName }}</div>
              <div class="dropdown-user-badge">
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
                  {{ displayDesignation }}
                </span>
              </div>
              <small class="dropdown-user-email">{{ currentUser?.email }}</small>
            </div>

            <!-- Day / Night quick toggle inside dropdown menu -->
            <div class="dropdown-theme-row px-3 py-2 d-flex align-items-center justify-content-between border-bottom">
              <span class="small fw-semibold d-flex align-items-center gap-2">
                <i class="bi" [ngClass]="themeService.isDark ? 'bi-moon-stars-fill text-info' : 'bi-sun-fill text-warning'"></i>
                <span>{{ themeService.isDark ? 'Night Theme' : 'Day Theme' }}</span>
              </span>
              <app-theme-toggle variant="toggle" [showLabel]="false"></app-theme-toggle>
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
      background: var(--jf-navbar-bg, #FFFFFF);
      border-bottom: 1px solid var(--jf-border, #E2E8F0);
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 1020;
      box-shadow: var(--jf-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04));
      transition: background-color 0.25s ease, border-color 0.25s ease;

      .navbar-left {
        display: flex;
        align-items: center;
        gap: 1.25rem;

        .btn-sidebar-toggle {
          background: var(--jf-bg-card, #FFFFFF);
          border: 1px solid var(--jf-border, #E2E8F0);
          border-radius: 8px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: var(--jf-text-primary, #1E293B);
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background-color: var(--jf-bg-subtle, #F1F5F9);
            color: var(--jf-accent-primary, #2563EB);
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
            color: var(--jf-text-primary, #0F172A);
          }
        }

        .search-box {
          position: relative;
          align-items: center;

          .search-icon {
            position: absolute;
            left: 0.85rem;
            color: var(--jf-text-subtle, #94A3B8);
            font-size: 0.9rem;
          }

          .form-control-navbar {
            padding: 0.45rem 0.85rem 0.45rem 2.25rem;
            border-radius: 20px;
            border: 1px solid var(--jf-border-input, #CBD5E1);
            background-color: var(--jf-bg-input, #F8FAFC);
            color: var(--jf-text-primary, #0F172A);
            font-size: 0.85rem;
            width: 280px;
            transition: all 0.2s ease;

            &:focus {
              outline: none;
              border-color: var(--jf-accent-primary, #2563EB);
              width: 340px;
              background-color: var(--jf-bg-card, #FFFFFF);
              box-shadow: 0 0 0 3px var(--jf-accent-glow, rgba(37, 99, 235, 0.15));
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
          background: rgba(39, 174, 96, 0.12);
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
          color: var(--jf-text-muted, #7F8C8D);
          font-size: 1.2rem;
          cursor: pointer;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, color 0.2s;

          &:hover, &.active {
            background-color: var(--jf-bg-subtle, #F1F5F9);
            color: var(--jf-accent-primary, #2563EB);
          }

          .notification-badge-count {
            position: absolute;
            top: 2px;
            right: 2px;
            min-width: 18px;
            height: 18px;
            padding: 0 4px;
            background-color: #DC2626;
            color: #FFFFFF;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            border: 2px solid var(--jf-navbar-bg, #FFFFFF);
            box-shadow: 0 1px 4px rgba(220, 38, 38, 0.4);
            animation: pulse-badge 2.4s infinite;
          }
        }

        .notification-dropdown-card {
          position: absolute;
          top: 120%;
          right: -60px;
          width: 420px;
          max-width: calc(100vw - 2rem);
          background: var(--jf-bg-dropdown, #FFFFFF);
          border-radius: 14px;
          box-shadow: 0 16px 40px -8px rgba(15, 23, 42, 0.2), 0 4px 12px -2px rgba(15, 23, 42, 0.08);
          border: 1px solid var(--jf-border, #E2E8F0);
          z-index: 1060;
          overflow: hidden;
          animation: fadeIn 0.18s ease-out;

          @media (max-width: 576px) {
            right: -80px;
            width: calc(100vw - 24px);
          }

          .notif-card-header {
            padding: 0.85rem 1rem 0.6rem 1rem;
            background-color: var(--jf-bg-card-footer, #F8FAFC);
            border-bottom: 1px solid var(--jf-border, #E2E8F0);

            .notif-header-icon {
              width: 28px;
              height: 28px;
              border-radius: 8px;
              background-color: rgba(37, 99, 235, 0.1);
              color: var(--jf-accent-primary, #2563EB);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.95rem;
            }

            .notif-header-title {
              font-size: 0.95rem;
              color: var(--jf-text-primary, #0F172A);
            }

            .notif-header-sub {
              font-size: 0.72rem;
            }

            .notif-header-action-btn {
              font-size: 0.75rem;
              padding: 0.15rem 0.4rem;
              color: var(--jf-text-muted, #64748B);

              &:hover {
                color: var(--jf-text-primary, #0F172A);
              }
            }

            .notif-filter-tabs {
              overflow-x: auto;
              padding-bottom: 2px;

              .notif-tab-btn {
                background: none;
                border: 1px solid transparent;
                padding: 0.25rem 0.6rem;
                font-size: 0.75rem;
                font-weight: 500;
                color: var(--jf-text-muted, #64748B);
                border-radius: 6px;
                white-space: nowrap;
                cursor: pointer;
                transition: all 0.15s ease;

                &:hover {
                  background-color: var(--jf-bg-hover, #F1F5F9);
                  color: var(--jf-text-primary, #0F172A);
                }

                &.active {
                  background-color: var(--jf-accent-primary, #2563EB);
                  color: #FFFFFF;
                  font-weight: 600;
                  border-color: var(--jf-accent-primary, #2563EB);
                }
              }
            }
          }

          .notif-card-body {
            max-height: 380px;
            overflow-y: auto;

            &::-webkit-scrollbar {
              width: 5px;
            }
            &::-webkit-scrollbar-thumb {
              background-color: var(--jf-border, #CBD5E1);
              border-radius: 4px;
            }

            .notif-empty-state {
              padding: 2.5rem 1rem;
              text-align: center;

              .notif-empty-icon {
                font-size: 2.2rem;
                display: block;
                margin-bottom: 0.5rem;
                opacity: 0.5;
              }
            }

            .notif-item {
              display: flex;
              gap: 0.75rem;
              padding: 0.85rem 1rem;
              border-bottom: 1px solid var(--jf-border, #F1F5F9);
              cursor: pointer;
              transition: background-color 0.15s ease;

              &:hover {
                background-color: var(--jf-bg-hover, #F8FAFC);
              }

              &.unread {
                background-color: rgba(37, 99, 235, 0.04);
                border-left: 3px solid var(--jf-accent-primary, #2563EB);
              }

              .notif-icon-col {
                flex-shrink: 0;

                .notif-icon-badge {
                  width: 34px;
                  height: 34px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 0.95rem;

                  &.badge-hearing {
                    background-color: rgba(220, 38, 38, 0.12);
                    color: #DC2626;
                  }
                  &.badge-billing {
                    background-color: rgba(16, 185, 129, 0.12);
                    color: #059669;
                  }
                  &.badge-retainer {
                    background-color: rgba(139, 92, 246, 0.12);
                    color: #7C3AED;
                  }
                  &.badge-conflict {
                    background-color: rgba(245, 158, 11, 0.12);
                    color: #D97706;
                  }
                  &.badge-doc {
                    background-color: rgba(6, 182, 212, 0.12);
                    color: #0891B2;
                  }
                  &.badge-system {
                    background-color: rgba(100, 116, 139, 0.12);
                    color: #475569;
                  }
                }
              }

              .notif-content-col {
                flex: 1;
                min-width: 0;

                .notif-item-title {
                  font-size: 0.82rem;
                  color: var(--jf-text-primary, #0F172A);
                  line-height: 1.3;
                  word-break: break-word;
                }

                .notif-priority-badge {
                  font-size: 0.65rem;
                  padding: 0.15rem 0.35rem;
                  border-radius: 4px;
                  letter-spacing: 0.02em;
                  text-transform: uppercase;
                  font-weight: 700;
                  flex-shrink: 0;
                }

                .notif-item-msg {
                  font-size: 0.77rem;
                  color: var(--jf-text-body, #475569);
                  line-height: 1.35;
                  word-break: break-word;
                }

                .notif-item-time {
                  font-size: 0.7rem;
                  color: var(--jf-text-muted, #94A3B8);
                }

                .btn-notif-action {
                  background: none;
                  border: none;
                  padding: 0.2rem 0.35rem;
                  border-radius: 4px;
                  font-size: 0.85rem;
                  color: var(--jf-text-muted, #94A3B8);
                  cursor: pointer;
                  transition: all 0.15s ease;

                  &:hover {
                    background-color: var(--jf-bg-subtle, #F1F5F9);
                    color: var(--jf-text-primary, #0F172A);
                  }

                  &.text-danger:hover {
                    color: #DC2626 !important;
                    background-color: rgba(220, 38, 38, 0.1);
                  }
                }
              }
            }
          }

          .notif-card-footer {
            padding: 0.65rem 1rem;
            background-color: var(--jf-bg-card-footer, #F8FAFC);
            border-top: 1px solid var(--jf-border, #E2E8F0);
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
              background-color: var(--jf-bg-subtle, #F1F5F9);
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
              max-width: 180px;

              .user-fullname {
                font-size: 0.85rem;
                font-weight: 600;
                color: var(--jf-text-primary, #2C3E50);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: block;
              }

              .user-role {
                font-size: 0.75rem;
                color: var(--jf-text-muted, #7F8C8D);
                text-transform: capitalize;
              }
            }
          }

          .user-dropdown-card {
            position: absolute;
            top: 115%;
            right: 0;
            width: 300px;
            max-width: calc(100vw - 2rem);
            background: var(--jf-bg-dropdown, #FFFFFF);
            border-radius: 12px;
            box-shadow: var(--jf-shadow-xl, 0 10px 25px -5px rgba(0, 0, 0, 0.15));
            border: 1px solid var(--jf-border, #E2E8F0);
            padding: 0.4rem 0;
            z-index: 1060;
            animation: fadeIn 0.15s ease-out;
            overflow: hidden;

            .dropdown-header {
              padding: 0.75rem 1rem;
              background-color: var(--jf-bg-card-footer, #F8FAFC);
              border-bottom: 1px solid var(--jf-border, #F1F5F9);

              .dropdown-user-name {
                font-size: 0.9rem;
                font-weight: 700;
                color: var(--jf-text-primary, #0F172A);
                line-height: 1.3;
                word-wrap: break-word;
                overflow-wrap: break-word;
                margin-bottom: 0.35rem;
              }

              .dropdown-user-badge {
                margin-bottom: 0.35rem;

                .badge {
                  font-size: 0.72rem;
                  font-weight: 500;
                  padding: 0.25rem 0.5rem;
                  border-radius: 6px;
                  white-space: normal;
                  text-align: left;
                  line-height: 1.35;
                  display: inline-block;
                  max-width: 100%;
                  word-break: break-word;
                }
              }

              .dropdown-user-email {
                font-size: 0.76rem;
                color: var(--jf-text-muted, #64748B);
                word-break: break-all;
                display: block;
              }
            }

            .dropdown-theme-row {
              background-color: var(--jf-bg-subtle, #F8FAFC);
              border-color: var(--jf-border, #F1F5F9);
              color: var(--jf-text-primary, #0F172A);
            }

            .dropdown-divider {
              height: 1px;
              background-color: var(--jf-border, #F1F5F9);
              margin: 0.35rem 0;
            }

            .dropdown-item-link {
              display: flex;
              align-items: center;
              padding: 0.6rem 1rem;
              font-size: 0.85rem;
              color: var(--jf-text-body, #2C3E50);
              text-decoration: none;
              transition: background-color 0.15s;

              &:hover {
                background-color: var(--jf-bg-hover, #F8FAFC);
                color: var(--jf-accent-primary, #3498DB);
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

    @keyframes pulse-badge {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
  `]
})
export class AppNavbarComponent {
  @Input() currentUser: User | null = null;
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() globalSearch = new EventEmitter<string>();

  dropdownOpen: boolean = false;
  notificationsOpen: boolean = false;
  selectedCategory: string = 'all';

  unreadCount$ = this.notificationService.unreadCount$;
  notifications$ = this.notificationService.notifications$;

  get displayName(): string {
    const raw = this.currentUser?.name || 'Alexander Vance, Esq.';
    const parenIndex = raw.indexOf('(');
    if (parenIndex > 0) {
      return raw.substring(0, parenIndex).trim();
    }
    return raw;
  }

  get displayDesignation(): string {
    const raw = this.currentUser?.name || '';
    const match = raw.match(/\((.*?)\)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return this.currentUser?.role === 'admin' ? 'Managing Partner' : (this.currentUser?.role || 'Advocate');
  }

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.notificationsOpen = false;
    }
  }

  toggleNotifications(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.dropdownOpen = false;
    }
  }

  setCategory(cat: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedCategory = cat;
  }

  getFilteredList(list: AppNotification[] | null): AppNotification[] {
    if (!list) return [];
    if (this.selectedCategory === 'all') return list;
    if (this.selectedCategory === 'hearing') {
      return list.filter(n => n.category === 'hearing');
    }
    if (this.selectedCategory === 'billing') {
      return list.filter(n => n.category === 'billing' || n.category === 'retainer');
    }
    if (this.selectedCategory === 'conflict') {
      return list.filter(n => n.category === 'conflict');
    }
    return list.filter(n => n.category === this.selectedCategory);
  }

  markAsRead(id: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.markAllAsRead();
  }

  removeNotification(id: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.removeNotification(id);
  }

  clearAll(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.clearAll();
  }

  onNotificationClick(item: AppNotification) {
    this.notificationService.markAsRead(item.id);
    this.notificationsOpen = false;
    if (item.link) {
      this.router.navigateByUrl(item.link);
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'hearing': return 'bi-calendar2-event-fill';
      case 'billing': return 'bi-currency-rupee';
      case 'retainer': return 'bi-file-earmark-check-fill';
      case 'conflict': return 'bi-shield-check';
      case 'document': return 'bi-file-earmark-text-fill';
      default: return 'bi-info-circle-fill';
    }
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'hearing': return 'badge-hearing';
      case 'billing': return 'badge-billing';
      case 'retainer': return 'badge-retainer';
      case 'conflict': return 'badge-conflict';
      case 'document': return 'badge-doc';
      default: return 'badge-system';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-wrapper')) {
      this.notificationsOpen = false;
    }
    if (!target.closest('.user-profile-menu')) {
      this.dropdownOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.notificationsOpen = false;
    this.dropdownOpen = false;
  }

  onSearch(event: any) {
    this.globalSearch.emit(event.target.value);
  }

  onLogout() {
    this.dropdownOpen = false;
    this.notificationsOpen = false;
    this.authService.logout();
  }
}
