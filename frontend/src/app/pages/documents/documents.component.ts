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
              <tr *ngFor="let doc of paginatedDocuments">
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
                    <button class="btn btn-sm btn-outline-success" (click)="openOfflineSummary(doc)" title="⚡ Instant Summary (100% Private / No AI)">
                      <i class="bi bi-lightning-charge-fill text-warning me-1"></i> Summarize
                    </button>
                    <a [href]="getDownloadUrl(doc.id!)" target="_blank" class="btn btn-sm btn-outline-primary" title="Download Document">
                      <i class="bi bi-download"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteDoc(doc)" title="Delete Document">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="!loading && paginatedDocuments.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-folder-x display-6 d-block mb-2 text-muted"></i>
                  No documents found matching your filter criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination with Per-Page Dropdown -->
        <div *ngIf="documents.length > 0" class="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 border-top bg-light">
          <div class="d-flex align-items-center gap-3">
            <small class="text-muted">
              Showing <strong>{{ ((pagination.page - 1) * pagination.limit) + 1 }}</strong> - 
              <strong>{{ getShowingEndCount() }}</strong> of 
              <strong>{{ documents.length }}</strong> repository documents
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
            <span class="small text-muted">Page {{ pagination.page }} of {{ totalPages }}</span>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-secondary" [disabled]="pagination.page <= 1" (click)="changePage(pagination.page - 1)">
                <i class="bi bi-chevron-left me-1"></i> Prev
              </button>
              <button class="btn btn-sm btn-secondary text-white px-3" disabled>{{ pagination.page }}</button>
              <button class="btn btn-sm btn-outline-secondary" [disabled]="pagination.page >= totalPages" (click)="changePage(pagination.page + 1)">
                Next <i class="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
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

      <!-- Offline Confidential Summary Modal -->
      <app-modal
        [isOpen]="isSummaryModalOpen"
        [title]="'Confidential Brief: ' + (activeSummaryDoc?.doc_name || 'Document')"
        icon="bi-shield-lock-fill"
        size="lg"
        (close)="isSummaryModalOpen = false">
        
        <div *ngIf="loadingSummary" class="text-center py-5">
          <div class="spinner-border text-primary mb-3" role="status"></div>
          <div class="fw-semibold text-dark">Analyzing document in server memory...</div>
          <div class="small text-muted mt-1">
            <i class="bi bi-shield-check text-success me-1"></i>100% Offline & Air-Gapped. Zero AI models used.
          </div>
        </div>

        <!-- TAB BAR -->
        <ul class="nav nav-pills mb-3 border-bottom pb-2">
          <li class="nav-item">
            <button
              class="nav-link py-1 px-3 fw-semibold small"
              [class.active]="activeBriefTab === 'standalone'"
              (click)="activeBriefTab = 'standalone'">
              <i class="bi bi-file-earmark-text me-1"></i> Standalone Brief
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link py-1 px-3 fw-semibold small position-relative"
              [class.active]="activeBriefTab === 'caseRag'"
              (click)="activeBriefTab = 'caseRag'">
              <i class="bi bi-person-workspace me-1"></i> Client & Case Memory (RAG Intelligence)
              <span class="badge bg-danger ms-1" *ngIf="ragData?.contradiction_alerts?.length">
                {{ ragData.contradiction_alerts.length }} Flags
              </span>
            </button>
          </li>
        </ul>

        <!-- TAB 1: STANDALONE DOCUMENT BRIEF -->
        <div *ngIf="activeBriefTab === 'standalone'">
          <div *ngIf="!loadingSummary && summaryData" class="summary-modal-content">
            <!-- Privacy & Benchmark Banner -->
            <div class="d-flex justify-content-between align-items-center p-2 mb-3 bg-light rounded border flex-wrap gap-2">
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <span class="badge bg-success"><i class="bi bi-shield-check me-1"></i>100% Air-Gapped / Zero AI</span>
                <span class="badge bg-primary">{{ summaryData.detected_type || 'Universal NLP' }}</span>
                <span class="small text-muted">{{ summaryData.total_word_count }} words</span>
              </div>
              <div class="small fw-bold text-success">
                <i class="bi bi-stopwatch me-1"></i>Processed in {{ summaryData.processing_time_ms }}ms
              </div>
            </div>

            <!-- Executive Summary Box -->
            <div class="mb-3">
              <div class="fw-bold small text-dark mb-1 d-flex align-items-center gap-1">
                <i class="bi bi-file-earmark-text-fill text-primary"></i> Executive Summary (TextRank Graph Centrality)
              </div>
              <div class="p-3 bg-light rounded border text-dark small lh-base">
                {{ summaryData.executive_summary }}
              </div>
            </div>

            <!-- Document Subject & Theme -->
            <div class="mb-3" *ngIf="summaryData.document_subject">
              <div class="fw-bold small text-dark mb-1"><i class="bi bi-tag-fill text-primary me-1"></i>Document Subject / Core Scope</div>
              <div class="p-2 bg-white rounded border fw-semibold text-primary small">
                {{ summaryData.document_subject }}
              </div>
            </div>

            <!-- Highlighted Badges Grid -->
            <div class="row g-3 mb-3">
              <!-- Key Themes & Topics (RAKE Graph Algorithm) -->
              <div class="col-12 col-md-6" *ngIf="summaryData.highlights?.core_themes_and_topics?.length">
                <div class="p-2 border rounded bg-white h-100">
                  <div class="fw-bold small text-primary mb-1"><i class="bi bi-lightbulb-fill me-1"></i>Core Themes & Topics</div>
                  <div class="d-flex flex-wrap gap-1">
                    <span *ngFor="let t of summaryData.highlights.core_themes_and_topics" class="badge bg-primary-subtle text-primary border">
                      {{ t }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Entities & Organizations (Title-Case N-Grams) -->
              <div class="col-12 col-md-6" *ngIf="summaryData.highlights?.key_entities_and_organizations?.length">
                <div class="p-2 border rounded bg-white h-100">
                  <div class="fw-bold small text-info mb-1"><i class="bi bi-building me-1"></i>Key Entities & Organizations</div>
                  <div class="d-flex flex-wrap gap-1">
                    <span *ngFor="let ent of summaryData.highlights.key_entities_and_organizations" class="badge bg-info-subtle text-info border">
                      {{ ent }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Metrics, Criteria & Quantitative Specs -->
              <div class="col-12 col-md-6" *ngIf="summaryData.highlights?.quantitative_metrics_and_specs?.length">
                <div class="p-2 border rounded bg-white h-100">
                  <div class="fw-bold small text-success mb-1"><i class="bi bi-speedometer2 me-1"></i>Metrics & Quantitative Specs</div>
                  <div class="d-flex flex-wrap gap-1">
                    <span *ngFor="let m of summaryData.highlights.quantitative_metrics_and_specs" class="badge bg-success-subtle text-success border">
                      {{ m }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Chronological Milestones & Dates -->
              <div class="col-12 col-md-6" *ngIf="(summaryData.highlights?.chronological_dates_and_milestones || summaryData.highlights?.schedules_and_timelines)?.length">
                <div class="p-2 border rounded bg-white h-100">
                  <div class="fw-bold small text-danger mb-1"><i class="bi bi-calendar2-week-fill me-1"></i>Timelines & Dates</div>
                  <div class="d-flex flex-wrap gap-1">
                    <span *ngFor="let d of (summaryData.highlights?.chronological_dates_and_milestones || summaryData.highlights?.schedules_and_timelines)" class="badge bg-danger-subtle text-danger border">
                      {{ d }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Directives & Rules (Imperative Statements) -->
            <div *ngIf="(summaryData.highlights?.action_directives_and_rules || summaryData.highlights?.key_action_items)?.length" class="mb-3">
              <div class="fw-bold small text-dark mb-1"><i class="bi bi-check2-square text-success me-1"></i>Key Action Directives & Guidelines:</div>
              <ul class="list-group list-group-flush border rounded">
                <li *ngFor="let item of (summaryData.highlights?.action_directives_and_rules || summaryData.highlights?.key_action_items)" class="list-group-item small py-2">
                  <i class="bi bi-arrow-right-circle-fill text-success me-2"></i>{{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- TAB 2: CLIENT & CASE RAG INTELLIGENCE (CROSS-DOCUMENT MEMORY) -->
        <div *ngIf="activeBriefTab === 'caseRag'">
          <div *ngIf="loadingRag" class="text-center py-4">
            <div class="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
            <div class="small text-muted">Retrieving client history & scanning for opponent contradictions across portfolio...</div>
          </div>

          <div *ngIf="!loadingRag && ragData">
            <!-- Client & Case Scope Switcher Header -->
            <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded border flex-wrap gap-2">
              <div>
                <span class="badge bg-primary me-2"><i class="bi bi-building me-1"></i>Client: {{ ragData.client?.name || 'Designated Client' }}</span>
                <span class="badge bg-dark"><i class="bi bi-folder2-open me-1"></i>Matter: {{ ragData.case_info?.case_number }}</span>
              </div>
              <div class="btn-group btn-group-sm">
                <button
                  type="button"
                  class="btn"
                  [class.btn-primary]="ragScope === 'client'"
                  [class.btn-outline-primary]="ragScope !== 'client'"
                  (click)="changeRagScope('client')">
                  <i class="bi bi-briefcase-fill me-1"></i> Client Portfolio Scope
                </button>
                <button
                  type="button"
                  class="btn"
                  [class.btn-primary]="ragScope === 'case'"
                  [class.btn-outline-primary]="ragScope !== 'case'"
                  (click)="changeRagScope('case')">
                  <i class="bi bi-file-earmark-ruled me-1"></i> This Matter Only
                </button>
              </div>
            </div>

            <!-- Client Portfolio Footprint Banner -->
            <div class="p-2 mb-3 bg-primary-subtle border border-primary-subtle rounded small" *ngIf="ragScope === 'client' && ragData.client">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <strong>Client Legal Portfolio:</strong> {{ ragData.client.total_cases }} Associated Matter(s) across docket.
                  <span *ngIf="ragData.client.adverse_parties?.length" class="text-danger ms-2">
                    <i class="bi bi-shield-slash-fill me-1"></i><strong>Adverse Parties Encountered:</strong> {{ ragData.client.adverse_parties.join(', ') }}
                  </span>
                </div>
                <span class="badge bg-primary text-white">{{ ragData.total_scope_documents }} Documents Indexed</span>
              </div>
            </div>

            <!-- Counter-Party Tactical Strategy -->
            <div class="mb-3" *ngIf="ragData.counter_party_tactical_strategy?.length">
              <div class="fw-bold small text-danger mb-2"><i class="bi bi-crosshair me-1"></i>Counter-Party Strategy & Counsel Tactics</div>
              <div class="row g-2">
                <div class="col-12" *ngFor="let tac of ragData.counter_party_tactical_strategy">
                  <div class="p-2 border border-danger-subtle rounded bg-white">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                      <span class="badge bg-danger text-white">{{ tac.tactic_type }}</span>
                      <strong class="small text-dark">{{ tac.title }}</strong>
                    </div>
                    <div class="small text-secondary">{{ tac.recommendation }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contradiction / Conflict Alerts -->
            <div class="mb-3" *ngIf="ragData.contradiction_alerts?.length">
              <div class="fw-bold small text-danger mb-2"><i class="bi bi-exclamation-triangle-fill me-1"></i>Contradictions Flagged Against Opponent</div>
              <div class="p-3 bg-danger-subtle rounded border border-danger text-dark small mb-2" *ngFor="let alert of ragData.contradiction_alerts">
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <span class="fw-bold text-danger">{{ alert.severity }}</span>
                  <span class="badge bg-warning text-dark border" *ngIf="alert.is_cross_case">Cross-Case Precedent</span>
                </div>
                <div class="mb-1"><strong>Current Statement:</strong> "{{ alert.current_claim }}"</div>
                <div class="mb-1 text-danger-emphasis"><strong>{{ alert.prior_inconsistent_statement }}</strong></div>
                <div class="small text-dark fst-italic">💡 <strong>Advocate Action:</strong> {{ alert.advocate_tactic }}</div>
              </div>
            </div>

            <!-- Cross-References with Prior Filings -->
            <div class="mb-3" *ngIf="ragData.case_memory_cross_references?.length">
              <div class="fw-bold small text-primary mb-2"><i class="bi bi-link-45deg me-1"></i>Semantic Cross-References Across Client Records</div>
              <div class="list-group list-group-flush border rounded">
                <div class="list-group-item p-2" *ngFor="let ref of ragData.case_memory_cross_references">
                  <div class="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                    <div class="d-flex align-items-center gap-1">
                      <span class="badge bg-primary-subtle text-primary border">Matched with: {{ ref.past_document }}</span>
                      <span class="badge" [class.bg-warning]="ref.is_cross_case" [class.text-dark]="ref.is_cross_case" [class.bg-light]="!ref.is_cross_case" [class.text-muted]="!ref.is_cross_case">
                        {{ ref.scope_badge }}
                      </span>
                    </div>
                    <span class="badge bg-success-subtle text-success">{{ ref.relevance_score }}% Match</span>
                  </div>
                  <div class="small text-muted mb-1"><strong>Current Excerpt:</strong> {{ ref.current_excerpt }}</div>
                  <div class="small text-dark bg-light p-2 rounded"><strong>Historical Record:</strong> {{ ref.past_excerpt }}</div>
                </div>
              </div>
            </div>

            <!-- Master Client & Case Timeline -->
            <div class="mb-3" *ngIf="ragData.cumulative_case_timeline?.length">
              <div class="fw-bold small text-dark mb-2"><i class="bi bi-calendar3 me-1"></i>Cumulative Chronology ({{ ragScope === 'client' ? 'All Client Matters' : 'This Matter' }})</div>
              <ul class="list-group border rounded">
                <li class="list-group-item small py-2 d-flex gap-2 align-items-baseline flex-wrap" *ngFor="let event of ragData.cumulative_case_timeline">
                  <span class="badge bg-dark">{{ event.date_reference }}</span>
                  <span class="badge bg-secondary" *ngIf="event.case_number">{{ event.case_number }}</span>
                  <div class="flex-grow-1">
                    <strong class="text-secondary">{{ event.source_document }}:</strong>
                    <span class="text-muted ms-1">{{ event.event_context }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div modal-footer>
          <button class="btn btn-outline-secondary" (click)="isSummaryModalOpen = false">Close</button>
          <button class="btn btn-primary" (click)="copySummaryToClipboard()" *ngIf="summaryData">
            <i class="bi bi-clipboard me-1"></i> Copy Brief
          </button>
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

  // Confidential Offline Summary state
  isSummaryModalOpen: boolean = false;
  activeSummaryDoc: DocumentItem | null = null;
  loadingSummary: boolean = false;
  summaryData: any = null;

  // Case-Aware RAG Memory state
  activeBriefTab: 'standalone' | 'caseRag' = 'standalone';
  ragData: any = null;
  loadingRag: boolean = false;
  ragScope: 'client' | 'case' = 'client';

  pagination = {
    page: 1,
    limit: 5
  };

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

  get paginatedDocuments(): DocumentItem[] {
    const startIndex = (this.pagination.page - 1) * this.pagination.limit;
    return this.documents.slice(startIndex, startIndex + this.pagination.limit);
  }

  get totalPages(): number {
    return Math.ceil(this.documents.length / this.pagination.limit) || 1;
  }

  changePage(page: number): void {
    this.pagination.page = page;
  }

  onPageSizeChange(): void {
    this.pagination.page = 1;
  }

  getShowingEndCount(): number {
    return Math.min(this.pagination.page * this.pagination.limit, this.documents.length);
  }

  loadDocuments() {
    this.loading = true;
    this.documentService
      .getDocuments({ search: this.searchQuery, doc_type: this.typeFilter })
      .subscribe({
        next: res => {
          this.documents = res.data;
          this.pagination.page = 1;
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

  openOfflineSummary(doc: DocumentItem): void {
    this.activeSummaryDoc = doc;
    this.isSummaryModalOpen = true;
    this.loadingSummary = true;
    this.summaryData = null;
    this.activeBriefTab = 'standalone';
    this.ragData = null;
    this.ragScope = 'client';
    this.fetchRagAnalysis(doc.id!, this.ragScope);

    this.documentService.summarizeOffline(doc.id).subscribe({
      next: (res: any) => {
        this.loadingSummary = false;
        if (res.success) {
          this.summaryData = res.data;
        } else {
          this.notificationService.error(res.message || 'Could not generate summary.');
        }
      },
      error: (err: any) => {
        this.loadingSummary = false;
        this.notificationService.error('Error generating brief: ' + (err.message || 'Server error'));
      }
    });
  }

  changeRagScope(scope: 'client' | 'case'): void {
    if (this.ragScope === scope) return;
    this.ragScope = scope;
    if (this.activeSummaryDoc?.id) {
      this.fetchRagAnalysis(this.activeSummaryDoc.id, scope);
    }
  }

  fetchRagAnalysis(docId: number, scope: 'client' | 'case'): void {
    this.loadingRag = true;
    this.documentService.getCaseRagAnalysis(docId, scope).subscribe({
      next: (res: any) => {
        this.loadingRag = false;
        if (res.success) {
          this.ragData = res.data;
        }
      },
      error: () => {
        this.loadingRag = false;
      }
    });
  }

  copySummaryToClipboard(): void {
    if (!this.summaryData) return;
    const s = this.summaryData;
    const text = `CONFIDENTIAL EXECUTIVE BRIEF
Document: ${s.document_title}
Subject: ${s.document_subject || 'N/A'}
Processing Time: ${s.processing_time_ms}ms (100% Air-Gapped / Zero AI)

EXECUTIVE SUMMARY:
${s.executive_summary}

KEY THEMES & TOPICS:
${(s.highlights?.core_themes_and_topics || []).join(', ')}

ENTITIES & ORGANIZATIONS:
${(s.highlights?.key_entities_and_organizations || []).join(', ')}

QUANTITATIVE METRICS & SPECS:
${(s.highlights?.quantitative_metrics_and_specs || []).join(', ')}

ACTION DIRECTIVES & GUIDELINES:
• ${(s.highlights?.action_directives_and_rules || s.highlights?.key_action_items || []).join('\n• ')}

TIMELINES & DATES:
${(s.highlights?.chronological_dates_and_milestones || s.highlights?.schedules_and_timelines || []).join(', ')}`;
    navigator.clipboard.writeText(text);
    this.notificationService.success('Executive brief copied to clipboard.');
  }
}
