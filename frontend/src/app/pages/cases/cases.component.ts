import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CaseService } from '../../core/services/case.service';
import { NotificationService } from '../../core/services/notification.service';
import { Case, PaginationMeta } from '../../core/models/models';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppBadgeComponent } from '../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppModalComponent } from '../../shared/components/modal/modal.component';
import { CaseFormComponent } from './case-form.component';

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppCardComponent,
    AppBadgeComponent,
    AppButtonComponent,
    AppModalComponent,
    CaseFormComponent
  ],
  template: `
    <div class="cases-page">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1 fw-bold">
            <i class="bi bi-briefcase-fill text-primary me-2"></i>Legal Matters & Court Dockets
          </h2>
          <p class="text-muted small mb-0">
            Litigation docketing, e-Courts live synchronization, case diaries, and forum tracking
          </p>
        </div>
        <div class="d-flex gap-2">
          <button 
            class="btn btn-outline-primary d-flex align-items-center gap-2"
            [disabled]="syncingAll"
            (click)="syncAllCases()"
            title="Automatically query e-Courts portal for all active matters">
            <span *ngIf="syncingAll" class="spinner-border spinner-border-sm"></span>
            <i *ngIf="!syncingAll" class="bi bi-arrow-repeat"></i>
            <span>{{ syncingAll ? 'Syncing e-Courts...' : 'Live e-Courts Sync All' }}</span>
          </button>

          <app-button
            label="Open New Matter"
            icon="bi-folder-plus"
            variant="primary"
            (btnClick)="openAddModal()">
          </app-button>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="filters-card p-3 mb-4 bg-white rounded-3 border shadow-sm">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search matter, CNR #, docket, court, client..."
                [(ngModel)]="searchQuery"
                (keyup.enter)="loadCases()"
              />
            </div>
          </div>

          <div class="col-6 col-md-3">
            <select class="form-select" [(ngModel)]="courtForumFilter" (change)="loadCases()">
              <option value="All">All Judicial Forums</option>
              <option value="High Court">🏛️ High Court / Constitutional</option>
              <option value="Criminal Court">🔴 Criminal Court (Sessions / CJM)</option>
              <option value="Family Court">💜 Family Court</option>
              <option value="Commercial Court">🟢 Civil & Commercial Court</option>
              <option value="NCLT Tribunal">🟠 NCLT / IBC Tribunal</option>
              <option value="Consumer Forum">⚖️ Consumer Disputes</option>
            </select>
          </div>

          <div class="col-6 col-md-3">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="loadCases()">
              <option value="All">All Statuses</option>
              <option value="Open">Open / Active</option>
              <option value="Pending">Pending Arguments</option>
              <option value="On Hold">On Hold / Stayed</option>
              <option value="Closed">Closed / Disposed</option>
            </select>
          </div>

          <div class="col-12 col-md-2 text-end">
            <button class="btn btn-outline-secondary w-100" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Cases List Table -->
      <app-card [noPadding]="true">
        <div class="table-responsive">
          <table class="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Matter & Court Forum</th>
                <th>Official CNR / Docket</th>
                <th>Retained Client</th>
                <th>Status</th>
                <th>Fee Budget / Spent</th>
                <th>e-Courts Sync</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of cases">
                <!-- Case Name & Forum -->
                <td style="max-width: 280px;">
                  <div class="d-flex align-items-start gap-2">
                    <span [ngClass]="getForumBadgeClass(c.court_forum)" class="badge rounded-pill p-2 mt-1">
                      <i [ngClass]="getForumIcon(c.court_forum)"></i>
                    </span>
                    <div>
                      <a [routerLink]="['/cases', c.id]" class="fw-bold text-dark text-hover-blue text-decoration-none">
                        {{ c.case_name }}
                      </a>
                      <div class="small text-muted mt-1">
                        <span class="badge bg-light text-dark border me-1">{{ c.court_forum || 'Commercial Court' }}</span>
                        <span *ngIf="c.court_name" class="text-secondary small">&bull; {{ c.court_name }}</span>
                      </div>
                      <div *ngIf="c.fir_number" class="small text-danger mt-1">
                        <i class="bi bi-shield-exclamation me-1"></i>FIR: {{ c.fir_number }} ({{ c.police_station || 'Jurisdiction PS' }})
                      </div>
                    </div>
                  </div>
                </td>

                <!-- CNR & Docket -->
                <td>
                  <div *ngIf="c.cnr_number" class="d-flex align-items-center gap-1">
                    <code class="text-primary fw-bold font-monospace bg-light px-2 py-1 rounded border small">
                      {{ c.cnr_number }}
                    </code>
                    <button class="btn btn-sm btn-link text-muted p-0" title="Copy CNR Number" (click)="copyToClipboard(c.cnr_number)">
                      <i class="bi bi-clipboard"></i>
                    </button>
                  </div>
                  <div class="small text-muted mt-1">
                    <span>Docket: <strong>{{ c.case_number }}</strong></span>
                  </div>
                </td>

                <!-- Client -->
                <td>
                  <span class="text-dark fw-semibold">{{ c.client_name }}</span>
                  <div class="small text-muted">{{ c.client_email || 'Verified Client' }}</div>
                </td>

                <!-- Status -->
                <td>
                  <app-badge [status]="c.status"></app-badge>
                </td>

                <!-- Budget -->
                <td style="min-width: 140px;">
                  <div class="d-flex justify-content-between small text-muted mb-1 font-monospace">
                    <span>₹{{ formatCurrency(c.spent) }}</span>
                    <span>₹{{ formatCurrency(c.budget) }}</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div
                      class="progress-bar rounded"
                      [ngClass]="getProgressBarClass(c.spent, c.budget)"
                      [style.width.%]="calculatePercentage(c.spent, c.budget)">
                    </div>
                  </div>
                </td>

                <!-- e-Courts Sync Action -->
                <td>
                  <button 
                    *ngIf="c.cnr_number"
                    class="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    [disabled]="syncingCaseId === c.id"
                    (click)="syncCaseECourts(c)"
                    title="Fetch latest cause list & hearing date from e-Courts portal">
                    <span *ngIf="syncingCaseId === c.id" class="spinner-border spinner-border-sm"></span>
                    <i *ngIf="syncingCaseId !== c.id" class="bi bi-cloud-arrow-down-fill"></i>
                    <span style="font-size: 0.75rem;">{{ syncingCaseId === c.id ? 'Syncing...' : 'Sync Now' }}</span>
                  </button>
                  <span *ngIf="!c.cnr_number" class="badge bg-light text-muted border small" style="font-size: 0.7rem;">
                    No CNR Linked
                  </span>
                </td>

                <!-- Actions -->
                <td class="text-end">
                  <div class="btn-group">
                    <a [routerLink]="['/cases', c.id]" class="btn btn-sm btn-outline-primary" title="View Case Diary">
                      <i class="bi bi-eye"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-secondary" (click)="openEditModal(c)" title="Edit Matter">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(c)" title="Delete Matter">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="!loading && cases.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="bi bi-folder2-open display-6 d-block mb-2 text-muted"></i>
                  No legal matters match your criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="pagination.total > 0" class="d-flex justify-content-between align-items-center p-3 border-top bg-light">
          <small class="text-muted">Showing total <strong>{{ pagination.total }}</strong> docketed matters</small>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-secondary" [disabled]="pagination.page <= 1" (click)="changePage(pagination.page - 1)">
              Previous
            </button>
            <button class="btn btn-sm btn-primary text-white" disabled>{{ pagination.page }}</button>
            <button class="btn btn-sm btn-outline-secondary" [disabled]="pagination.page >= pagination.totalPages" (click)="changePage(pagination.page + 1)">
              Next
            </button>
          </div>
        </div>
      </app-card>

      <!-- Case Form Modal -->
      <app-case-form
        [isOpen]="isModalOpen"
        [caseItem]="selectedCase"
        [saving]="saving"
        (save)="saveCase($event)"
        (cancel)="isModalOpen = false">
      </app-case-form>

      <!-- Delete Confirmation Modal -->
      <app-modal
        [isOpen]="isDeleteModalOpen"
        title="Confirm Case Deletion"
        icon="bi-exclamation-triangle-fill"
        size="sm"
        (close)="isDeleteModalOpen = false">
        <p class="text-dark">
          Are you sure you want to delete <strong>{{ caseToDelete?.case_name }}</strong>?
          All associated time entries, hearing dates, and document attachments will be removed.
        </p>
        <div modal-footer>
          <button class="btn btn-outline-secondary" (click)="isDeleteModalOpen = false">Cancel</button>
          <button class="btn btn-danger" [disabled]="deleting" (click)="executeDelete()">
            <span *ngIf="deleting" class="spinner-border spinner-border-sm me-1"></span>
            Delete Case
          </button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .cases-page {
      .page-title {
        font-size: 1.65rem;
        color: #1e293b;
      }
      .text-hover-blue:hover {
        color: #2563eb !important;
      }
    }
  `]
})
export class CasesComponent implements OnInit {
  cases: Case[] = [];
  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;
  syncingCaseId: number | null = null;
  syncingAll: boolean = false;

  searchQuery: string = '';
  statusFilter: string = 'All';
  caseTypeFilter: string = 'All';
  courtForumFilter: string = 'All';

  pagination: PaginationMeta = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  };

  isModalOpen: boolean = false;
  selectedCase: Case | null = null;

  isDeleteModalOpen: boolean = false;
  caseToDelete: Case | null = null;

  constructor(
    private caseService: CaseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases() {
    this.loading = true;
    this.caseService
      .getCases({
        search: this.searchQuery,
        status: this.statusFilter,
        case_type: this.caseTypeFilter,
        page: this.pagination.page,
        limit: this.pagination.limit
      })
      .subscribe({
        next: res => {
          let list = res.data;
          if (this.courtForumFilter && this.courtForumFilter !== 'All') {
            list = list.filter(c => c.court_forum === this.courtForumFilter);
          }
          this.cases = list;
          this.pagination = res.pagination;
          this.loading = false;
        },
        error: err => {
          this.notificationService.error('Failed to load cases.');
          this.loading = false;
        }
      });
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.caseTypeFilter = 'All';
    this.courtForumFilter = 'All';
    this.pagination.page = 1;
    this.loadCases();
  }

  changePage(page: number) {
    this.pagination.page = page;
    this.loadCases();
  }

  openAddModal() {
    this.selectedCase = null;
    this.isModalOpen = true;
  }

  openEditModal(c: Case) {
    this.selectedCase = { ...c };
    this.isModalOpen = true;
  }

  saveCase(caseData: Partial<Case>) {
    this.saving = true;
    if (this.selectedCase && this.selectedCase.id) {
      this.caseService.updateCase(this.selectedCase.id, caseData).subscribe({
        next: () => {
          this.saving = false;
          this.isModalOpen = false;
          this.notificationService.success('Case updated successfully.');
          this.loadCases();
        },
        error: err => {
          this.saving = false;
          this.notificationService.error(err.message || 'Failed to update case.');
        }
      });
    } else {
      this.caseService.createCase(caseData).subscribe({
        next: () => {
          this.saving = false;
          this.isModalOpen = false;
          this.notificationService.success('Case created successfully.');
          this.loadCases();
        },
        error: err => {
          this.saving = false;
          this.notificationService.error(err.message || 'Failed to create case.');
        }
      });
    }
  }

  syncCaseECourts(c: Case) {
    if (!c.id) return;
    this.syncingCaseId = c.id;
    this.caseService.syncECourts(c.id).subscribe({
      next: res => {
        this.syncingCaseId = null;
        this.notificationService.success(res.message || 'e-Courts sync completed!', 'e-Courts Synced');
        this.loadCases();
      },
      error: err => {
        this.syncingCaseId = null;
        this.notificationService.error(err.error?.message || err.message || 'Failed to sync with e-Courts.');
      }
    });
  }

  syncAllCases() {
    this.syncingAll = true;
    this.caseService.syncAllECourts().subscribe({
      next: res => {
        this.syncingAll = false;
        this.notificationService.success(res.message, 'Automated e-Courts Sync');
        this.loadCases();
      },
      error: err => {
        this.syncingAll = false;
        this.notificationService.error('Failed to run batch e-Courts sync.');
      }
    });
  }

  copyToClipboard(text?: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    this.notificationService.info(`Copied CNR: ${text}`, 'Clipboard');
  }

  getForumIcon(forum?: string): string {
    switch (forum) {
      case 'High Court': return 'bi-bank';
      case 'Criminal Court': return 'bi-shield-shaded';
      case 'Family Court': return 'bi-people-fill';
      case 'Commercial Court': return 'bi-briefcase-fill';
      case 'NCLT Tribunal': return 'bi-building';
      case 'Consumer Forum': return 'bi-scale';
      case 'Supreme Court': return 'bi-gem';
      default: return 'bi-building-gear';
    }
  }

  getForumBadgeClass(forum?: string): string {
    switch (forum) {
      case 'High Court': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'Criminal Court': return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'Family Court': return 'bg-purple-subtle text-purple border border-purple-subtle';
      case 'Commercial Court': return 'bg-success-subtle text-success border border-success-subtle';
      case 'NCLT Tribunal': return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'Consumer Forum': return 'bg-info-subtle text-info border border-info-subtle';
      case 'Supreme Court': return 'bg-warning-subtle text-dark border border-warning';
      default: return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
  }

  confirmDelete(c: Case) {
    this.caseToDelete = c;
    this.isDeleteModalOpen = true;
  }

  executeDelete() {
    if (!this.caseToDelete || !this.caseToDelete.id) return;
    this.deleting = true;
    this.caseService.deleteCase(this.caseToDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.isDeleteModalOpen = false;
        this.notificationService.success('Case deleted successfully.');
        this.loadCases();
      },
      error: err => {
        this.deleting = false;
        this.notificationService.error(err.message || 'Failed to delete case.');
      }
    });
  }

  formatCurrency(val: any): string {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
}
