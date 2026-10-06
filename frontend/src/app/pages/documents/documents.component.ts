import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';
import { CaseService } from '../../core/services/case.service';
import { NotificationService } from '../../core/services/notification.service';
import { DocumentItem, Case } from '../../core/models/models';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppModalComponent } from '../../shared/components/modal/modal.component';
import { AppFormInputComponent } from '../../shared/components/form-input/form-input.component';
import { AppFormSelectComponent, SelectOption } from '../../shared/components/form-select/form-select.component';

@Component({
  selector: 'app-documents',
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
    <div class="documents-page">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">Legal Document Repository</h2>
          <p class="text-muted small mb-0">Centralized repository for all client pleadings, contracts, and court exhibits</p>
        </div>
        <app-button
          label="Upload Document"
          icon="bi-cloud-arrow-up-fill"
          variant="secondary"
          (btnClick)="openUploadModal()">
        </app-button>
      </div>

      <!-- Filters -->
      <div class="filters-card p-3 mb-4 bg-white rounded-3 border">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search document name or case title..."
                [(ngModel)]="searchQuery"
                (keyup.enter)="loadDocuments()"
              />
            </div>
          </div>

          <div class="col-6 col-md-4">
            <select class="form-select" [(ngModel)]="typeFilter" (change)="loadDocuments()">
              <option value="All">All Classifications</option>
              <option value="Complaint / Pleadings">Complaint / Pleadings</option>
              <option value="Contract">Contract</option>
              <option value="Probate Record">Probate Record</option>
              <option value="Corporate Term Sheet">Corporate Term Sheet</option>
              <option value="IP Certificate">IP Certificate</option>
              <option value="Settlement Agreement">Settlement Agreement</option>
            </select>
          </div>

          <div class="col-6 col-md-3 text-end">
            <button class="btn btn-outline-secondary w-100" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Documents Table -->
      <app-card [noPadding]="true">
        <div class="table-responsive">
          <table class="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Document File</th>
                <th>Associated Matter</th>
                <th>Classification</th>
                <th>Uploaded By</th>
                <th>Date Uploaded</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let doc of documents">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-file-earmark-pdf-fill text-danger fs-4"></i>
                    <div>
                      <strong class="text-dark d-block">{{ doc.doc_name }}</strong>
                      <span class="text-muted small">{{ formatFileSize(doc.file_size) }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <a [routerLink]="['/cases', doc.case_id]" class="fw-semibold text-dark text-hover-blue">
                    {{ doc.case_name }}
                  </a>
                  <div class="text-muted small">{{ doc.case_number }}</div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{ doc.doc_type || 'Other' }}</span>
                </td>
                <td>
                  <span class="small text-muted">{{ doc.uploader_name || 'Counsel' }}</span>
                </td>
                <td>
                  <span class="small text-muted">{{ doc.uploaded_at | date:'mediumDate' }}</span>
                </td>
                <td class="text-end">
                  <div class="btn-group">
                    <a [href]="getDownloadUrl(doc.id!)" target="_blank" class="btn btn-sm btn-outline-primary" title="Download Document">
                      <i class="bi bi-download"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteDoc(doc)" title="Delete Document">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="!loading && documents.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-folder-x display-6 d-block mb-2 text-muted"></i>
                  No documents found matching your filter criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-card>

      <!-- Upload Modal -->
      <app-modal
        [isOpen]="isUploadModalOpen"
        title="Upload Legal Document to Repository"
        icon="bi-cloud-arrow-up"
        size="md"
        (close)="isUploadModalOpen = false">
        <form (ngSubmit)="submitUpload()">
          <app-form-select
            label="Associate With Case / Matter"
            [options]="caseOptions"
            placeholder="Select Legal Matter..."
            [required]="true"
            [(ngModel)]="uploadCaseId"
            name="uploadCaseId">
          </app-form-select>

          <app-form-input
            label="Document Name / Title"
            placeholder="e.g. Master Settlement Agreement v2.pdf"
            [required]="true"
            [(ngModel)]="uploadDocName"
            name="uploadDocName">
          </app-form-input>

          <app-form-select
            label="Document Classification"
            [options]="docTypeOptions"
            [(ngModel)]="uploadDocType"
            name="uploadDocType">
          </app-form-select>

          <div class="mb-3">
            <label class="form-label small text-dark fw-medium">Upload File Attachment</label>
            <input type="file" class="form-control" (change)="onFileSelected($event)">
          </div>
        </form>

        <div modal-footer>
          <button class="btn btn-outline-secondary" (click)="isUploadModalOpen = false">Cancel</button>
          <app-button
            label="Upload Document"
            [loading]="uploading"
            variant="primary"
            (btnClick)="submitUpload()">
          </app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .documents-page {
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
export class DocumentsComponent implements OnInit {
  documents: DocumentItem[] = [];
  cases: Case[] = [];
  loading: boolean = false;
  uploading: boolean = false;

  searchQuery: string = '';
  typeFilter: string = 'All';

  // Upload modal state
  isUploadModalOpen: boolean = false;
  uploadCaseId: number = 0;
  uploadDocName: string = '';
  uploadDocType: string = 'Complaint / Pleadings';
  selectedFile: File | null = null;

  caseOptions: SelectOption[] = [];
  docTypeOptions: SelectOption[] = [
    { label: 'Complaint / Pleadings', value: 'Complaint / Pleadings' },
    { label: 'Contract / Agreement', value: 'Contract' },
    { label: 'Probate Record', value: 'Probate Record' },
    { label: 'Corporate Term Sheet', value: 'Corporate Term Sheet' },
    { label: 'IP Certificate', value: 'IP Certificate' },
    { label: 'Settlement Agreement', value: 'Settlement Agreement' }
  ];

  constructor(
    private documentService: DocumentService,
    private caseService: CaseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    this.loadCasesList();
  }

  loadDocuments() {
    this.loading = true;
    this.documentService
      .getDocuments({ search: this.searchQuery, doc_type: this.typeFilter })
      .subscribe({
        next: res => {
          this.documents = res.data;
          this.loading = false;
        },
        error: () => {
          this.notificationService.error('Failed to load documents.');
          this.loading = false;
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
        if (!this.uploadCaseId && this.caseOptions.length > 0) {
          this.uploadCaseId = Number(this.caseOptions[0].value);
        }
      }
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.typeFilter = 'All';
    this.loadDocuments();
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

  submitUpload() {
    if (!this.uploadCaseId) {
      this.notificationService.warning('Please select a legal matter.');
      return;
    }

    if (!this.uploadDocName && !this.selectedFile) {
      this.notificationService.warning('Please provide a document title or select a file.');
      return;
    }

    this.uploading = true;
    const formData = new FormData();
    formData.append('case_id', String(this.uploadCaseId));
    formData.append('doc_name', this.uploadDocName);
    formData.append('doc_type', this.uploadDocType);
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.documentService.uploadDocument(formData).subscribe({
      next: () => {
        this.uploading = false;
        this.isUploadModalOpen = false;
        this.notificationService.success('Document uploaded to repository.');
        this.loadDocuments();
      },
      error: err => {
        this.uploading = false;
        this.notificationService.error(err.message || 'Failed to upload document.');
      }
    });
  }

  getDownloadUrl(id: number): string {
    return this.documentService.getDownloadUrl(id);
  }

  deleteDoc(doc: DocumentItem) {
    if (!confirm(`Delete ${doc.doc_name}?`)) return;
    this.documentService.deleteDocument(doc.id!).subscribe({
      next: () => {
        this.notificationService.success('Document deleted.');
        this.loadDocuments();
      }
    });
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
