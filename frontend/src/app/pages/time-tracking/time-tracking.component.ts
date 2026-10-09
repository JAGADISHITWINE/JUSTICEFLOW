import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TimeTrackingService } from '../../core/services/time-tracking.service';
import { CaseService } from '../../core/services/case.service';
import { NotificationService } from '../../core/services/notification.service';
import { Case, PaginationMeta, TimeEntry } from '../../core/models/models';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppModalComponent } from '../../shared/components/modal/modal.component';
import { AppFormInputComponent } from '../../shared/components/form-input/form-input.component';
import { AppFormSelectComponent, SelectOption } from '../../shared/components/form-select/form-select.component';

@Component({
  selector: 'app-time-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppCardComponent,
    AppButtonComponent,
    AppModalComponent,
    AppFormInputComponent,
    AppFormSelectComponent
  ],
  template: `
    <div class="time-tracking-page">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">Attorney Time & Billing</h2>
          <p class="text-muted small mb-0">Track attorney billable hours, hourly rates, and realization rates per case</p>
        </div>
        <app-button
          label="Log Billable Hours"
          icon="bi-stopwatch-fill"
          variant="secondary"
          (btnClick)="openLogModal()">
        </app-button>
      </div>

      <!-- Financial KPI Cards -->
      <div class="row g-3 mb-4" *ngIf="summary">
        <div class="col-12 col-md-4">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">TOTAL BILLABLE HOURS</span>
              <i class="bi bi-clock-history text-primary fs-5"></i>
            </div>
            <h3 class="mb-0 fw-bold text-dark">{{ summary.billable_hours || '0.0' }} <span class="fs-6 fw-normal text-muted">hrs</span></h3>
            <span class="text-muted small">{{ summary.total_hours }} total logged</span>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">BILLED REVENUE REALIZATION</span>
              <i class="bi bi-cash-coin text-success fs-5"></i>
            </div>
            <h3 class="mb-0 fw-bold text-success">₹{{ formatCurrency(summary.total_billed_revenue) }}</h3>
            <span class="text-muted small">Generated across active litigation</span>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">TIME SLIP ENTRIES</span>
              <i class="bi bi-receipt text-secondary fs-5"></i>
            </div>
            <h3 class="mb-0 fw-bold text-dark">{{ summary.total_entries || 0 }}</h3>
            <span class="text-muted small">Verified attorney time entries</span>
          </div>
        </div>
      </div>

      <!-- Filters & Toolbar -->
      <div class="filters-card p-3 mb-4 bg-white rounded-3 border">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <select class="form-select" [(ngModel)]="caseFilter" (change)="loadEntries()">
              <option value="">All Matters</option>
              <option *ngFor="let c of cases" [value]="c.id">{{ c.case_name }}</option>
            </select>
          </div>

          <div class="col-6 col-md-3">
            <select class="form-select" [(ngModel)]="billableFilter" (change)="loadEntries()">
              <option value="">All Types (Billable & Non-billable)</option>
              <option value="true">Billable Only</option>
              <option value="false">Non-Billable Only</option>
            </select>
          </div>

          <div class="col-6 col-md-3">
            <input type="date" class="form-control" [(ngModel)]="dateFilter" (change)="loadEntries()">
          </div>

          <div class="col-12 col-md-2 text-end">
            <button class="btn btn-outline-secondary w-100" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Time Entries Table -->
      <app-card [noPadding]="true">
        <div class="table-responsive">
          <table class="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Attorney</th>
                <th>Case / Docket</th>
                <th>Description of Legal Work</th>
                <th>Hours</th>
                <th>Rate</th>
                <th>Total Value</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of entries">
                <td>
                  <span class="fw-semibold text-dark">{{ item.entry_date }}</span>
                </td>
                <td>
                  <span class="small text-muted">{{ item.lawyer_name || 'Alexander Vance, Esq.' }}</span>
                </td>
                <td>
                  <a [routerLink]="['/cases', item.case_id]" class="fw-semibold text-dark text-hover-blue">
                    {{ item.case_name }}
                  </a>
                  <div class="text-muted small">{{ item.case_number }}</div>
                </td>
                <td>
                  <span class="text-dark">{{ item.description }}</span>
                </td>
                <td>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold">
                    {{ item.hours }} hrs
                  </span>
                </td>
                <td>
                  <span class="small text-muted">₹{{ item.hourly_rate }}/hr</span>
                </td>
                <td>
                  <strong class="text-success">₹{{ formatCurrency((item.hours || 0) * (item.hourly_rate || 200)) }}</strong>
                </td>
                <td class="text-end">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-secondary" (click)="openEditModal(item)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteEntry(item)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="!loading && entries.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="bi bi-stopwatch display-6 d-block mb-2 text-muted"></i>
                  No time slips found matching your filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination with Per-Page Dropdown -->
        <div *ngIf="pagination.total > 0" class="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 border-top bg-light">
          <div class="d-flex align-items-center gap-3">
            <small class="text-muted">
              Showing <strong>{{ ((pagination.page - 1) * pagination.limit) + 1 }}</strong> - 
              <strong>{{ getShowingEndCount() }}</strong> of 
              <strong>{{ pagination.total }}</strong> time slips
            </small>

            <div class="d-flex align-items-center gap-2">
              <label class="form-label small text-muted mb-0 fw-semibold">Show:</label>
              <select 
                class="form-select form-select-sm" 
                style="width: 90px;" 
                [(ngModel)]="pagination.limit" 
                (change)="onPageSizeChange()">
                <option [ngValue]="5">5</option>
                <option [ngValue]="10">10</option>
                <option [ngValue]="15">15</option>
                <option [ngValue]="20">20</option>
              </select>
              <span class="small text-muted">per page</span>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <span class="small text-muted">Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-secondary" [disabled]="pagination.page <= 1" (click)="changePage(pagination.page - 1)">
                <i class="bi bi-chevron-left me-1"></i> Prev
              </button>
              <button class="btn btn-sm btn-secondary text-white px-3" disabled>{{ pagination.page }}</button>
              <button class="btn btn-sm btn-outline-secondary" [disabled]="pagination.page >= pagination.totalPages" (click)="changePage(pagination.page + 1)">
                Next <i class="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </app-card>

      <!-- Log / Edit Time Modal -->
      <app-modal
        [isOpen]="isModalOpen"
        [title]="isEditMode ? 'Edit Time Slip' : 'Record Billable Legal Time'"
        icon="bi-stopwatch"
        (close)="isModalOpen = false">
        <form (ngSubmit)="saveEntry()">
          <app-form-select
            label="Associated Case / Legal Matter"
            [options]="caseOptions"
            placeholder="Select Legal Matter..."
            [required]="true"
            [(ngModel)]="formData.case_id"
            name="case_id">
          </app-form-select>

          <div class="row g-3">
            <div class="col-6">
              <app-form-input
                label="Hours Spent"
                type="number"
                placeholder="2.5"
                [required]="true"
                [(ngModel)]="formData.hours"
                name="hours">
              </app-form-input>
            </div>

            <div class="col-6">
              <app-form-input
                label="Billing Rate ($/hr)"
                type="number"
                placeholder="450.00"
                [(ngModel)]="formData.hourly_rate"
                name="hourly_rate">
              </app-form-input>
            </div>
          </div>

          <app-form-input
            label="Date of Service"
            type="date"
            [(ngModel)]="formData.entry_date"
            name="entry_date">
          </app-form-input>

          <div class="mb-3">
            <label class="form-label small text-dark fw-medium">Description of Legal Work</label>
            <textarea
              class="form-control"
              rows="3"
              placeholder="e.g. Conducted legal research, drafted summary judgment motion..."
              [(ngModel)]="formData.description"
              name="description">
            </textarea>
          </div>

          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="isBillableCheck" [(ngModel)]="formData.is_billable" name="is_billable">
            <label class="form-check-label text-dark small" for="isBillableCheck">
              Mark as Billable to Client
            </label>
          </div>
        </form>

        <div modal-footer>
          <button class="btn btn-outline-secondary" (click)="isModalOpen = false">Cancel</button>
          <app-button
            [label]="isEditMode ? 'Update Time Slip' : 'Save Time Slip'"
            [loading]="saving"
            variant="secondary"
            (btnClick)="saveEntry()">
          </app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .time-tracking-page {
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
export class TimeTrackingComponent implements OnInit {
  entries: TimeEntry[] = [];
  cases: Case[] = [];
  summary: any = null;
  loading: boolean = false;
  saving: boolean = false;

  caseFilter: string = '';
  billableFilter: string = '';
  dateFilter: string = '';

  pagination: PaginationMeta = {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1
  };

  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  selectedEntryId: number | null = null;

  caseOptions: SelectOption[] = [];

  formData: Partial<TimeEntry> = {
    case_id: 1,
    hours: 1,
    hourly_rate: 450,
    entry_date: new Date().toISOString().slice(0, 10),
    description: '',
    is_billable: true
  };

  constructor(
    private timeService: TimeTrackingService,
    private caseService: CaseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadCasesList();
    this.loadEntries();
  }

  onPageSizeChange() {
    this.pagination.page = 1;
    this.loadEntries();
  }

  getShowingEndCount(): number {
    return Math.min(this.pagination.page * this.pagination.limit, this.pagination.total);
  }

  loadSummary() {
    this.timeService.getSummary().subscribe({
      next: res => {
        this.summary = res.data;
      }
    });
  }

  loadCasesList() {
    this.caseService.getCases({ limit: 100 }).subscribe({
      next: res => {
        this.cases = res.data;
        this.caseOptions = res.data.map(c => ({
          label: `${c.case_name} (${c.case_number})`,
          value: c.id
        }));
        if (!this.formData.case_id && this.caseOptions.length > 0) {
          this.formData.case_id = Number(this.caseOptions[0].value);
        }
      }
    });
  }

  loadEntries() {
    this.loading = true;
    this.timeService
      .getTimeEntries({
        case_id: this.caseFilter ? parseInt(this.caseFilter, 10) : undefined,
        is_billable: this.billableFilter !== '' ? (this.billableFilter === 'true') : undefined,
        start_date: this.dateFilter || undefined,
        end_date: this.dateFilter || undefined,
        page: this.pagination.page,
        limit: this.pagination.limit
      })
      .subscribe({
        next: res => {
          this.entries = res.data;
          this.pagination = res.pagination;
          this.loading = false;
        },
        error: () => {
          this.notificationService.error('Failed to load time entries.');
          this.loading = false;
        }
      });
  }

  resetFilters() {
    this.caseFilter = '';
    this.billableFilter = '';
    this.dateFilter = '';
    this.pagination.page = 1;
    this.loadEntries();
  }

  changePage(page: number) {
    this.pagination.page = page;
    this.loadEntries();
  }

  openLogModal() {
    this.isEditMode = false;
    this.selectedEntryId = null;
    this.formData = {
      case_id: this.caseOptions.length ? Number(this.caseOptions[0].value) : 1,
      hours: 1,
      hourly_rate: 450,
      entry_date: new Date().toISOString().slice(0, 10),
      description: '',
      is_billable: true
    };
    this.isModalOpen = true;
  }

  openEditModal(entry: TimeEntry) {
    this.isEditMode = true;
    this.selectedEntryId = entry.id!;
    this.formData = {
      case_id: entry.case_id,
      hours: entry.hours,
      hourly_rate: entry.hourly_rate,
      entry_date: entry.entry_date ? entry.entry_date.slice(0, 10) : '',
      description: entry.description,
      is_billable: entry.is_billable
    };
    this.isModalOpen = true;
  }

  saveEntry() {
    if (!this.formData.case_id || !this.formData.hours || !this.formData.description) {
      this.notificationService.warning('Please fill in matter, hours, and description.');
      return;
    }

    this.saving = true;

    if (this.isEditMode && this.selectedEntryId) {
      this.timeService.updateTimeEntry(this.selectedEntryId, this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.isModalOpen = false;
          this.notificationService.success('Time slip updated.');
          this.loadEntries();
          this.loadSummary();
        },
        error: err => {
          this.saving = false;
          this.notificationService.error(err.message || 'Failed to update time.');
        }
      });
    } else {
      this.timeService.logTime(this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.isModalOpen = false;
          this.notificationService.success('Billable time logged successfully.');
          this.loadEntries();
          this.loadSummary();
        },
        error: err => {
          this.saving = false;
          this.notificationService.error(err.message || 'Failed to log time.');
        }
      });
    }
  }

  deleteEntry(item: TimeEntry) {
    if (!confirm('Are you sure you want to remove this time slip?')) return;
    this.timeService.deleteTimeEntry(item.id!).subscribe({
      next: () => {
        this.notificationService.success('Time slip removed.');
        this.loadEntries();
        this.loadSummary();
      }
    });
  }

  formatCurrency(val: any): string {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
