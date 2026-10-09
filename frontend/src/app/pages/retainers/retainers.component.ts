import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetainerService } from '../../core/services/retainer.service';
import { CaseService } from '../../core/services/case.service';
import { ClientService } from '../../core/services/client.service';
import { NotificationService } from '../../core/services/notification.service';
import { Case, Client, RetainerAgreement } from '../../core/models/models';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppBadgeComponent } from '../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-retainers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppCardComponent,
    AppBadgeComponent,
    AppButtonComponent,
    AppModalComponent
  ],
  template: `
    <div class="retainers-page">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">Digital Retainer Agreements & E-Signatures</h2>
          <p class="text-muted small mb-0">
            Client engagement workflows, predefined legal fee schedules, biometric signature capture, and document revision control
          </p>
        </div>
        <div class="d-flex gap-2">
          <app-button
            label="Draft New Retainer (v1.0)"
            icon="bi-file-earmark-plus"
            variant="primary"
            (btnClick)="openNewRetainerModal()">
          </app-button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">TOTAL ENGAGEMENTS</span>
              <span class="badge bg-light text-primary border"><i class="bi bi-file-earmark-text"></i></span>
            </div>
            <div class="fs-4 fw-bold text-dark">{{ retainers.length }}</div>
            <div class="text-muted small" style="font-size: 11px;">Active, draft & signed letters</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">SIGNED & EXECUTED</span>
              <span class="badge bg-success-subtle text-success border"><i class="bi bi-patch-check-fill"></i></span>
            </div>
            <div class="fs-4 fw-bold text-success">{{ getCountByStatus('Signed') }}</div>
            <div class="text-muted small" style="font-size: 11px;">With biometric timestamps</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">PENDING SIGNATURE</span>
              <span class="badge bg-warning-subtle text-warning border"><i class="bi bi-clock-history"></i></span>
            </div>
            <div class="fs-4 fw-bold text-warning">{{ getCountByStatus('Sent') }}</div>
            <div class="text-muted small" style="font-size: 11px;">Awaiting client review</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">DRAFT / REVISIONS</span>
              <span class="badge bg-light text-secondary border"><i class="bi bi-pencil-square"></i></span>
            </div>
            <div class="fs-4 fw-bold text-secondary">{{ getCountByStatus('Draft') + getCountByStatus('Superseded') }}</div>
            <div class="text-muted small" style="font-size: 11px;">Redlines & prior versions</div>
          </div>
        </div>
      </div>

      <!-- Retainers Table -->
      <app-card title="Engagement Letters & Retainer Contracts">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Agreement Title</th>
                <th>Client</th>
                <th>Matter / Case</th>
                <th>Fee Schedule</th>
                <th>Version</th>
                <th>Status</th>
                <th>E-Signature</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of retainers">
                <td>
                  <div class="fw-semibold text-dark">{{ item.title }}</div>
                  <div class="small text-muted" *ngIf="item.redline_notes">
                    <i class="bi bi-journal-text me-1"></i>{{ item.redline_notes }}
                  </div>
                </td>
                <td>
                  <div class="fw-medium">{{ getClientName(item.client_id) }}</div>
                </td>
                <td>
                  <span class="badge bg-light text-primary border">{{ getCaseName(item.case_id) }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-success">
                    <span *ngIf="item.retainer_amount">₹{{ item.retainer_amount | number:'1.2-2' }} Escrow Deposit</span>
                    <span *ngIf="!item.retainer_amount">Standard Terms</span>
                  </div>
                  <div class="small text-muted" *ngIf="item.hourly_rate">₹{{ item.hourly_rate }}/hr &bull; {{ item.fee_type }}</div>
                </td>
                <td>
                  <span class="badge bg-dark font-monospace">{{ item.version }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusBadge(item.status)">
                    {{ item.status }}
                  </span>
                </td>
                <td>
                  <div *ngIf="item.status === 'Signed'" class="small text-success fw-semibold">
                    <i class="bi bi-shield-check me-1"></i> {{ item.signer_name }}
                    <div class="text-muted" style="font-size: 10px;">{{ item.signed_at | date:'short' }}</div>
                  </div>
                  <button
                    *ngIf="item.status !== 'Signed' && item.status !== 'Superseded'"
                    class="btn btn-xs btn-outline-success"
                    (click)="openSignModal(item)">
                    <i class="bi bi-pen me-1"></i> Sign Now
                  </button>
                  <span *ngIf="item.status === 'Superseded'" class="text-muted small" style="font-size: 11px;">
                    Replaced by newer version
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <a [href]="retainerService.getPdfUrl(item.id!)" target="_blank" class="btn btn-outline-secondary" title="Print Contract / PDF">
                      <i class="bi bi-file-earmark-pdf"></i>
                    </a>
                    <button
                      *ngIf="item.status !== 'Superseded'"
                      class="btn btn-outline-primary"
                      (click)="openRevisionModal(item)"
                      title="Create Revised Version (e.g. v2.0)">
                      <i class="bi bi-arrow-repeat"></i> Revise
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      (click)="deleteRetainer(item)"
                      title="Delete">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="retainers.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  No retainer contracts drafted yet. Click "Draft New Retainer" to create an engagement letter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-card>

      <!-- MODAL 1: Draft New Retainer Agreement (v1.0) -->
      <app-modal
        [isOpen]="isNewModalOpen"
        title="Draft Legal Engagement & Retainer Agreement"
        (close)="isNewModalOpen = false"
        (closed)="isNewModalOpen = false">
        <div class="p-3">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label fw-semibold small">Agreement / Vakalatnama Title *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="newRetainer.title" placeholder="e.g. Vakalatnama & Retainer: Apex Commercial Suit (Comm. O.S. 481/2026)">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Client *</label>
              <select class="form-select form-select-sm" [(ngModel)]="newRetainer.client_id">
                <option *ngFor="let cl of clientList" [ngValue]="cl.id">{{ cl.name }}</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Associated Case Docket</label>
              <select class="form-select form-select-sm" [(ngModel)]="newRetainer.case_id">
                <option [ngValue]="null">Select Case...</option>
                <option *ngFor="let c of caseList" [ngValue]="c.id">{{ c.case_number }} - {{ c.case_name }}</option>
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold small">Fee Structure</label>
              <select class="form-select form-select-sm" [(ngModel)]="newRetainer.fee_type">
                <option value="Retainer Draw">Retainer Draw (Against BCI Rule 24 Client Escrow)</option>
                <option value="Hourly">Standard Appearance / Hourly Billing</option>
                <option value="Flat Fee">Fixed Brief Fee per Hearing</option>
                <option value="Contingency">Commercial Retainer Retinue</option>
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold small">Retainer Deposit (₹ INR)</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="newRetainer.retainer_amount" placeholder="e.g. 150000">
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold small">Professional Rate (₹/hr)</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="newRetainer.hourly_rate" placeholder="e.g. 4500">
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold small">Engagement Terms & Fee Provisions</label>
              <textarea class="form-control form-control-sm font-monospace" rows="6" [(ngModel)]="newRetainer.terms_content"></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-3">
            <button class="btn btn-sm btn-light border" (click)="isNewModalOpen = false">Cancel</button>
            <button class="btn btn-sm btn-primary" (click)="saveNewRetainer()" [disabled]="!newRetainer.title || !newRetainer.client_id">
              Create Engagement Letter v1.0
            </button>
          </div>
        </div>
      </app-modal>

      <!-- MODAL 2: Version Revision & Redline Notes -->
      <app-modal
        [isOpen]="isRevisionModalOpen"
        title="Create Contract Revision (Version Control)"
        (close)="isRevisionModalOpen = false"
        (closed)="isRevisionModalOpen = false">
        <div class="p-3" *ngIf="selectedRetainer">
          <div class="alert alert-info py-2 small mb-3">
            <i class="bi bi-info-circle me-1"></i>
            Revising <strong>{{ selectedRetainer.title }} ({{ selectedRetainer.version }})</strong>.
            This will create the next version (e.g. v2.0) and preserve {{ selectedRetainer.version }} as an archived audit record.
          </div>

          <div class="row g-3">
            <div class="col-12">
              <label class="form-label fw-semibold small">Redline Summary / Revision Notes *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="revisionData.redline_notes" placeholder="e.g. Updated fee schedule to ₹5,000/hr; added ADR arbitration clause">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Retainer Deposit (₹)</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="revisionData.retainer_amount">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Hourly Rate (₹/hr)</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="revisionData.hourly_rate">
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold small">Updated Terms & Conditions</label>
              <textarea class="form-control form-control-sm font-monospace" rows="6" [(ngModel)]="revisionData.terms_content"></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-3">
            <button class="btn btn-sm btn-light border" (click)="isRevisionModalOpen = false">Cancel</button>
            <button class="btn btn-sm btn-primary" (click)="saveRevision()">
              Publish Revision
            </button>
          </div>
        </div>
      </app-modal>

      <!-- MODAL 3: Built-In Canvas Digital Signature Pad -->
      <app-modal
        [isOpen]="isSignModalOpen"
        title="Digital E-Signature Pad & Biometric Timestamp"
        (close)="closeSignModal()"
        (closed)="closeSignModal()">
        <div class="p-3" *ngIf="selectedRetainer">
          <p class="text-muted small mb-2">
            Please sign below using your mouse, trackpad, stylus, or touch screen. Your signature will be cryptographically bound with a biometric timestamp.
          </p>

          <div class="row g-2 mb-3">
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Signer Full Legal Name *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="signerName" placeholder="e.g. Marcus Thorne">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Signer Email *</label>
              <input type="email" class="form-control form-control-sm" [(ngModel)]="signerEmail" placeholder="e.g. m.thorne@apexlogistics.com">
            </div>
          </div>

          <!-- HTML5 Canvas Signature Pad -->
          <div class="signature-canvas-wrapper border rounded-3 p-2 bg-light mb-2">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="small fw-semibold text-secondary"><i class="bi bi-pen me-1"></i>Sign in the box below:</span>
              <button type="button" class="btn btn-xs btn-outline-danger" (click)="clearCanvas()">
                <i class="bi bi-eraser"></i> Clear Pad
              </button>
            </div>
            <canvas
              #sigCanvas
              width="450"
              height="150"
              class="bg-white border rounded w-100"
              style="touch-action: none; cursor: crosshair;"
              (mousedown)="startDrawing($event)"
              (mousemove)="draw($event)"
              (mouseup)="stopDrawing()"
              (mouseleave)="stopDrawing()"
              (touchstart)="startTouch($event)"
              (touchmove)="drawTouch($event)"
              (touchend)="stopDrawing()">
            </canvas>
            <div class="text-center text-muted small mt-1" style="font-size: 11px;">
              X ____________________________________________________________________________________
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center pt-2 border-top">
            <div class="small text-muted" style="font-size: 11px;">
              <i class="bi bi-lock-fill text-success"></i> Biometric SHA-256 Timestamping Active
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-light border" (click)="closeSignModal()">Cancel</button>
              <button class="btn btn-sm btn-success" (click)="executeSignature()" [disabled]="!signerName || !hasDrawn">
                <i class="bi bi-check-circle me-1"></i> Adopt & Legally Sign
              </button>
            </div>
          </div>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .retainers-page {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .btn-xs {
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      border-radius: 4px;
    }
  `]
})
export class RetainersComponent implements OnInit {
  @ViewChild('sigCanvas') sigCanvas!: ElementRef<HTMLCanvasElement>;

  retainers: RetainerAgreement[] = [];
  caseList: Case[] = [];
  clientList: Client[] = [];

  // Modals
  isNewModalOpen: boolean = false;
  isRevisionModalOpen: boolean = false;
  isSignModalOpen: boolean = false;

  selectedRetainer: RetainerAgreement | null = null;

  // New Retainer Form
  newRetainer: Partial<RetainerAgreement> = {
    title: '',
    client_id: undefined,
    case_id: undefined,
    fee_type: 'Retainer Draw',
    retainer_amount: 150000,
    hourly_rate: 4500,
    terms_content: `LEGAL SERVICES ENGAGEMENT & VAKALATNAMA RETAINER AGREEMENT\nPursuant to the Advocates Act, 1961 and Bar Council of India Rules (Part VI, Chapter II)\n\n1. SCOPE OF ENGAGEMENT: Chambers of JusticeFlow Advocates agrees to provide comprehensive legal representation before the Hon'ble Commercial Court / High Court in the matter identified above, including plaints, written statements, interim applications under Order XXXIX CPC, leading evidence, and final oral arguments.\n\n2. ADVANCE RETAINER & CLIENT TRUST ESCROW: Client shall deposit the agreed Retainer Advance into the Advocate's Dedicated Client Trust Escrow Account as required under Bar Council of India Rule 24. Professional fee deductions shall only occur upon formal submission of itemized professional bills.\n\n3. COURT EXPENSES & STAMP DUTY: All statutory court fees under State Court Fees Act, process fees, paper-book printing, translation costs, and Advocate Welfare Fund stamps shall be borne by Client at actuals.\n\n4. PROFESSIONAL ETHICS & DISCHARGE: Representation is governed strictly by the Advocates Act, 1961 and High Court Rules of Practice. Client or Counsel may terminate engagement upon formal discharge of Vakalatnama.`
  };

  // Revision Form
  revisionData: Partial<RetainerAgreement> = {
    redline_notes: '',
    retainer_amount: 0,
    hourly_rate: 0,
    terms_content: ''
  };

  // Signature Pad variables
  signerName: string = '';
  signerEmail: string = '';
  isDrawing: boolean = false;
  hasDrawn: boolean = false;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(
    public retainerService: RetainerService,
    private caseService: CaseService,
    private clientService: ClientService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadRetainers();
    this.loadCasesAndClients();
  }

  loadRetainers(): void {
    this.retainerService.getRetainers().subscribe({
      next: (res) => {
        if (res.success) {
          this.retainers = res.data;
        }
      }
    });
  }

  loadCasesAndClients(): void {
    this.caseService.getCases({ limit: 50 }).subscribe({
      next: (res) => {
        this.caseList = res.data;
      }
    });
    this.clientService.getClients({ limit: 50 }).subscribe({
      next: (res) => {
        this.clientList = res.data;
        if (this.clientList.length > 0 && !this.newRetainer.client_id) {
          this.newRetainer.client_id = this.clientList[0].id;
        }
      }
    });
  }

  getClientName(clientId?: number): string {
    const c = this.clientList.find(x => x.id === clientId);
    return c ? c.name : `Client #${clientId || 'N/A'}`;
  }

  getCaseName(caseId?: number): string {
    const cs = this.caseList.find(x => x.id === caseId);
    return (cs && cs.case_number) ? cs.case_number : 'General Legal';
  }

  getCountByStatus(st: string): number {
    return this.retainers.filter(r => r.status === st).length;
  }

  getStatusBadge(st: string): string {
    switch (st) {
      case 'Signed': return 'bg-success';
      case 'Sent': return 'bg-warning text-dark';
      case 'Superseded': return 'bg-secondary';
      default: return 'bg-info text-dark';
    }
  }

  openNewRetainerModal(): void {
    this.isNewModalOpen = true;
  }

  saveNewRetainer(): void {
    this.retainerService.createRetainer(this.newRetainer).subscribe({
      next: (res) => {
        if (res.success) {
          this.notify.success(res.message);
          this.isNewModalOpen = false;
          this.loadRetainers();
        }
      },
      error: (err) => {
        this.notify.error('Failed to create retainer: ' + (err.error?.message || err.message));
      }
    });
  }

  openRevisionModal(item: RetainerAgreement): void {
    this.selectedRetainer = item;
    this.revisionData = {
      title: item.title,
      fee_type: item.fee_type,
      retainer_amount: item.retainer_amount,
      hourly_rate: item.hourly_rate,
      terms_content: item.terms_content,
      redline_notes: `Revised from ${item.version}: `
    };
    this.isRevisionModalOpen = true;
  }

  saveRevision(): void {
    if (!this.selectedRetainer?.id) return;
    this.retainerService.createRevision(this.selectedRetainer.id, this.revisionData).subscribe({
      next: (res) => {
        if (res.success) {
          this.notify.success(res.message);
          this.isRevisionModalOpen = false;
          this.loadRetainers();
        }
      },
      error: (err) => {
        this.notify.error('Revision error: ' + (err.error?.message || err.message));
      }
    });
  }

  openSignModal(item: RetainerAgreement): void {
    this.selectedRetainer = item;
    this.signerName = this.getClientName(item.client_id);
    this.signerEmail = 'client@corporation.com';
    this.isSignModalOpen = true;
    this.hasDrawn = false;

    setTimeout(() => {
      this.initCanvas();
    }, 200);
  }

  closeSignModal(): void {
    this.isSignModalOpen = false;
  }

  initCanvas(): void {
    if (!this.sigCanvas) return;
    const canvas = this.sigCanvas.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.strokeStyle = '#1A365D';
      this.ctx.lineWidth = 2.5;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.clearCanvas();
    }
  }

  clearCanvas(): void {
    if (!this.ctx || !this.sigCanvas) return;
    const canvas = this.sigCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hasDrawn = false;
  }

  startDrawing(e: MouseEvent): void {
    if (!this.ctx || !this.sigCanvas) return;
    this.isDrawing = true;
    const rect = this.sigCanvas.nativeElement.getBoundingClientRect();
    this.ctx.beginPath();
    this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  draw(e: MouseEvent): void {
    if (!this.isDrawing || !this.ctx || !this.sigCanvas) return;
    const rect = this.sigCanvas.nativeElement.getBoundingClientRect();
    this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    this.ctx.stroke();
    this.hasDrawn = true;
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  startTouch(e: TouchEvent): void {
    if (!this.ctx || !this.sigCanvas || e.touches.length === 0) return;
    e.preventDefault();
    this.isDrawing = true;
    const rect = this.sigCanvas.nativeElement.getBoundingClientRect();
    const touch = e.touches[0];
    this.ctx.beginPath();
    this.ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  }

  drawTouch(e: TouchEvent): void {
    if (!this.isDrawing || !this.ctx || !this.sigCanvas || e.touches.length === 0) return;
    e.preventDefault();
    const rect = this.sigCanvas.nativeElement.getBoundingClientRect();
    const touch = e.touches[0];
    this.ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    this.ctx.stroke();
    this.hasDrawn = true;
  }

  executeSignature(): void {
    if (!this.selectedRetainer?.id || !this.sigCanvas) return;
    const canvas = this.sigCanvas.nativeElement;
    const signatureData = canvas.toDataURL('image/png');

    this.retainerService.signAgreement(this.selectedRetainer.id, {
      signature_data: signatureData,
      signer_name: this.signerName,
      signer_email: this.signerEmail
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.notify.success(res.message);
          this.closeSignModal();
          this.loadRetainers();
        }
      },
      error: (err) => {
        this.notify.error('Signing error: ' + (err.error?.message || err.message));
      }
    });
  }

  deleteRetainer(item: RetainerAgreement): void {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;
    this.retainerService.deleteRetainer(item.id!).subscribe({
      next: () => {
        this.notify.info('Retainer contract deleted');
        this.loadRetainers();
      }
    });
  }
}
