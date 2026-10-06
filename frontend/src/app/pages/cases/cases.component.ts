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
          <h2 class="page-title mb-1">Legal Matters & Cases</h2>
          <p class="text-muted small mb-0">Track active lawsuits, corporate advisory files, and court hearings</p>
        </div>
        <div class="d-flex gap-2">
          <app-button
            label="Open New Matter"
            icon="bi-folder-plus"
            variant="primary"
            (btnClick)="openAddModal()">
          </app-button>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="filters-card p-3 mb-4 bg-white rounded-3 border">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search matter name, docket #, court, client..."
                [(ngModel)]="searchQuery"
                (keyup.enter)="loadCases()"
              />
            </div>
          </div>

          <div class="col-6 col-md-3">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="loadCases()">
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Pending">Pending</option>
              <option value="On Hold">On Hold</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div class="col-6 col-md-3">
            <select class="form-select" [(ngModel)]="caseTypeFilter" (change)="loadCases()">
              <option value="All">All Practice Areas</option>
              <option value="Commercial Litigation">Commercial Litigation</option>
              <option value="Corporate / Securities">Corporate / Securities</option>
              <option value="Intellectual Property">Intellectual Property</option>
              <option value="Estate Planning / Probate">Estate Planning / Probate</option>
            </select>
          </div>

          <div class="col-12 col-md-2 text-end">
            <button class="btn btn-outline-secondary w-100" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
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
                <th>Matter & Docket</th>
                <th>Client</th>
                <th>Practice Area</th>
                <th>Status</th>
                <th>Budget / Spent</th>
                <th>Documents</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of cases">
                <td>
                  <a [routerLink]="['/cases', c.id]" class="fw-semibold text-dark text-hover-blue">
                    {{ c.case_name }}
                  </a>
                  <div class="text-muted small">
                    <span class="text-primary fw-medium">{{ c.case_number }}</span>
                    <span *ngIf="c.court_name"> &bull; {{ c.court_name }}</span>
                  </div>
                </td>
                <td>
                  <span class="text-dark fw-medium">{{ c.client_name }}</span>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{ c.case_type }}</span>
                </td>
                <td>
                  <app-badge [status]="c.status"></app-badge>
                </td>
                <td style="min-width: 130px;">
                  <div class="d-flex justify-content-between small text-muted mb-1">
                    <span>₹{{ formatCurrency(c.spent) }}</span>
                    <span>₹{{ formatCurrency(c.budget) }}</span>
                  </div>
                  <div class="progress" style="height: 5px;">
                    <div
                      class="progress-bar"
                      [ngClass]="getProgressBarClass(c.spent, c.budget)"
                      [style.width.%]="calculatePercentage(c.spent, c.budget)">
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-secondary border">
                    <i class="bi bi-file-earmark-text me-1"></i>
                    {{ c.doc_count || 0 }} files
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group">
                    <a [routerLink]="['/cases', c.id]" class="btn btn-sm btn-outline-primary" title="View Details">
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
          <small class="text-muted">Total: <strong>{{ pagination.total }}</strong> matters</small>
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
          All associated time entries and document attachments will be removed.
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
        color: #2C3E50;
      }
      .text-hover-blue:hover {
        color: #3498DB !important;
      }
    }
  `]
})
export class CasesComponent implements OnInit {
  cases: Case[] = [];
  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;

  searchQuery: string = '';
  statusFilter: string = 'All';
  caseTypeFilter: string = 'All';

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
          this.cases = res.data;
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
}
