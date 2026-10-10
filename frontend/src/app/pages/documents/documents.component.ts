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
import { AppPaginationComponent } from '../../shared/components/pagination/pagination.component';

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
    AppFormSelectComponent,
    AppPaginationComponent
  ],
  template: `
    <div class="documents-page">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2">
            <h2 class="page-title mb-0">Legal Document Repository</h2>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
              <i class="bi bi-shield-lock-fill me-1"></i> Air-Gapped / Private
            </span>
          </div>
          <p class="text-muted small mb-0 mt-1">
            Centralized legal records repository for pleadings, contracts, affidavits, and court filings with offline NLP intelligence.
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm" (click)="loadDocuments()" [disabled]="loading" title="Refresh records">
            <i class="bi bi-arrow-clockwise" [class.spin-icon]="loading"></i> Refresh
          </button>
          <app-button
            label="Upload Document"
            icon="bi-cloud-arrow-up-fill"
            variant="primary"
            (btnClick)="openUploadModal()">
          </app-button>
        </div>
      </div>

      <!-- Quick Document Metrics / Stat Cards -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="doc-stat-card p-3 rounded-3 border">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small d-block">Total Documents</span>
                <span class="fs-4 fw-bold text-primary">{{ documents.length }}</span>
              </div>
              <div class="stat-icon-badge bg-primary-subtle text-primary">
                <i class="bi bi-folder2-open fs-5"></i>
              </div>
            </div>
            <div class="mt-2 text-muted small" style="font-size: 0.75rem;">
              Across {{ getUniqueCasesCount() }} legal matters
            </div>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="doc-stat-card p-3 rounded-3 border">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small d-block">Repository Size</span>
                <span class="fs-4 fw-bold text-success">{{ getTotalStorageFormatted() }}</span>
              </div>
              <div class="stat-icon-badge bg-success-subtle text-success">
                <i class="bi bi-hdd-network fs-5"></i>
              </div>
            </div>
            <div class="mt-2 text-muted small" style="font-size: 0.75rem;">
              Local vault storage
            </div>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="doc-stat-card p-3 rounded-3 border">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small d-block">Pleadings & Filings</span>
                <span class="fs-4 fw-bold text-info">{{ getPleadingsCount() }}</span>
              </div>
              <div class="stat-icon-badge bg-info-subtle text-info">
                <i class="bi bi-file-earmark-ruled fs-5"></i>
              </div>
            </div>
            <div class="mt-2 text-muted small" style="font-size: 0.75rem;">
              Plaints, petitions & notices
            </div>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="doc-stat-card p-3 rounded-3 border">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small d-block">Offline Analysis</span>
                <span class="fs-4 fw-bold text-warning">100% Ready</span>
              </div>
              <div class="stat-icon-badge bg-warning-subtle text-warning">
                <i class="bi bi-cpu fs-5"></i>
              </div>
            </div>
            <div class="mt-2 text-muted small" style="font-size: 0.75rem;">
              Air-Gapped TextRank RAG
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="filters-card p-3 mb-4 rounded-3 border">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-transparent border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search document name or matter title..."
                [(ngModel)]="searchQuery"
                (keyup.enter)="loadDocuments()"
              />
              <button 
                *ngIf="searchQuery" 
                class="btn btn-outline-secondary border-start-0" 
                type="button" 
                (click)="searchQuery = ''; loadDocuments()">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <select class="form-select" [(ngModel)]="typeFilter" (change)="loadDocuments()">
              <option value="All">All Document Classifications</option>
              <option value="Plaint / Statement of Truth">Plaint / Statement of Truth</option>
              <option value="Commercial Contract">Commercial Contract</option>
              <option value="Interlocutory Application (Order 39)">Interlocutory Application (Order 39)</option>
              <option value="Probate Record">Probate Record</option>
              <option value="Court Affidavit">Court Affidavit</option>
              <option value="Regulatory Appeal Memo">Regulatory Appeal Memo</option>
              <option value="IP Trademark Certificate">IP Trademark Certificate</option>
              <option value="Constitutional Writ Paperbook">Constitutional Writ Paperbook</option>
              <option value="Arbitration Petition">Arbitration Petition</option>
              <option value="Insolvency Statutory Notice">Insolvency Statutory Notice</option>
              <option value="Statutory Demand Notice">Statutory Demand Notice</option>
              <option value="Complaint / Pleadings">Complaint / Pleadings</option>
              <option value="Corporate Term Sheet">Corporate Term Sheet</option>
              <option value="Settlement Agreement">Settlement Agreement</option>
            </select>
          </div>

          <div class="col-12 col-md-4 d-flex gap-2">
            <button class="btn btn-primary flex-grow-1" (click)="loadDocuments()">
              <i class="bi bi-funnel-fill me-1"></i> Apply Filter
            </button>
            <button class="btn btn-outline-secondary" (click)="resetFilters()" title="Reset All Filters">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Documents Table Card -->
      <app-card [noPadding]="true">
        <div class="table-responsive">
          <table class="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th style="min-width: 280px;">Document File</th>
                <th style="min-width: 220px;">Associated Matter</th>
                <th style="min-width: 170px;">Classification</th>
                <th style="min-width: 140px;">Uploaded By</th>
                <th style="min-width: 130px;">Date Uploaded</th>
                <th class="text-end" style="min-width: 180px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let doc of paginatedDocuments">
                <!-- Document File Name & Size -->
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <div class="doc-icon-wrapper" [ngClass]="getFileIconClass(doc.doc_name)">
                      <i class="bi" [ngClass]="getFileIcon(doc.doc_name)"></i>
                    </div>
                    <div class="text-truncate" style="max-width: 320px;">
                      <a [href]="getDownloadUrl(doc.id!)" target="_blank" class="fw-semibold doc-link d-block text-truncate" [title]="doc.doc_name">
                        {{ doc.doc_name }}
                      </a>
                      <span class="text-muted small">
                        <i class="bi bi-hdd me-1"></i>{{ formatFileSize(doc.file_size) }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Associated Legal Matter -->
                <td>
                  <div *ngIf="doc.case_id; else noCase">
                    <a [routerLink]="['/cases', doc.case_id]" class="fw-semibold doc-matter-link d-block text-truncate" style="max-width: 240px;">
                      {{ doc.case_name || 'Legal Matter #' + doc.case_id }}
                    </a>
                    <span class="badge bg-light text-muted border font-monospace mt-1" style="font-size: 0.72rem;">
                      {{ doc.case_number || 'CNR Pending' }}
                    </span>
                  </div>
                  <ng-template #noCase>
                    <span class="text-muted small fst-italic">General Portfolio</span>
                  </ng-template>
                </td>

                <!-- Classification Badge -->
                <td>
                  <span class="badge" [ngClass]="getDocTypeBadgeClass(doc.doc_type)">
                    {{ doc.doc_type || 'General Legal' }}
                  </span>
                </td>

                <!-- Uploaded By -->
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="uploader-avatar">
                      {{ (doc.uploader_name || 'Advocate').charAt(0).toUpperCase() }}
                    </div>
                    <span class="small text-secondary">{{ doc.uploader_name || 'Counsel' }}</span>
                  </div>
                </td>

                <!-- Date Uploaded -->
                <td>
                  <span class="small text-muted">{{ doc.uploaded_at | date:'mediumDate' }}</span>
                </td>

                <!-- Actions -->
                <td class="text-end">
                  <div class="d-inline-flex align-items-center gap-1">
                    <button 
                      class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 px-2 py-1" 
                      (click)="openOfflineSummary(doc)" 
                      title="Instant Confidential Brief (100% Air-Gapped NLP)">
                      <i class="bi bi-lightning-charge-fill text-warning"></i>
                      <span class="d-none d-lg-inline small">Summarize</span>
                    </button>

                    <a 
                      [href]="getDownloadUrl(doc.id!)" 
                      target="_blank" 
                      class="btn btn-sm btn-outline-primary px-2 py-1" 
                      title="Download Document">
                      <i class="bi bi-download"></i>
                    </a>

                    <button 
                      class="btn btn-sm btn-outline-danger px-2 py-1" 
                      (click)="deleteDoc(doc)" 
                      title="Delete Document">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr *ngIf="!loading && paginatedDocuments.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <div class="empty-docs-container py-4">
                    <i class="bi bi-folder-x display-4 d-block mb-3 text-muted opacity-50"></i>
                    <h5 class="fw-semibold text-dark">No Documents Found</h5>
                    <p class="text-muted small mb-3">No legal records match your current search or classification filter.</p>
                    <button class="btn btn-sm btn-primary" (click)="resetFilters()">
                      <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Loading State -->
              <tr *ngIf="loading">
                <td colspan="6" class="text-center py-5 text-muted">
                  <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                  <span>Loading legal document vault...</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Unified Modern JusticeFlow Pagination -->
        <app-pagination
          [page]="pagination.page"
          [limit]="pagination.limit"
          [total]="documents.length"
          itemName="documents"
          [pageSizeOptions]="[5, 10, 20, 50]"
          (pageChange)="changePage($event)"
          (limitChange)="changeLimit($event)">
        </app-pagination>
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
            <div class="form-text small" *ngIf="selectedFile">
              <i class="bi bi-check-circle-fill text-success me-1"></i>
              Selected: <strong>{{ selectedFile.name }}</strong> ({{ formatFileSize(selectedFile.size) }})
            </div>
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
              <!-- Key Themes & Topics -->
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

              <!-- Entities & Organizations -->
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

              <!-- Metrics & Quantitative Specs -->
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

            <!-- Action Directives & Rules -->
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

        <!-- TAB 2: CLIENT & CASE RAG INTELLIGENCE -->
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
        font-weight: 700;
        color: var(--jf-text-primary, #0F172A);
      }

      .doc-stat-card {
        background: var(--jf-bg-card, #FFFFFF);
        border-color: var(--jf-border, #E2E8F0) !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--jf-shadow-sm, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
        }

        .stat-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .filters-card {
        background: var(--jf-bg-card, #FFFFFF);
        border-color: var(--jf-border, #E2E8F0) !important;
      }

      .doc-icon-wrapper {
        width: 38px;
        height: 38px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        flex-shrink: 0;

        &.icon-pdf {
          background: rgba(239, 68, 68, 0.12);
          color: #EF4444;
        }
        &.icon-word {
          background: rgba(37, 99, 235, 0.12);
          color: #2563EB;
        }
        &.icon-excel {
          background: rgba(16, 185, 129, 0.12);
          color: #10B981;
        }
        &.icon-default {
          background: rgba(99, 102, 241, 0.12);
          color: #6366F1;
        }
      }

      .doc-link {
        color: var(--jf-text-primary, #0F172A);
        text-decoration: none;
        transition: color 0.15s ease;

        &:hover {
          color: #2563EB !important;
        }
      }

      .doc-matter-link {
        color: var(--jf-text-primary, #0F172A);
        text-decoration: none;
        font-size: 0.9rem;

        &:hover {
          color: #2563EB !important;
        }
      }

      .uploader-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #3B82F6;
        color: #FFFFFF;
        font-size: 0.75rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .spin-icon {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
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
  uploadDocType: string = 'Plaint / Statement of Truth';
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
    { label: 'Plaint / Statement of Truth', value: 'Plaint / Statement of Truth' },
    { label: 'Commercial Contract', value: 'Commercial Contract' },
    { label: 'Interlocutory Application (Order 39)', value: 'Interlocutory Application (Order 39)' },
    { label: 'Probate Record', value: 'Probate Record' },
    { label: 'Court Affidavit', value: 'Court Affidavit' },
    { label: 'Regulatory Appeal Memo', value: 'Regulatory Appeal Memo' },
    { label: 'IP Trademark Certificate', value: 'IP Trademark Certificate' },
    { label: 'Constitutional Writ Paperbook', value: 'Constitutional Writ Paperbook' },
    { label: 'Arbitration Petition', value: 'Arbitration Petition' },
    { label: 'Insolvency Statutory Notice', value: 'Insolvency Statutory Notice' },
    { label: 'Statutory Demand Notice', value: 'Statutory Demand Notice' },
    { label: 'Complaint / Pleadings', value: 'Complaint / Pleadings' },
    { label: 'Corporate Term Sheet', value: 'Corporate Term Sheet' },
    { label: 'Settlement Agreement', value: 'Settlement Agreement' },
    { label: 'Other Legal Instrument', value: 'Other' }
  ];

  constructor(
    private documentService: DocumentService,
    private caseService: CaseService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadDocuments();
    this.loadCasesList();
  }

  get paginatedDocuments(): DocumentItem[] {
    const startIndex = (this.pagination.page - 1) * this.pagination.limit;
    return this.documents.slice(startIndex, startIndex + this.pagination.limit);
  }

  changePage(page: number): void {
    this.pagination.page = page;
  }

  changeLimit(limit: number): void {
    this.pagination.limit = limit;
    this.pagination.page = 1;
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

  getTotalStorageFormatted(): string {
    const totalBytes = this.documents.reduce((acc, d) => acc + (d.file_size || 0), 0);
    return this.formatFileSize(totalBytes);
  }

  getUniqueCasesCount(): number {
    return new Set(this.documents.map(d => d.case_id)).size;
  }

  getPleadingsCount(): number {
    return this.documents.filter(d =>
      d.doc_type?.includes('Plaint') ||
      d.doc_type?.includes('Petition') ||
      d.doc_type?.includes('Notice') ||
      d.doc_type?.includes('Affidavit')
    ).length;
  }

  getFileIcon(name?: string): string {
    if (!name) return 'bi-file-earmark-text-fill';
    const lower = name.toLowerCase();
    if (lower.endsWith('.pdf')) return 'bi-file-earmark-pdf-fill';
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'bi-file-earmark-word-fill';
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return 'bi-file-earmark-excel-fill';
    return 'bi-file-earmark-text-fill';
  }

  getFileIconClass(name?: string): string {
    if (!name) return 'icon-default';
    const lower = name.toLowerCase();
    if (lower.endsWith('.pdf')) return 'icon-pdf';
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'icon-word';
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return 'icon-excel';
    return 'icon-default';
  }

  getDocTypeBadgeClass(type?: string): string {
    if (!type) return 'bg-light text-dark border';
    if (type.includes('Plaint') || type.includes('Complaint')) return 'bg-primary-subtle text-primary border border-primary-subtle';
    if (type.includes('Contract')) return 'bg-info-subtle text-info border border-info-subtle';
    if (type.includes('Application')) return 'bg-warning-subtle text-warning border border-warning-subtle';
    if (type.includes('Affidavit')) return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    if (type.includes('Notice')) return 'bg-danger-subtle text-danger border border-danger-subtle';
    if (type.includes('Petition')) return 'bg-primary text-white';
    if (type.includes('Probate')) return 'bg-success-subtle text-success border border-success-subtle';
    return 'bg-light text-dark border';
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
