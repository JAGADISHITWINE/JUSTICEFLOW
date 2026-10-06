import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConflictService } from '../../core/services/conflict.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConflictCheckRecord } from '../../core/models/models';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppBadgeComponent } from '../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-conflicts',
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
    <div class="conflicts-page">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">Ethical Conflict of Interest Checker (BCI Rules)</h2>
          <p class="text-muted small mb-0">
            Mandatory Bar Council of India (BCI) compliance scanner pursuant to Rules 33 & 36 and Section 126 Indian Evidence Act prior to Vakalatnama execution
          </p>
        </div>
        <div class="d-flex gap-2">
          <app-button
            label="Sample Conflict Check (Test Run)"
            icon="bi-lightning-charge"
            variant="outline"
            (btnClick)="loadSampleAdverseParty()">
          </app-button>
        </div>
      </div>

      <!-- Compliance KPI Row -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">TOTAL AUDITS FILED</span>
              <span class="badge bg-light text-primary border"><i class="bi bi-shield-check"></i></span>
            </div>
            <div class="fs-4 fw-bold text-dark">{{ stats.totalChecks }}</div>
            <div class="text-muted small" style="font-size: 11px;">Certified firm audit logs</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">ETHICALLY CLEARED</span>
              <span class="badge bg-success-subtle text-success border"><i class="bi bi-check-circle-fill"></i></span>
            </div>
            <div class="fs-4 fw-bold text-success">{{ stats.cleared }}</div>
            <div class="text-muted small" style="font-size: 11px;">Zero adverse overlap detected</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">POTENTIAL CONFLICTS</span>
              <span class="badge bg-warning-subtle text-warning border"><i class="bi bi-exclamation-circle-fill"></i></span>
            </div>
            <div class="fs-4 fw-bold text-warning">{{ stats.potential }}</div>
            <div class="text-muted small" style="font-size: 11px;">Requires written waiver letter</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">DIRECT ADVERSITY</span>
              <span class="badge bg-danger-subtle text-danger border"><i class="bi bi-x-octagon-fill"></i></span>
            </div>
            <div class="fs-4 fw-bold text-danger">{{ stats.directConflict }}</div>
            <div class="text-muted small" style="font-size: 11px;">Bar prohibited representation</div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <!-- Conflict Search Scanner Form -->
        <div class="col-12 col-lg-6">
          <app-card title="Prospective Client Due Diligence Scanner">
            <form (ngSubmit)="runCheck()">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-semibold small">Prospective Client / Corporate Entity *</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    [(ngModel)]="searchForm.prospectiveClient"
                    name="prospectiveClient"
                    placeholder="e.g. QuickFreight Logistics or Apex Global"
                    required>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold small">Matter Domain / Practice Group</label>
                  <select class="form-select form-select-sm" [(ngModel)]="searchForm.matterType" name="matterType">
                    <option value="Commercial Litigation">Commercial Litigation & Breach of Contract</option>
                    <option value="Intellectual Property">Intellectual Property & Patents</option>
                    <option value="Corporate Governance">Corporate Governance & Securities</option>
                    <option value="Probate & Trusts">Probate, Estate & Trusts</option>
                    <option value="Labor & Employment">Labor & Employment Defense</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold small">Adverse Parties in Dispute</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    [(ngModel)]="searchForm.adverseParties"
                    name="adverseParties"
                    placeholder="Comma-separated adverse corporate entities, individuals...">
                  <div class="form-text">Scans against adverse parties in open litigation and closed historical files.</div>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold small">Corporate Affiliates, Subsidiaries & Directors</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    [(ngModel)]="searchForm.corporateAffiliates"
                    name="corporateAffiliates"
                    placeholder="Parent companies, holding co., sister entities...">
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold small">Opposing Counsel Registry</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    [(ngModel)]="searchForm.opposingCounsel"
                    name="opposingCounsel"
                    placeholder="e.g. Preston & Gallagher LLP">
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold small">Fact & Expert Witnesses</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    [(ngModel)]="searchForm.witnesses"
                    name="witnesses"
                    placeholder="e.g. David Miller, Richard Hayes">
                </div>
                <div class="col-12 pt-2">
                  <button
                    type="submit"
                    class="btn btn-primary btn-sm w-100 py-2 fw-semibold"
                    [disabled]="isLoading || !searchForm.prospectiveClient">
                    <i class="bi bi-search me-1"></i>
                    {{ isLoading ? 'Executing Bar Electronic Due Diligence...' : 'Run Ethical Conflict Check' }}
                  </button>
                </div>
              </div>
            </form>
          </app-card>
        </div>

        <!-- Real-Time Audit Findings & Certification Panel -->
        <div class="col-12 col-lg-6">
          <app-card title="Ethical Audit Result & Risk Determination">
            <div *ngIf="!currentResult" class="text-center py-5 text-muted">
              <i class="bi bi-shield-lock display-4 text-secondary opacity-50 mb-3 d-block"></i>
              <h6 class="fw-bold">Ready for Due Diligence Query</h6>
              <p class="small mb-0">Enter prospective client and adversary parameters to scan active dockets, adverse parties, and corporate registries.</p>
            </div>

            <div *ngIf="currentResult" class="audit-result-box">
              <!-- Banner -->
              <div class="status-banner p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between" [ngClass]="getBannerClass(currentResult.status)">
                <div>
                  <div class="fw-bold fs-6">
                    <i class="bi" [ngClass]="getBannerIcon(currentResult.status)"></i>
                    {{ getStatusHeadline(currentResult.status) }}
                  </div>
                  <div class="small mt-1 opacity-75">
                    Subject: <strong>{{ currentResult.prospective_client }}</strong> &bull; Tracking ID: {{ currentResult.audit_certificate_id || 'CERT-ETHICS' }}
                  </div>
                </div>
                <div class="risk-meter text-center px-3 py-1 bg-white rounded-3 border">
                  <div class="text-muted fw-bold" style="font-size: 10px;">RISK SCORE</div>
                  <div class="fs-5 fw-bold" [ngClass]="{'text-success': currentResult.risk_score < 30, 'text-warning': currentResult.risk_score >= 30 && currentResult.risk_score < 80, 'text-danger': currentResult.risk_score >= 80}">
                    {{ currentResult.risk_score }} / 100
                  </div>
                </div>
              </div>

              <!-- Findings Breakdown List -->
              <h6 class="fw-bold small text-uppercase text-muted mb-2">Multi-Dimensional Cross-Reference Breakdown</h6>
              <div class="findings-container mb-3" style="max-height: 220px; overflow-y: auto;">
                <div *ngFor="let f of currentResult.findings" class="p-2 mb-2 rounded border-start border-3 bg-light" [ngClass]="{'border-danger': f.severity === 'CRITICAL', 'border-warning': f.severity === 'HIGH', 'border-info': f.severity !== 'CRITICAL' && f.severity !== 'HIGH'}">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold small text-dark">[{{ f.severity }}] {{ f.title }}</span>
                    <span class="badge" [ngClass]="f.severity === 'CRITICAL' ? 'bg-danger' : (f.severity === 'HIGH' ? 'bg-warning text-dark' : 'bg-secondary')">
                      Weight: {{ f.riskWeight }}
                    </span>
                  </div>
                  <div class="text-muted small mt-1" style="font-size: 12px;">{{ f.description }}</div>
                </div>

                <div *ngIf="!currentResult.findings || currentResult.findings.length === 0" class="p-3 bg-success-subtle text-success border border-success-subtle rounded-3 small fw-semibold">
                  <i class="bi bi-check2-all me-1"></i> Full Clearance: No direct, former client, or corporate affiliate conflicts found in firm registry.
                </div>
              </div>

              <!-- Actions & Print Certificate -->
              <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                <span class="small text-muted font-monospace" style="font-size: 11px;">
                  ABA Model Rules 1.7 & 1.9 Compliant
                </span>
                <a
                  [href]="conflictService.getCertificateUrl(currentResult.id || currentResult.audit_certificate_id!)"
                  target="_blank"
                  class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-printer me-1"></i> Print Certified Audit PDF
                </a>
              </div>
            </div>
          </app-card>
        </div>
      </div>

      <!-- Historical Due Diligence Logs -->
      <app-card title="Certified Conflict Audit Archive">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Certificate ID</th>
                <th>Prospective Client / Entity</th>
                <th>Matter Area</th>
                <th>Risk Score</th>
                <th>Ethical Status</th>
                <th>Audited By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of history">
                <td class="font-monospace fw-semibold text-primary">
                  {{ item.audit_certificate_id || 'CERT-ETHICS-' + item.id }}
                </td>
                <td class="fw-semibold">{{ item.prospective_client }}</td>
                <td>{{ item.matter_type || 'Commercial Litigation' }}</td>
                <td>
                  <span class="fw-bold" [ngClass]="{'text-success': item.risk_score < 30, 'text-warning': item.risk_score >= 30 && item.risk_score < 80, 'text-danger': item.risk_score >= 80}">
                    {{ item.risk_score }} / 100
                  </span>
                </td>
                <td>
                  <span class="badge" [ngClass]="{'bg-success': item.status === 'CLEARED', 'bg-warning text-dark': item.status === 'POTENTIAL_CONFLICT', 'bg-danger': item.status === 'DIRECT_CONFLICT'}">
                    {{ item.status }}
                  </span>
                </td>
                <td>{{ item.checked_by || 'Alexander Vance, Esq.' }}</td>
                <td class="text-nowrap small text-muted">{{ item.checked_at | date:'short' }}</td>
                <td>
                  <a [href]="conflictService.getCertificateUrl(item.id!)" target="_blank" class="btn btn-xs btn-outline-secondary" title="View Audit Certificate">
                    <i class="bi bi-file-earmark-pdf"></i> Certificate
                  </a>
                </td>
              </tr>
              <tr *ngIf="history.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  No conflict check audits filed yet. Run a search above to generate certified records.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .conflicts-page {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .status-banner {
      &.banner-cleared {
        background: #EAFDF0;
        border: 1px solid #A3E9B9;
        color: #145A32;
      }
      &.banner-potential {
        background: #FEF9E7;
        border: 1px solid #FAD7A0;
        color: #7D6608;
      }
      &.banner-direct {
        background: #FADBD8;
        border: 1px solid #F5B7B1;
        color: #78281F;
      }
    }
    .btn-xs {
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      border-radius: 4px;
    }
  `]
})
export class ConflictsComponent implements OnInit {
  stats = { totalChecks: 0, cleared: 0, potential: 0, directConflict: 0 };
  history: ConflictCheckRecord[] = [];
  isLoading: boolean = false;
  currentResult: any = null;

  searchForm = {
    prospectiveClient: '',
    matterType: 'Commercial Litigation',
    adverseParties: '',
    corporateAffiliates: '',
    opposingCounsel: '',
    witnesses: ''
  };

  constructor(
    public conflictService: ConflictService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.conflictService.getConflictHistory().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.stats;
          this.history = res.data;
        }
      }
    });
  }

  loadSampleAdverseParty(): void {
    this.searchForm = {
      prospectiveClient: 'QuickFreight Multi-Modal Logistics Pvt Ltd',
      matterType: 'Commercial Suit (Comm. O.S. No. 481/2026)',
      adverseParties: 'Apex Global Logistics India Pvt Ltd',
      corporateAffiliates: 'QuickFreight Holdings India Ltd, Apex Cargo Intermodal',
      opposingCounsel: 'Advocate V.K. Murthy & Associates',
      witnesses: 'David Miller (Logistics Head), Rajesh Sharma (Port Operations)'
    };
    this.notify.info('Loaded sample adverse entity: QuickFreight Multi-Modal Logistics (Active adversary in Comm. O.S. 481/2026)');
  }

  runCheck(): void {
    if (!this.searchForm.prospectiveClient) return;

    this.isLoading = true;
    this.conflictService.runConflictCheck(this.searchForm).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.currentResult = res.data;
          this.loadHistory();
          if (res.data.status === 'DIRECT_CONFLICT') {
            this.notify.error('Direct Adverse Conflict Detected! Disqualification risk under BCI Rule 33 & Section 126 Evidence Act');
          } else if (res.data.status === 'POTENTIAL_CONFLICT') {
            this.notify.warning('Potential conflict identified. Client waiver and NOC required before onboarding.');
          } else {
            this.notify.success('Conflict Check Cleared! No adverse party or former client barriers found under BCI rules.');
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.notify.error('Conflict search failed: ' + (err.error?.message || err.message));
      }
    });
  }

  getBannerClass(status: string): string {
    if (status === 'CLEARED') return 'banner-cleared';
    if (status === 'DIRECT_CONFLICT') return 'banner-direct';
    return 'banner-potential';
  }

  getBannerIcon(status: string): string {
    if (status === 'CLEARED') return 'bi-check-circle-fill text-success';
    if (status === 'DIRECT_CONFLICT') return 'bi-exclamation-octagon-fill text-danger';
    return 'bi-exclamation-triangle-fill text-warning';
  }

  getStatusHeadline(status: string): string {
    if (status === 'CLEARED') return 'ETHICALLY CLEARED FOR ONBOARDING';
    if (status === 'DIRECT_CONFLICT') return 'DIRECT ADVERSE LITIGATION CONFLICT';
    return 'POTENTIAL CONFLICT - FORMAL WAIVER REQUIRED';
  }
}
