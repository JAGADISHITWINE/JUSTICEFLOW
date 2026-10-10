import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaseService } from '../../core/services/case.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardData, User } from '../../core/models/models';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppBadgeComponent } from '../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppLoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppBadgeComponent, AppButtonComponent, AppLoaderComponent],
  template: `
    <div class="dashboard-page">
      <!-- Header with Greeting & Quick Actions -->
      <div class="dashboard-top-bar mb-4">
        <div class="welcome-box">
          <h2 class="page-title">Executive Law Firm Overview</h2>
          <p class="page-subtitle text-muted">
            Welcome back, <strong class="text-dark">{{ currentUser?.name }}</strong>. Here is the operational summary across all practice areas.
          </p>
        </div>

        <div class="quick-action-buttons">
          <a routerLink="/clients" class="btn btn-outline-primary">
            <i class="bi bi-person-plus-fill"></i> New Client
          </a>
          <a routerLink="/cases" class="btn btn-primary">
            <i class="bi bi-folder-plus"></i> New Matter
          </a>
          <a routerLink="/time-tracking" class="btn btn-secondary">
            <i class="bi bi-stopwatch"></i> Log Hours
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <app-loader *ngIf="loading" message="Loading practice intelligence..."></app-loader>

      <div *ngIf="!loading && stats">
        <!-- 4 Key Performance Indicators (KPI Cards) -->
        <div class="row g-3 mb-4">
          <!-- KPI 1: Active Cases -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="kpi-card">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <span class="kpi-label">Active Matters</span>
                  <h3 class="kpi-value">{{ (Number(stats.cases.open_cases) + Number(stats.cases.pending_cases)) || 0 }}</h3>
                  <div class="text-muted small">
                    <span class="text-success fw-semibold">{{ stats.cases.open_cases }} Open</span> &bull; {{ stats.cases.pending_cases }} Pending
                  </div>
                </div>
                <div class="kpi-icon" style="background-color: rgba(52, 152, 219, 0.12); color: #3498DB;">
                  <i class="bi bi-briefcase-fill"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- KPI 2: Retained Clients -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="kpi-card">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <span class="kpi-label">Retained Clients</span>
                  <h3 class="kpi-value">{{ stats.clients.active_clients || stats.clients.total_clients || 0 }}</h3>
                  <div class="text-muted small">
                    <span class="text-success fw-semibold">100% Retainer</span> satisfaction
                  </div>
                </div>
                <div class="kpi-icon" style="background-color: rgba(39, 174, 96, 0.12); color: #27AE60;">
                  <i class="bi bi-people-fill"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- KPI 3: Billable Hours -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="kpi-card">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <span class="kpi-label">Billable Hours</span>
                  <h3 class="kpi-value">{{ stats.time.billable_hours || '0.0' }} <span class="fs-6 fw-normal text-muted">hrs</span></h3>
                  <div class="text-muted small">
                    <span class="text-primary fw-semibold">{{ stats.time.total_hours }} total logged</span>
                  </div>
                </div>
                <div class="kpi-icon" style="background-color: rgba(44, 62, 80, 0.12); color: #2C3E50;">
                  <i class="bi bi-clock-history"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- KPI 4: Billed Realization / Revenue -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="kpi-card">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <span class="kpi-label">Billed Realization</span>
                  <h3 class="kpi-value">₹{{ formatCurrency(stats.time.total_billed_revenue) }}</h3>
                  <div class="text-muted small">
                    Budget: <span class="fw-semibold">₹{{ formatCurrency(stats.cases.total_budget) }}</span>
                  </div>
                </div>
                <div class="kpi-icon" style="background-color: rgba(243, 156, 18, 0.12); color: #D35400;">
                  <i class="bi bi-currency-rupee"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle Section: Recent Cases & Upcoming Deadlines -->
        <!-- Middle Section: Recent Cases & Upcoming Deadlines (X-Flow Collapsible) -->
        <div class="d-flex flex-column flex-lg-row align-items-stretch gap-4 mb-4 position-relative dashboard-xflow-container">
          
          <!-- Recent Matters Table (Expands along X-axis when deadlines are collapsed) -->
          <div class="cases-panel-xflow flex-grow-1" [class.is-expanded]="courtDeadlinesCollapsed">
            <app-card title="Active Legal Matters" icon="bi-folder2-open" [hasCustomHeader]="true">
              <div card-actions class="d-flex align-items-center gap-2">
                <!-- X-Flow Toggle Button in Matters Header -->
                <button
                  type="button"
                  class="btn btn-sm"
                  [ngClass]="courtDeadlinesCollapsed ? 'btn-outline-primary' : 'btn-outline-secondary'"
                  (click)="courtDeadlinesCollapsed = !courtDeadlinesCollapsed"
                  [title]="courtDeadlinesCollapsed ? 'Expand Court Deadlines panel horizontally (X-flow)' : 'Collapse Court Deadlines panel horizontally (X-flow)'">
                  <i class="bi" [ngClass]="courtDeadlinesCollapsed ? 'bi-layout-sidebar-reverse me-1' : 'bi-chevron-bar-right me-1'"></i>
                  <span>{{ courtDeadlinesCollapsed ? 'Show Deadlines (' + stats.upcomingDeadlines.length + ')' : 'Collapse Deadlines' }}</span>
                </button>

                <a routerLink="/cases" class="btn btn-sm btn-outline-primary">
                  View All ({{ stats.cases.total_cases }})
                </a>
              </div>

              <div class="table-responsive">
                <table class="table table-custom align-middle">
                  <thead>
                    <tr>
                      <th>Case & Docket #</th>
                      <th>Client</th>
                      <th>Practice Area</th>
                      <th>Status</th>
                      <th>Budget Spent</th>
                      <th class="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of stats.recentCases">
                      <td>
                        <a [routerLink]="['/cases', item.id]" class="fw-semibold text-dark text-hover-blue">
                          {{ item.case_name }}
                        </a>
                        <div class="text-muted small">{{ item.case_number }}</div>
                      </td>
                      <td>
                        <span class="text-dark">{{ item.client_name }}</span>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark border">{{ item.case_type }}</span>
                      </td>
                      <td>
                        <app-badge [status]="item.status"></app-badge>
                      </td>
                      <td style="min-width: 140px;">
                        <div class="d-flex justify-content-between small text-muted mb-1">
                          <span>₹{{ formatCurrency(item.spent) }}</span>
                          <span>₹{{ formatCurrency(item.budget) }}</span>
                        </div>
                        <div class="progress" style="height: 6px;">
                          <div
                            class="progress-bar"
                            [ngClass]="getProgressBarClass(item.spent, item.budget)"
                            [style.width.%]="calculatePercentage(item.spent, item.budget)">
                          </div>
                        </div>
                      </td>
                      <td class="text-end">
                        <a [routerLink]="['/cases', item.id]" class="btn btn-sm btn-outline-secondary py-1 px-2">
                          <i class="bi bi-arrow-right"></i>
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </app-card>
          </div>

          <!-- Upcoming Deadlines & Calendar (Collapses horizontally along X-axis) -->
          <div class="deadlines-panel-xflow" [class.is-x-collapsed]="courtDeadlinesCollapsed">
            
            <!-- Expanded Full Card Mode -->
            <div *ngIf="!courtDeadlinesCollapsed" class="deadlines-card-wrapper">
              <app-card
                title="Court Deadlines"
                icon="bi-calendar-event"
                [badgeText]="(stats.upcomingDeadlines.length || 0) + ' upcoming'"
                badgeClass="badge bg-danger-subtle text-danger border border-danger-subtle"
                [hasCustomHeader]="true"
              >
                <div card-actions class="d-flex align-items-center gap-1">
                  <a routerLink="/calendar" class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size: 0.78rem;" title="View Full Cause List & Calendar">
                    <i class="bi bi-calendar3 me-1"></i>Cause List
                  </a>
                  <!-- Collapse along X axis button -->
                  <button
                    type="button"
                    class="btn btn-sm btn-card-collapse-x"
                    (click)="courtDeadlinesCollapsed = true"
                    title="Collapse horizontally (X-flow)">
                    <i class="bi bi-chevron-bar-right"></i>
                  </button>
                </div>

                <div class="deadlines-list">
                  <div *ngFor="let deadline of stats.upcomingDeadlines" class="deadline-item">
                    <div class="deadline-date-box">
                      <span class="day">{{ formatDay(deadline.expected_close_date) }}</span>
                      <span class="month">{{ formatMonth(deadline.expected_close_date) }}</span>
                    </div>
                    <div class="deadline-details">
                      <a [routerLink]="['/cases', deadline.id]" class="deadline-title">
                        {{ deadline.case_name }}
                      </a>
                      <span class="deadline-client text-muted">{{ deadline.client_name }}</span>
                      <span class="badge bg-danger-subtle text-danger small mt-1">Filing Expected</span>
                    </div>
                  </div>

                  <div *ngIf="!stats.upcomingDeadlines || stats.upcomingDeadlines.length === 0" class="text-muted text-center py-3">
                    No upcoming deadlines scheduled.
                  </div>
                </div>
              </app-card>
            </div>

            <!-- Collapsed X-Flow Slim Rail Dock (Desktop & Tablet) -->
            <div
              *ngIf="courtDeadlinesCollapsed"
              class="deadlines-dock-rail d-none d-lg-flex"
              (click)="courtDeadlinesCollapsed = false"
              role="button"
              tabindex="0"
              (keydown.enter)="courtDeadlinesCollapsed = false"
              title="Expand Court Deadlines panel horizontally (X-flow)">
              <div class="dock-expand-arrow">
                <i class="bi bi-chevron-left"></i>
              </div>
              <div class="dock-icon-box">
                <i class="bi bi-calendar-event"></i>
              </div>
              <span class="dock-badge">{{ stats.upcomingDeadlines.length }}</span>
              <div class="dock-vertical-title">Court Deadlines</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      .dashboard-top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1.25rem;

        .welcome-box {
          .page-title {
            font-size: 1.65rem;
            margin: 0;
            color: #2C3E50;
          }

          .page-subtitle {
            margin: 0.25rem 0 0 0;
            font-size: 0.9rem;
          }
        }

        .quick-action-buttons {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }
      }

      .text-hover-blue:hover {
        color: #3498DB !important;
      }

      .deadlines-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .deadline-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid #ECF0F1;

          &:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          .deadline-date-box {
            width: 50px;
            height: 52px;
            background: #F8FAFC;
            border: 1px solid #BDC3C7;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            line-height: 1;

            .day {
              font-size: 1.15rem;
              font-weight: 700;
              color: #2C3E50;
            }

            .month {
              font-size: 0.65rem;
              text-transform: uppercase;
              color: #E74C3C;
              font-weight: 600;
              margin-top: 2px;
            }
          }

          .deadline-details {
            flex: 1;
            display: flex;
            flex-direction: column;

            .deadline-title {
              font-size: 0.875rem;
              font-weight: 600;
              color: #2C3E50;
              text-decoration: none;
              line-height: 1.3;

              &:hover {
                color: #3498DB;
              }
            }

            .deadline-client {
              font-size: 0.775rem;
              margin-top: 2px;
            }
          }
        }
      }

      /* X-Flow Horizontal Sliding Container Styles */
      .dashboard-xflow-container {
        position: relative;
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        .cases-panel-xflow {
          min-width: 0;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .deadlines-panel-xflow {
          flex-shrink: 0;
          width: 380px;
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);

          @media (max-width: 1200px) {
            width: 330px;
          }

          @media (max-width: 991px) {
            width: 100%;
          }

          &.is-x-collapsed {
            width: 48px;

            @media (max-width: 991px) {
              display: none;
            }
          }

          .deadlines-card-wrapper {
            height: 100%;
            animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .deadlines-dock-rail {
            width: 48px;
            height: 100%;
            min-height: 280px;
            background: var(--jf-bg-card, #FFFFFF);
            border: 1px solid var(--jf-border, #E2E8F0);
            border-radius: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem 0;
            gap: 0.85rem;
            cursor: pointer;
            box-shadow: var(--jf-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04));
            transition: all 0.25s ease;
            user-select: none;

            &:hover {
              background: var(--jf-bg-hover, #F8FAFC);
              border-color: #2563EB;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
              transform: translateX(-2px);

              .dock-expand-arrow {
                color: #2563EB;
                transform: translateX(-2px);
              }
            }

            .dock-expand-arrow {
              font-size: 0.85rem;
              color: var(--jf-text-muted, #64748B);
              transition: all 0.2s ease;
            }

            .dock-icon-box {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background: rgba(37, 99, 235, 0.1);
              color: #2563EB;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1rem;
            }

            .dock-badge {
              font-size: 0.72rem;
              font-weight: 700;
              background: rgba(220, 38, 38, 0.12);
              color: #DC2626;
              border: 1px solid rgba(220, 38, 38, 0.25);
              border-radius: 12px;
              padding: 0.15rem 0.45rem;
              line-height: 1;
            }

            .dock-vertical-title {
              writing-mode: vertical-rl;
              transform: rotate(180deg);
              font-size: 0.82rem;
              font-weight: 600;
              color: var(--jf-text-primary, #2C3E50);
              letter-spacing: 0.5px;
              margin-top: 0.5rem;
            }
          }

          .btn-card-collapse-x {
            background: none;
            border: 1px solid var(--jf-border, #E2E8F0);
            border-radius: 8px;
            width: 28px;
            height: 28px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--jf-text-muted, #64748B);
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              background-color: var(--jf-bg-subtle, #F1F5F9);
              color: #2563EB;
              border-color: #2563EB;
            }
          }
        }
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(40px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardData | null = null;
  loading: boolean = true;
  currentUser: User | null = null;
  courtDeadlinesCollapsed: boolean = false;
  Number = Number;

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.caseService.getDashboardStats().subscribe({
      next: res => {
        this.stats = res.data;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load dashboard stats', err);
        this.loading = false;
      }
    });
  }

  formatCurrency(val: any): string {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  calculatePercentage(spent: any, budget: any): number {
    const s = parseFloat(spent) || 0;
    const b = parseFloat(budget) || 1;
    return Math.min(Math.round((s / b) * 100), 100);
  }

  getProgressBarClass(spent: any, budget: any): string {
    const pct = this.calculatePercentage(spent, budget);
    if (pct > 90) return 'bg-danger';
    if (pct > 70) return 'bg-warning';
    return 'bg-success';
  }

  formatDay(dateStr?: string): string {
    if (!dateStr) return '01';
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }

  formatMonth(dateStr?: string): string {
    if (!dateStr) return 'JAN';
    return new Date(dateStr).toLocaleString('default', { month: 'short' });
  }
}
