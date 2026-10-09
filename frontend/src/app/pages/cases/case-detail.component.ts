import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CaseService } from '../../core/services/case.service';
import { DocumentService } from '../../core/services/document.service';
import { TimeTrackingService } from '../../core/services/time-tracking.service';
import { NotificationService } from '../../core/services/notification.service';
import { Case, DocumentItem, TimeEntry } from '../../core/models/models';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppBadgeComponent } from '../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppModalComponent } from '../../shared/components/modal/modal.component';
import { AppFormInputComponent } from '../../shared/components/form-input/form-input.component';
import { AppLoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppCardComponent,
    AppBadgeComponent,
    AppButtonComponent,
    AppModalComponent,
    AppFormInputComponent,
    AppLoaderComponent
  ],
  template: `
    <div class="case-detail-page">
      <app-loader *ngIf="loading" message="Loading case file & records..."></app-loader>

      <div *ngIf="!loading && caseData">
        <!-- Back Navigation & Title Bar -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <a routerLink="/cases" class="btn btn-sm btn-link text-decoration-none p-0 text-muted mb-2 d-inline-block">
              <i class="bi bi-arrow-left me-1"></i> Back to All Cases
            </a>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <h2 class="case-title mb-0 fw-bold">{{ caseData.case_name }}</h2>
              <span [ngClass]="getForumBadgeClass(caseData.court_forum)" class="badge rounded-pill px-3 py-1">
                <i [ngClass]="getForumIcon(caseData.court_forum)" class="me-1"></i>
                {{ caseData.court_forum || 'Commercial Court' }}
              </span>
            </div>
            <div class="d-flex align-items-center gap-2 flex-wrap mt-2">
              <span class="badge bg-secondary-subtle text-primary border border-primary-subtle fw-semibold">
                <i class="bi bi-hash"></i> {{ caseData.case_number }}
              </span>
              <span *ngIf="caseData.cnr_number" class="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace">
                <i class="bi bi-upc-scan me-1"></i> CNR: {{ caseData.cnr_number }}
              </span>
              <span class="text-muted">&bull;</span>
              <span class="text-dark fw-medium">{{ caseData.client_name }}</span>
              <span class="text-muted">&bull;</span>
              <app-badge [status]="caseData.status"></app-badge>
            </div>
            <div *ngIf="caseData.fir_number" class="small text-danger mt-1">
              <i class="bi bi-shield-exclamation me-1"></i>FIR: <strong>{{ caseData.fir_number }}</strong> (PS: {{ caseData.police_station || 'Jurisdiction Police Station' }})
            </div>
          </div>

          <div class="d-flex gap-2 flex-wrap">
            <button 
              *ngIf="caseData.cnr_number" 
              class="btn btn-outline-success d-flex align-items-center gap-1"
              [disabled]="syncing"
              (click)="syncECourtsNow()">
              <span *ngIf="syncing" class="spinner-border spinner-border-sm"></span>
              <i *ngIf="!syncing" class="bi bi-arrow-repeat"></i>
              <span>{{ syncing ? 'Syncing...' : 'e-Courts Live Sync' }}</span>
            </button>
            <button class="btn btn-outline-secondary" (click)="openUploadModal()">
              <i class="bi bi-upload me-1"></i> Upload File
            </button>
            <button class="btn btn-secondary text-white" (click)="openLogTimeModal()">
              <i class="bi bi-stopwatch me-1"></i> Log Hours
            </button>
          </div>
        </div>

        <!-- 3 Top Stat Cards (Budget, Client, Court) -->
        <div class="row g-3 mb-4">
          <!-- Financial Metric -->
          <div class="col-12 col-md-4">
            <div class="stat-box p-3 bg-white rounded-3 border">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small fw-semibold">MATTER BUDGET PROGRESS</span>
                <span class="fw-bold text-dark">{{ calculatePercentage(caseData.spent, caseData.budget) }}%</span>
              </div>
              <div class="d-flex justify-content-between align-items-baseline mb-2">
                <h4 class="mb-0 fw-bold text-primary">₹{{ formatCurrency(caseData.spent) }}</h4>
                <span class="text-muted small">of ₹{{ formatCurrency(caseData.budget) }}</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div
                  class="progress-bar bg-success"
                  [style.width.%]="calculatePercentage(caseData.spent, caseData.budget)">
                </div>
              </div>
            </div>
          </div>

          <!-- Client Card -->
          <div class="col-12 col-md-4">
            <div class="stat-box p-3 bg-white rounded-3 border">
              <span class="text-muted small fw-semibold d-block mb-2">CLIENT CONTACT</span>
              <h5 class="mb-1 text-dark fw-semibold">{{ caseData.client_name }}</h5>
              <div class="small text-muted mb-1">
                <i class="bi bi-envelope me-1"></i> {{ caseData.client_email || 'No email on file' }}
              </div>
              <div class="small text-muted">
                <i class="bi bi-telephone me-1"></i> {{ caseData.client_phone || 'No phone on file' }}
              </div>
            </div>
          </div>

          <!-- Court & Filing -->
          <div class="col-12 col-md-4">
            <div class="stat-box p-3 bg-white rounded-3 border">
              <div class="d-flex justify-content-between align-items-start mb-1">
                <span class="text-muted small fw-semibold">COURT & BENCH INFO</span>
                <span class="badge bg-light text-primary border" style="font-size: 0.65rem;">
                  {{ caseData.court_forum || 'Commercial' }}
                </span>
              </div>
              <h6 class="mb-1 text-dark fw-semibold">{{ caseData.court_name || 'Tribunal / Court Hall' }}</h6>
              <div class="small text-muted mb-1">
                Judge: <span class="fw-medium text-dark">{{ caseData.judge_name || 'Hon. Presiding Bench' }}</span>
              </div>
              <div class="small text-muted">
                Next Date / Disposal: <span class="fw-bold text-primary">{{ caseData.expected_close_date || caseData.filing_date || 'In Session' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs for Case Sub-entities -->
        <ul class="nav nav-pills custom-nav-pills mb-3">
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab === 'docs'" (click)="activeTab = 'docs'">
              <i class="bi bi-file-earmark-text me-1"></i> Documents ({{ caseData.documents?.length || 0 }})
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab === 'time'" (click)="activeTab = 'time'">
              <i class="bi bi-clock-history me-1"></i> Logged Hours ({{ caseData.time_entries?.length || 0 }})
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'">
              <i class="bi bi-info-circle me-1"></i> Matter Synopsis
            </button>
          </li>
        </ul>

        <!-- TAB 1: Documents -->
        <div *ngIf="activeTab === 'docs'">
          <app-card [noPadding]="true">
            <div class="table-responsive">
              <table class="table table-custom align-middle mb-0">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Document Type</th>
                    <th>Uploaded By</th>
                    <th>Date</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let doc of caseData.documents">
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-file-pdf text-danger fs-5"></i>
                        <span class="fw-medium text-dark">{{ doc.doc_name }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark border">{{ doc.doc_type || 'Legal Filing' }}</span>
                    </td>
                    <td>
                      <span class="small text-muted">{{ doc.uploader_name || 'Counsel' }}</span>
                    </td>
                    <td>
                      <span class="small text-muted">{{ doc.uploaded_at | date:'mediumDate' }}</span>
                    </td>
                    <td class="text-end">
                      <a [href]="getDownloadUrl(doc.id!)" target="_blank" class="btn btn-sm btn-outline-primary me-2">
                        <i class="bi bi-download"></i> Download
                      </a>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteDoc(doc.id!)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>

                  <tr *ngIf="!caseData.documents || caseData.documents.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted">
                      No documents uploaded for this matter yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </app-card>
        </div>

        <!-- TAB 2: Time Entries -->
        <div *ngIf="activeTab === 'time'">
          <app-card [noPadding]="true">
            <div class="table-responsive">
              <table class="table table-custom align-middle mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Attorney</th>
                    <th>Work Performed</th>
                    <th>Hours</th>
                    <th>Rate</th>
                    <th>Total</th>
                    <th class="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let t of caseData.time_entries">
                    <td>
                      <span class="fw-medium">{{ t.entry_date }}</span>
                    </td>
                    <td>
                      <span class="text-dark small">{{ t.lawyer_name || 'Counsel' }}</span>
                    </td>
                    <td>
                      <span class="text-dark">{{ t.description }}</span>
                    </td>
                    <td>
                      <span class="badge bg-info-subtle text-primary border">{{ t.hours }} hrs</span>
                    </td>
                    <td>
                      <span class="small text-muted">₹{{ t.hourly_rate }}/hr</span>
                    </td>
                    <td>
                      <span class="fw-bold text-dark">₹{{ formatCurrency((t.hours || 0) * (t.hourly_rate || 200)) }}</span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteTime(t.id!)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>

                  <tr *ngIf="!caseData.time_entries || caseData.time_entries.length === 0">
                    <td colspan="7" class="text-center py-4 text-muted">
                      No billable hours recorded for this matter yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </app-card>
        </div>

        <!-- TAB 3: Synopsis -->
        <div *ngIf="activeTab === 'overview'">
          <app-card title="Factual Background & Strategy">
            <p class="text-dark" style="line-height: 1.7;">
              {{ caseData.description || 'No detailed background provided.' }}
            </p>
          </app-card>
        </div>
      </div>

      <!-- Upload Document Modal -->
      <app-modal
        [isOpen]="isUploadModalOpen"
        title="Upload Legal Document"
        icon="bi-cloud-arrow-up"
        (close)="isUploadModalOpen = false">
        <form (ngSubmit)="uploadDoc()">
          <app-form-input
            label="Document Title"
            placeholder="e.g. Deposition Notice - John Doe"
            [(ngModel)]="uploadDocName"
            name="uploadDocName">
          </app-form-input>

          <div class="mb-3">
            <label class="form-label small text-dark fw-medium">Document Classification</label>
            <select class="form-select" [(ngModel)]="uploadDocType" name="uploadDocType">
              <option value="Complaint / Pleadings">Complaint / Pleadings</option>
              <option value="Contract / Agreement">Contract / Agreement</option>
              <option value="Discovery Exhibit">Discovery Exhibit</option>
              <option value="Court Motion">Court Motion</option>
              <option value="Privileged Correspondence">Privileged Correspondence</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label small text-dark fw-medium">File Attachment (PDF, DOCX)</label>
            <input type="file" class="form-control" (change)="onFileSelected($event)">
          </div>
        </form>

        <div modal-footer>
          <button class="btn btn-outline-secondary" (click)="isUploadModalOpen = false">Cancel</button>
          <app-button
            label="Upload Document"
            [loading]="uploading"
            variant="primary"
            (btnClick)="uploadDoc()">
          </app-button>
        </div>
      </app-modal>

      <!-- Log Hours Modal -->
      <app-modal
        [isOpen]="isLogModalOpen"
        title="Log Billable Time"
        icon="bi-stopwatch"
        (close)="isLogModalOpen = false">
        <form (ngSubmit)="saveTimeEntry()">
          <app-form-input
            label="Hours Logged"
            type="number"
            placeholder="e.g. 2.5"
            [required]="true"
            [(ngModel)]="newTime.hours"
            name="hours">
          </app-form-input>

          <app-form-input
            label="Hourly Rate ($ USD)"
            type="number"
            placeholder="450.00"
            [(ngModel)]="newTime.hourly_rate"
            name="hourly_rate">
          </app-form-input>

          <app-form-input
            label="Entry Date"
            type="date"
            [(ngModel)]="newTime.entry_date"
            name="entry_date">
          </app-form-input>

          <div class="mb-3">
            <label class="form-label small text-dark fw-medium">Work Description & Task Item</label>
            <textarea
              class="form-control"
              rows="3"
              placeholder="e.g. Drafted response to summary judgment motion..."
              [(ngModel)]="newTime.description"
              name="description">
            </textarea>
          </div>
        </form>

        <div modal-footer>
          <button class="btn btn-outline-secondary" (click)="isLogModalOpen = false">Cancel</button>
          <app-button
            label="Record Time Entry"
            [loading]="savingTime"
            variant="secondary"
            (btnClick)="saveTimeEntry()">
          </app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .case-detail-page {
      .case-title {
        font-size: 1.7rem;
        color: #2C3E50;
      }

      .custom-nav-pills {
        .nav-link {
          color: #7F8C8D;
          font-weight: 500;
          border-radius: 8px;
          padding: 0.55rem 1.15rem;

          &.active {
            background-color: #2C3E50;
            color: #FFFFFF;
          }
        }
      }
    }
  `]
})
export class CaseDetailComponent implements OnInit {
  caseId: number = 0;
  caseData: Case | null = null;
  loading: boolean = true;
  activeTab: 'docs' | 'time' | 'overview' = 'docs';

  // Upload modal state
  isUploadModalOpen: boolean = false;
  uploadDocName: string = '';
  uploadDocType: string = 'Complaint / Pleadings';
  selectedFile: File | null = null;
  uploading: boolean = false;

  // Log time modal state
  isLogModalOpen: boolean = false;
  savingTime: boolean = false;
  newTime: Partial<TimeEntry> = {
    hours: 1,
    hourly_rate: 450,
    entry_date: new Date().toISOString().slice(0, 10),
    description: '',
    is_billable: true
  };

  constructor(
    private route: ActivatedRoute,
    private caseService: CaseService,
    private documentService: DocumentService,
    private timeService: TimeTrackingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.caseId = parseInt(idParam, 10);
      this.loadCaseDetail();
    }
  }

  loadCaseDetail() {
    this.loading = true;
    this.caseService.getCaseById(this.caseId).subscribe({
      next: res => {
        this.caseData = res.data;
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Failed to load case details.');
        this.loading = false;
      }
    });
  }

  openUploadModal() {
    this.uploadDocName = '';
    this.selectedFile = null;
    this.isUploadModalOpen = true;
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      if (!this.uploadDocName && this.selectedFile) {
        this.uploadDocName = this.selectedFile.name;
      }
    }
  }

  uploadDoc() {
    if (!this.uploadDocName && !this.selectedFile) {
      this.notificationService.warning('Please provide a document name or choose a file.');
      return;
    }

    this.uploading = true;
    const formData = new FormData();
    formData.append('case_id', String(this.caseId));
    formData.append('doc_name', this.uploadDocName);
    formData.append('doc_type', this.uploadDocType);
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.documentService.uploadDocument(formData).subscribe({
      next: () => {
        this.uploading = false;
        this.isUploadModalOpen = false;
        this.notificationService.success('Document uploaded successfully.');
        this.loadCaseDetail();
      },
      error: err => {
        this.uploading = false;
        this.notificationService.error(err.message || 'Upload failed.');
      }
    });
  }

  getDownloadUrl(docId: number): string {
    return this.documentService.getDownloadUrl(docId);
  }

  deleteDoc(docId: number) {
    if (!confirm('Are you sure you want to remove this document?')) return;
    this.documentService.deleteDocument(docId).subscribe({
      next: () => {
        this.notificationService.success('Document deleted.');
        this.loadCaseDetail();
      }
    });
  }

  openLogTimeModal() {
    this.newTime = {
      case_id: this.caseId,
      hours: 1.5,
      hourly_rate: 450,
      entry_date: new Date().toISOString().slice(0, 10),
      description: '',
      is_billable: true
    };
    this.isLogModalOpen = true;
  }

  saveTimeEntry() {
    if (!this.newTime.hours || !this.newTime.description) {
      this.notificationService.warning('Please specify hours and description.');
      return;
    }

    this.savingTime = true;
    this.newTime.case_id = this.caseId;
    this.timeService.logTime(this.newTime).subscribe({
      next: () => {
        this.savingTime = false;
        this.isLogModalOpen = false;
        this.notificationService.success('Billable hours logged.');
        this.loadCaseDetail();
      },
      error: err => {
        this.savingTime = false;
        this.notificationService.error(err.message || 'Failed to log time.');
      }
    });
  }

  syncing: boolean = false;
  syncECourtsNow() {
    if (!this.caseId) return;
    this.syncing = true;
    this.caseService.syncECourts(this.caseId).subscribe({
      next: res => {
        this.syncing = false;
        this.notificationService.success(res.message || 'e-Courts sync completed!', 'e-Courts Live Sync');
        this.loadCaseDetail();
      },
      error: err => {
        this.syncing = false;
        this.notificationService.error(err.error?.message || err.message || 'Failed to sync with e-Courts.');
      }
    });
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

  deleteTime(id: number) {
    if (!confirm('Delete this logged time record?')) return;
    this.timeService.deleteTimeEntry(id).subscribe({
      next: () => {
        this.notificationService.success('Time entry removed.');
        this.loadCaseDetail();
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
}
