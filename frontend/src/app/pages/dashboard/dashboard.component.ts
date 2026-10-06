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
        <div class="row g-4 mb-4">
          <!-- Recent Matters Table -->
          <div class="col-12 col-lg-8">
            <app-card title="Active Legal Matters" icon="bi-folder2-open" [hasCustomHeader]="true">
              <div card-actions>
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

          <!-- Upcoming Deadlines & Calendar -->
          <div class="col-12 col-lg-4">
            <app-card title="Court Deadlines" icon="bi-calendar-event">
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
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardData | null = null;
  loading: boolean = true;
  currentUser: User | null = null;
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
