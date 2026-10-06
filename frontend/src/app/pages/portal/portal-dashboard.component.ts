import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClientCase, ClientDocument, ClientInvoice, ClientPortalService, ClientProfile } from '../../core/services/client-portal.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppBadgeComponent } from '../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppCardComponent,
    AppBadgeComponent,
    AppButtonComponent,
    AppModalComponent
  ],
  template: `
    <div class="client-portal-layout">
      <!-- Client Portal Top Navigation Bar -->
      <header class="portal-navbar px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center sticky-top shadow-sm">
        <div class="d-flex align-items-center gap-3">
          <div class="portal-brand-icon">
            <img src="assets/logo-icon.png" alt="JusticeFlow Logo" class="portal-logo-img" onerror="this.onerror=null; this.src='assets/Justiceflow.jpg';">
          </div>
          <div>
            <div class="fw-bold fs-5 text-dark mb-0">JUSTICEFLOW <span class="badge bg-success-subtle text-success ms-1">CLIENT ACCESS</span></div>
            <div class="small text-muted" style="font-size: 11px;">Confidential Attorney-Client Privileged Workspace</div>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="text-end d-none d-md-block">
            <div class="fw-bold text-dark small">{{ clientUser?.name || 'Apex Logistics International' }}</div>
            <div class="text-muted" style="font-size: 11px;">{{ clientUser?.email || 'client@apexlogistics.com' }}</div>
          </div>
          <button class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-3 py-2 fw-semibold rounded-3" (click)="onLogout()">
            <i class="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <!-- Main Portal Content -->
      <main class="container-fluid px-4 py-4">
        <!-- Client Welcome Banner -->
        <div class="p-4 p-md-5 rounded-4 mb-4 text-white client-hero-banner shadow-sm">
          <div class="row align-items-center">
            <div class="col-12 col-md-8">
              <span class="badge bg-white text-dark mb-2 px-3 py-1 font-monospace">
                <i class="bi bi-lock-fill text-success me-1"></i> 256-Bit Encrypted Client Channel
              </span>
              <h2 class="fw-bold mb-1 text-white">Welcome back, {{ clientUser?.name }}</h2>
              <p class="opacity-80 small mb-0">
                Track your active litigation milestones, review verified invoices, and securely submit confidential discovery records to lead counsel Alexander Vance, Esq.
              </p>
            </div>
            <div class="col-12 col-md-4 text-md-end mt-3 mt-md-0">
              <button class="btn btn-light fw-bold text-dark btn-sm px-3 py-2 shadow-sm d-inline-flex align-items-center gap-2 rounded-3" (click)="activeTab = 'documents'; openUploadModal()">
                <i class="bi bi-cloud-arrow-up-fill text-primary"></i>
                <span>Secure Document Drop</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <ul class="nav nav-pills mb-4">
          <li class="nav-item">
            <button
              class="nav-link"
              [class.active]="activeTab === 'cases'"
              (click)="activeTab = 'cases'">
              <i class="bi bi-briefcase-fill"></i>
              <span>Case Progression & Milestones ({{ cases.length }})</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              [class.active]="activeTab === 'invoices'"
              (click)="activeTab = 'invoices'">
              <i class="bi bi-receipt"></i>
              <span>Billing & Payments ({{ invoices.length }})</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              [class.active]="activeTab === 'documents'"
              (click)="activeTab = 'documents'">
              <i class="bi bi-folder-check"></i>
              <span>Secure Document Vault ({{ documents.length }})</span>
            </button>
          </li>
        </ul>

        <!-- TAB 1: Case Progression Timeline & Milestones -->
        <div *ngIf="activeTab === 'cases'" class="row g-4">
          <div *ngFor="let cs of cases" class="col-12">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-3">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                <div>
                  <span class="badge bg-primary-subtle text-primary border me-2 font-monospace">{{ cs.case_number }}</span>
                  <span class="badge bg-success" *ngIf="cs.status === 'Open'">ACTIVE LITIGATION</span>
                  <span class="badge bg-secondary" *ngIf="cs.status === 'Closed'">RESOLVED</span>
                  <h4 class="fw-bold text-dark mt-2 mb-1">{{ cs.case_name }}</h4>
                  <div class="small text-muted">
                    <i class="bi bi-bank me-1"></i>{{ cs.court_name || 'US District Court - SDNY' }} &bull;
                    <i class="bi bi-person me-1"></i>Presiding Judge: <strong>{{ cs.judge_name || 'Hon. Katherine Failla' }}</strong> &bull;
                    <i class="bi bi-person-badge me-1"></i>Lead Counsel: <strong>{{ cs.lead_attorney || 'Alexander Vance, Esq.' }}</strong>
                  </div>
                </div>
                <div class="text-end">
                  <div class="small text-muted fw-semibold">MATTER COMPLETION</div>
                  <div class="fs-4 fw-bold text-primary">{{ cs.progression_percentage }}%</div>
                </div>
              </div>

              <!-- Visual Progress Bar -->
              <div class="progress mb-4" style="height: 10px;">
                <div
                  class="progress-bar progress-bar-striped progress-bar-animated bg-success"
                  role="progressbar"
                  [style.width.%]="cs.progression_percentage">
                </div>
              </div>

              <!-- Interactive Milestone Timeline -->
              <h6 class="fw-bold text-dark small text-uppercase mb-3">
                <i class="bi bi-diagram-3 me-1"></i> Case Progression Milestones
              </h6>
              <div class="row g-2">
                <div *ngFor="let m of cs.milestones; let i = index" class="col-12 col-md">
                  <div class="milestone-step-card p-3 rounded-3 border h-100" [ngClass]="{'border-success bg-light-green': m.status === 'Completed', 'border-primary bg-light-blue': m.status === 'In Progress'}">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <i class="bi" [ngClass]="m.icon" [class.text-success]="m.status === 'Completed'" [class.text-primary]="m.status === 'In Progress'" [class.text-muted]="m.status !== 'Completed' && m.status !== 'In Progress'"></i>
                      <span class="badge" [ngClass]="{'bg-success': m.status === 'Completed', 'bg-primary': m.status === 'In Progress', 'bg-light text-muted border': m.status !== 'Completed' && m.status !== 'In Progress'}">
                        {{ m.status }}
                      </span>
                    </div>
                    <div class="fw-bold text-dark small mt-2">{{ m.name }}</div>
                    <div class="text-muted" style="font-size: 11px;">{{ m.date || 'Scheduled' }}</div>
                  </div>
                </div>
              </div>

              <!-- Attorney Support Contact Box -->
              <div class="mt-4 p-3 bg-light rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div class="d-flex align-items-center gap-3">
                  <div class="attorney-avatar">
                    <i class="bi bi-person-fill text-white fs-5"></i>
                  </div>
                  <div>
                    <div class="fw-bold small text-dark">Need clarification on docket developments?</div>
                    <div class="text-muted" style="font-size: 12px;">Contact Lead Counsel Alexander Vance, Esq. &bull; Direct: (212) 555-0199</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-outline-primary" (click)="activeTab = 'documents'; openUploadModal()">
                  <i class="bi bi-paperclip me-1"></i> Submit Discovery Evidence
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: Historical Invoices & Secure Payment -->
        <div *ngIf="activeTab === 'invoices'" class="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 class="fw-bold text-dark mb-0">Confidential Billing & Receipts</h5>
              <p class="text-muted small mb-0">Review verified legal fee invoices, trust escrow deposits, and complete online card payments</p>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Invoice Number</th>
                  <th>Matter / Proceeding</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let inv of invoices">
                  <td class="fw-bold text-primary font-monospace">{{ inv.invoice_number }}</td>
                  <td>{{ inv.case_name || 'Apex v. QuickFreight' }}</td>
                  <td>{{ inv.issue_date | date:'mediumDate' }}</td>
                  <td>{{ inv.due_date | date:'mediumDate' }}</td>
                  <td class="fw-bold text-dark">₹{{ inv.total | number:'1.2-2' }}</td>
                  <td>
                    <span class="badge" [ngClass]="{'bg-success': inv.status === 'Paid', 'bg-warning text-dark': inv.status === 'Sent', 'bg-danger': inv.status === 'Overdue'}">
                      {{ inv.status }}
                    </span>
                  </td>
                  <td>
                    <button
                      *ngIf="inv.status !== 'Paid'"
                      class="btn btn-sm btn-success d-inline-flex align-items-center gap-1 px-3 py-1 fw-semibold rounded-3 shadow-sm"
                      (click)="openPayModal(inv)">
                      <i class="bi bi-credit-card"></i>
                      <span>Pay Now</span>
                    </button>
                    <span *ngIf="inv.status === 'Paid'" class="text-success small fw-semibold d-inline-flex align-items-center gap-1">
                      <i class="bi bi-check-circle-fill"></i>
                      <span>Paid in Full</span>
                    </span>
                  </td>
                </tr>
                <tr *ngIf="invoices.length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">
                    No active invoices or billing statements found for your account.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 3: Secure Document Vault -->
        <div *ngIf="activeTab === 'documents'" class="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h5 class="fw-bold text-dark mb-0">Secure Confidential Document Vault</h5>
              <p class="text-muted small mb-0">Directly transmit witness statements, contracts, and financial records to counsel (avoiding unencrypted email risks)</p>
            </div>
            <button class="btn btn-sm btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold rounded-3 shadow-sm" (click)="openUploadModal()">
              <i class="bi bi-cloud-arrow-up-fill"></i>
              <span>Upload Document</span>
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Document Title</th>
                  <th>Category</th>
                  <th>Associated Matter</th>
                  <th>Size</th>
                  <th>Transmission Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let doc of documents">
                  <td class="fw-semibold">
                    <i class="bi bi-file-earmark-pdf-fill text-danger me-2"></i>{{ doc.doc_name }}
                  </td>
                  <td><span class="badge bg-light text-dark border">{{ doc.doc_type || 'Discovery Evidence' }}</span></td>
                  <td>{{ doc.case_name || 'General Representation' }}</td>
                  <td class="small text-muted">{{ (doc.file_size || 1024) / 1024 | number:'1.0-0' }} KB</td>
                  <td class="small text-muted">{{ doc.uploaded_at | date:'short' }}</td>
                  <td>
                    <span class="badge bg-success-subtle text-success border">
                      <i class="bi bi-shield-check me-1"></i> Encrypted
                    </span>
                  </td>
                </tr>
                <tr *ngIf="documents.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    No documents uploaded yet. Click "Upload Document" to securely transmit discovery materials to counsel.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <!-- MODAL: Pay Invoice -->
      <app-modal
        [isOpen]="isPayModalOpen"
        title="Secure Razorpay / UPI Client Fee Payment"
        (closed)="isPayModalOpen = false">
        <div class="p-3" *ngIf="selectedInvoice">
          <div class="text-center mb-3">
            <i class="bi bi-shield-lock-fill text-success fs-1"></i>
            <h5 class="fw-bold mt-1">Pay Invoice {{ selectedInvoice.invoice_number }}</h5>
            <div class="fs-4 fw-bold text-dark">₹{{ selectedInvoice.total | number:'1.2-2' }}</div>
            <span class="badge bg-success-subtle text-success">Razorpay / UPI Certified 256-Bit SSL Gateway</span>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold small">Cardholder Name</label>
            <input type="text" class="form-control form-control-sm" [(ngModel)]="paymentForm.cardName" placeholder="e.g. Marcus Thorne">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold small">Card Number</label>
            <input type="text" class="form-control form-control-sm font-monospace" [(ngModel)]="paymentForm.cardNumber" placeholder="•••• •••• •••• 4242">
          </div>
          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label fw-semibold small">Expiry</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="paymentForm.expiry" placeholder="12/28">
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold small">CVC / CVV</label>
              <input type="password" class="form-control form-control-sm" [(ngModel)]="paymentForm.cvc" placeholder="•••">
            </div>
          </div>

          <button class="btn btn-success btn-sm w-100 py-2 fw-bold" (click)="processClientPayment()">
            <i class="bi bi-lock-fill me-1"></i> Authorize & Pay ₹{{ selectedInvoice.total | number:'1.2-2' }}
          </button>
        </div>
      </app-modal>

      <!-- MODAL: Upload Document -->
      <app-modal
        [isOpen]="isUploadModalOpen"
        title="Confidential Legal Document Upload"
        (closed)="isUploadModalOpen = false">
        <div class="p-3">
          <div class="alert alert-info py-2 small mb-3">
            <i class="bi bi-shield-lock me-1"></i>
            Files transmitted through this portal are directly stored in the firm's confidential case repository with attorney-client privilege protection.
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold small">Document Title *</label>
            <input type="text" class="form-control form-control-sm" [(ngModel)]="newDoc.doc_name" placeholder="e.g. Refrigeration Telemetry Logs April 2026.pdf">
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold small">Document Category</label>
            <select class="form-select form-select-sm" [(ngModel)]="newDoc.doc_type">
              <option value="Discovery Evidence">Discovery Evidence & Telemetry</option>
              <option value="Contract / Agreement">Contract or Bill of Lading</option>
              <option value="Witness Statement">Witness Affidavit / Statement</option>
              <option value="Financial Document">Financial Damage Accounting</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold small">Select File *</label>
            <input type="file" class="form-control form-control-sm" (change)="onFileSelected($event)">
          </div>

          <div class="d-flex justify-content-end gap-2 pt-2 border-top">
            <button class="btn btn-sm btn-light border" (click)="isUploadModalOpen = false">Cancel</button>
            <button class="btn btn-sm btn-primary" (click)="submitDocumentUpload()" [disabled]="!newDoc.doc_name">
              <i class="bi bi-cloud-arrow-up-fill me-1"></i> Upload File to Counsel
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .client-portal-layout {
      min-height: 100vh;
      background: #F1F5F9;
      font-family: 'Inter', sans-serif;
    }
    .portal-brand-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      padding: 3px;
      overflow: hidden;

      .portal-logo-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .client-hero-banner {
      background: radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.25) 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 40%),
                  linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #0369A1 100%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
    }
    .nav-pills {
      background: #FFFFFF;
      padding: 6px;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      display: inline-flex;
      flex-wrap: wrap;
      gap: 6px;

      .nav-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 42px;
        padding: 0 16px;
        font-weight: 600;
        font-size: 0.88rem;
        color: #475569;
        border-radius: 8px;
        border: 1px solid transparent;
        transition: all 0.2s ease;

        &:hover:not(.active) {
          background: #F8FAFC;
          color: #0F172A;
        }

        &.active {
          background: #2563EB;
          color: #FFFFFF;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
        }
      }
    }
    .milestone-step-card {
      transition: all 0.2s ease;
      background: #FFFFFF;
    }
    .bg-light-green {
      background: #F0FDF4;
    }
    .bg-light-blue {
      background: #F0F9FF;
    }
    .attorney-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #2C3E50;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class PortalDashboardComponent implements OnInit {
  clientUser: ClientProfile | null = null;
  cases: ClientCase[] = [];
  invoices: ClientInvoice[] = [];
  documents: ClientDocument[] = [];

  activeTab: 'cases' | 'invoices' | 'documents' = 'cases';

  // Invoices Modal
  isPayModalOpen: boolean = false;
  selectedInvoice: ClientInvoice | null = null;
  paymentForm = { cardName: 'Marcus Thorne', cardNumber: '•••• •••• •••• 4242', expiry: '12/28', cvc: '•••' };

  // Document Modal
  isUploadModalOpen: boolean = false;
  newDoc = { doc_name: '', doc_type: 'Discovery Evidence', case_id: 1 };

  constructor(
    private portalService: ClientPortalService,
    private router: Router,
    private notify: NotificationService
  ) { }

  ngOnInit(): void {
    this.clientUser = this.portalService.getClientUser();
    this.loadData();
  }

  loadData(): void {
    this.portalService.getCases().subscribe({
      next: (res) => {
        if (res.success) {
          this.cases = res.data;
        }
      }
    });

    this.portalService.getInvoices().subscribe({
      next: (res) => {
        if (res.success) {
          this.invoices = res.data;
        }
      }
    });

    this.portalService.getDocuments().subscribe({
      next: (res) => {
        if (res.success) {
          this.documents = res.data;
        }
      }
    });
  }

  onLogout(): void {
    this.portalService.logout();
    this.notify.info('Signed out of Client Portal');
    this.router.navigate(['/portal/login']);
  }

  openPayModal(inv: ClientInvoice): void {
    this.selectedInvoice = inv;
    this.isPayModalOpen = true;
  }

  processClientPayment(): void {
    if (!this.selectedInvoice) return;
    this.selectedInvoice.status = 'Paid';
    this.isPayModalOpen = false;
    this.notify.success(`Payment of ₹${this.selectedInvoice.total} successfully processed! Fee receipt issued.`);
  }

  openUploadModal(): void {
    this.newDoc = {
      doc_name: 'Telemetry Cold-Chain Diagnostics Set 441 (Sec 65B Certified).pdf',
      doc_type: 'Electronic Evidence / S.65B',
      case_id: this.cases[0]?.id || 1
    };
    this.isUploadModalOpen = true;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newDoc.doc_name = file.name;
    }
  }

  submitDocumentUpload(): void {
    this.portalService.uploadDocument(this.newDoc).subscribe({
      next: (res) => {
        if (res.success) {
          this.notify.success(res.message);
          this.isUploadModalOpen = false;
          this.loadData();
        }
      },
      error: () => {
        this.notify.error('Upload failed');
      }
    });
  }
}
