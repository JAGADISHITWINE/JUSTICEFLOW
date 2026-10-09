import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BillingService } from '../../core/services/billing.service';
import { CaseService } from '../../core/services/case.service';
import { ClientService } from '../../core/services/client.service';
import { NotificationService } from '../../core/services/notification.service';
import { BillingSummary, Case, Client, Invoice, PaginationMeta, TrustAccount, TrustTransaction } from '../../core/models/models';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppBadgeComponent } from '../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppModalComponent } from '../../shared/components/modal/modal.component';
import { AppFormInputComponent } from '../../shared/components/form-input/form-input.component';
import { AppFormSelectComponent, SelectOption } from '../../shared/components/form-select/form-select.component';

@Component({
  selector: 'app-invoices',
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
    AppFormSelectComponent
  ],
  template: `
    <div class="invoices-page">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">Billing, Invoices & Trust Accounting</h2>
          <p class="text-muted small mb-0">Generate fee invoices, process client credit/ACH payments, and manage IOLTA trust escrow</p>
        </div>
        <div class="d-flex gap-2">
          <app-button
            label="Deposit Trust Funds"
            icon="bi-shield-check"
            variant="outline"
            (btnClick)="openDepositModal()">
          </app-button>
          <app-button
            label="Generate Invoice from Time"
            icon="bi-receipt-cutoff"
            variant="secondary"
            (btnClick)="openGenerateModal()">
          </app-button>
        </div>
      </div>

      <!-- Financial KPI Row -->
      <div class="row g-3 mb-4" *ngIf="summary">
        <div class="col-12 col-md-4">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">OUTSTANDING RECEIVABLES</span>
              <i class="bi bi-hourglass-split text-warning fs-5"></i>
            </div>
            <h3 class="mb-0 fw-bold text-dark">₹{{ formatCurrency(summary.invoices.outstanding_receivables) }}</h3>
            <span class="text-muted small">{{ summary.invoices.total_invoices }} total client fee invoices issued</span>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">TOTAL COLLECTED REVENUE</span>
              <i class="bi bi-check-circle-fill text-success fs-5"></i>
            </div>
            <h3 class="mb-0 fw-bold text-success">₹{{ formatCurrency(summary.invoices.total_collected) }}</h3>
            <span class="text-muted small">Processed via Razorpay, UPI & NEFT</span>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="stat-widget p-3 bg-white rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold">BCI RULE 24 CLIENT ESCROW HELD</span>
              <i class="bi bi-bank text-primary fs-5"></i>
            </div>
            <h3 class="mb-0 fw-bold text-primary">₹{{ formatCurrency(summary.trust.total_trust_liability) }}</h3>
            <span class="text-muted small">Mandatory segregated client retainer escrow</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs (Invoices vs IOLTA Trust) -->
      <ul class="nav nav-pills custom-nav-pills mb-3">
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'invoices'" (click)="activeTab = 'invoices'">
            <i class="bi bi-receipt me-1"></i> Client Invoices
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'trust'" (click)="activeTab = 'trust'; loadTrustAccounts()">
            <i class="bi bi-bank me-1"></i> IOLTA Trust Accounting
          </button>
        </li>
      </ul>

      <!-- TAB 1: INVOICES -->
      <div *ngIf="activeTab === 'invoices'">
        <!-- Filter Toolbar -->
        <div class="filters-card p-3 mb-4 bg-white rounded-3 border">
          <div class="row g-3 align-items-center">
            <div class="col-12 col-md-5">
              <input
                type="text"
                class="form-control"
                placeholder="Search invoice #, client, or legal matter..."
                [(ngModel)]="searchQuery"
                (keyup.enter)="loadInvoices()"
              />
            </div>

            <div class="col-6 col-md-4">
              <select class="form-select" [(ngModel)]="statusFilter" (change)="loadInvoices()">
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent / Pending Payment</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div class="col-6 col-md-3 text-end">
              <button class="btn btn-outline-secondary w-100" (click)="resetFilters()">
                <i class="bi bi-arrow-counterclockwise"></i> Reset
              </button>
            </div>
          </div>
        </div>

        <app-card [noPadding]="true">
          <div class="table-responsive">
            <table class="table table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Legal Matter</th>
                  <th>Issued</th>
                  <th>Due Date</th>
                  <th>Total Due</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let inv of paginatedInvoices">
                  <td>
                    <strong class="text-primary">{{ inv.invoice_number }}</strong>
                  </td>
                  <td>
                    <span class="fw-medium text-dark">{{ inv.client_name }}</span>
                  </td>
                  <td>
                    <a [routerLink]="['/cases', inv.case_id]" class="text-dark small">
                      {{ inv.case_name }}
                    </a>
                  </td>
                  <td><span class="small text-muted">{{ inv.issue_date }}</span></td>
                  <td><span class="small text-muted">{{ inv.due_date }}</span></td>
                  <td><strong>₹{{ formatCurrency(inv.total) }}</strong></td>
                  <td><span class="text-success">₹{{ formatCurrency(inv.amount_paid) }}</span></td>
                  <td>
                    <span class="badge" [ngClass]="getInvoiceBadgeClass(inv.status)">
                      {{ inv.status }}
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group">
                      <a [href]="getInvoicePdfUrl(inv.id!)" target="_blank" class="btn btn-sm btn-outline-primary" title="View / Print Invoice">
                        <i class="bi bi-file-earmark-pdf"></i>
                      </a>
                      <button
                        *ngIf="inv.status !== 'Paid'"
                        class="btn btn-sm btn-outline-success"
                        (click)="openPaymentModal(inv)"
                        title="Record Payment">
                        <i class="bi bi-credit-card"></i> Pay
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteInvoice(inv)" title="Delete Invoice">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="!loading && paginatedInvoices.length === 0">
                  <td colspan="9" class="text-center py-5 text-muted">
                    No invoices found. Generate an invoice from unbilled time slips above.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination with Per-Page Dropdown -->
          <div *ngIf="invoices.length > 0" class="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 border-top bg-light">
            <div class="d-flex align-items-center gap-3">
              <small class="text-muted">
                Showing <strong>{{ ((pagination.page - 1) * pagination.limit) + 1 }}</strong> - 
                <strong>{{ getShowingEndCount() }}</strong> of 
                <strong>{{ invoices.length }}</strong> invoices
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
      </div>

      <!-- TAB 2: BCI RULE 24 CLIENT TRUST ESCROW -->
      <div *ngIf="activeTab === 'trust'">
        <div class="alert alert-info d-flex align-items-center mb-4">
          <i class="bi bi-shield-check fs-4 me-3 text-primary"></i>
          <div class="small">
            <strong>Bar Council of India Rule 24 Escrow Compliance:</strong> Client retainer funds must be kept strictly segregated from firm capital. Disburse earned fees only upon issuing certified professional fee bills.
          </div>
        </div>

        <app-card title="Client Trust Escrow Balances" icon="bi-bank">
          <div class="table-responsive">
            <table class="table table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Trust Account Number</th>
                  <th>Total Deposited</th>
                  <th>Earned Disbursements</th>
                  <th>Current Trust Balance</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let acc of trustAccounts">
                  <td>
                    <strong class="text-dark">{{ acc.client_name }}</strong>
                    <div class="small text-muted">{{ acc.client_email }}</div>
                  </td>
                  <td><code>{{ acc.account_number }}</code></td>
                  <td>₹{{ formatCurrency(acc.total_deposited || acc.balance) }}</td>
                  <td>₹{{ formatCurrency(acc.total_disbursed || 0) }}</td>
                  <td>
                    <h5 class="mb-0 fw-bold text-success">₹{{ formatCurrency(acc.balance) }}</h5>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary me-2" (click)="viewLedger(acc)">
                      <i class="bi bi-journal-text me-1"></i> View Ledger
                    </button>
                    <button class="btn btn-sm btn-outline-primary" (click)="openDisburseModal(acc)">
                      <i class="bi bi-arrow-up-right me-1"></i> Disburse Fee
                    </button>
                  </td>
                </tr>

                <tr *ngIf="trustAccounts.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">No trust accounts set up yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </app-card>
      </div>

      <!-- Generate from Time Modal -->
      <app-modal
        [isOpen]="isGenerateModalOpen"
        title="Generate Invoice from Unbilled Time Slips"
        icon="bi-receipt-cutoff"
        (close)="isGenerateModalOpen = false">
        <form (ngSubmit)="generateInvoice()">
          <app-form-select
            label="Select Legal Matter with Unbilled Hours"
            [options]="caseOptions"
            placeholder="Choose Matter..."
            [required]="true"
            [(ngModel)]="generateCaseId"
            name="generateCaseId">
          </app-form-select>

          <app-form-input
            label="Payment Due Date"
            type="date"
            [(ngModel)]="generateDueDate"
            name="generateDueDate">
          </app-form-input>

          <div class="mb-3">
            <label class="form-label small text-dark fw-medium">Invoice Notes & Instructions</label>
            <textarea
              class="form-control"
              rows="3"
              placeholder="e.g. Invoiced for legal services rendered. Net 30 days."
              [(ngModel)]="generateNotes"
              name="generateNotes">
            </textarea>
          </div>
        </form>

        <div modal-footer>
          <button class="btn btn-outline-secondary" (click)="isGenerateModalOpen = false">Cancel</button>
          <app-button
            label="Generate Invoice"
            [loading]="generating"
            variant="primary"
            (btnClick)="generateInvoice()">
          </app-button>
        </div>
      </app-modal>

      <!-- Record Payment Modal -->
      <app-modal
        [isOpen]="isPaymentModalOpen"
        title="Process LawPay / Credit Card Payment"
        icon="bi-credit-card"
        size="sm"
        (close)="isPaymentModalOpen = false">
        <form (ngSubmit)="submitPayment()">
          <div class="mb-3">
            <label class="form-label small text-muted">Invoice</label>
            <div class="fw-bold text-dark">{{ selectedInvoice?.invoice_number }}</div>
            <div class="text-muted small">Total: ₹{{ formatCurrency(selectedInvoice?.total) }}</div>
          </div>

          <app-form-input
            label="Payment Amount ($)"
            type="number"
            placeholder="1000.00"
            [required]="true"
            [(ngModel)]="paymentAmount"
            name="paymentAmount">
          </app-form-input>

          <div class="mb-3">
            <label class="form-label small text-dark fw-medium">Payment Gateway Method</label>
            <select class="form-select" [(ngModel)]="paymentMethod" name="paymentMethod">
              <option value="LawPay / Credit Card">LawPay / Credit Card</option>
              <option value="Stripe ACH Bank Wire">Stripe ACH Bank Wire</option>
              <option value="Trust Account Retainer Transfer">Trust Account Retainer Transfer</option>
            </select>
          </div>
        </form>

        <div modal-footer>
          <button class="btn btn-outline-secondary" (click)="isPaymentModalOpen = false">Cancel</button>
          <app-button
            label="Confirm Payment"
            [loading]="paying"
            variant="accent"
            (btnClick)="submitPayment()">
          </app-button>
        </div>
      </app-modal>

      <!-- Trust Deposit Modal -->
      <app-modal
        [isOpen]="isDepositModalOpen"
        title="Deposit Client Retainer to IOLTA Trust"
        icon="bi-shield-check"
        (close)="isDepositModalOpen = false">
        <form (ngSubmit)="submitTrustDeposit()">
          <app-form-select
            label="Client"
            [options]="clientOptions"
            placeholder="Select Client..."
            [required]="true"
            [(ngModel)]="trustClientId"
            name="trustClientId">
          </app-form-select>

          <app-form-input
            label="Deposit Amount ($)"
            type="number"
            placeholder="10000.00"
            [required]="true"
            [(ngModel)]="trustAmount"
            name="trustAmount">
          </app-form-input>

          <app-form-input
            label="Reference / Check # / Wire ID"
            placeholder="WIRE-109281"
            [(ngModel)]="trustRef"
            name="trustRef">
          </app-form-input>

          <div class="mb-3">
            <label class="form-label small text-dark fw-medium">Deposit Description</label>
            <input
              type="text"
              class="form-control"
              placeholder="e.g. Retainer deposit for federal trial representation"
              [(ngModel)]="trustDesc"
              name="trustDesc"
            />
          </div>
        </form>

        <div modal-footer>
          <button class="btn btn-outline-secondary" (click)="isDepositModalOpen = false">Cancel</button>
          <app-button
            label="Record Trust Deposit"
            [loading]="savingTrust"
            variant="primary"
            (btnClick)="submitTrustDeposit()">
          </app-button>
        </div>
      </app-modal>

      <!-- Trust Ledger Modal -->
      <app-modal
        [isOpen]="isLedgerModalOpen"
        [title]="'IOLTA Ledger: ' + (activeTrustAccount?.client_name || '')"
        icon="bi-journal-text"
        size="lg"
        (close)="isLedgerModalOpen = false">
        <div class="mb-3 d-flex justify-content-between align-items-center">
          <div>
            <strong>Account:</strong> <code>{{ activeTrustAccount?.account_number }}</code>
          </div>
          <div>
            <strong>Current Escrow Balance:</strong>
            <span class="text-success fw-bold ms-2 fs-5">₹{{ formatCurrency(activeTrustAccount?.balance) }}</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-custom align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Description</th>
                <th class="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tx of ledgerTransactions">
                <td>{{ tx.transaction_date }}</td>
                <td>
                  <span class="badge" [ngClass]="tx.type === 'Deposit' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    {{ tx.type }}
                  </span>
                </td>
                <td><small>{{ tx.reference_number || 'N/A' }}</small></td>
                <td>{{ tx.description }}</td>
                <td class="text-end fw-bold" [ngClass]="tx.type === 'Deposit' ? 'text-success' : 'text-danger'">
                  {{ tx.type === 'Deposit' ? '+' : '-' }}₹{{ formatCurrency(tx.amount) }}
                </td>
              </tr>
              <tr *ngIf="ledgerTransactions.length === 0">
                <td colspan="5" class="text-center py-3 text-muted">No transactions on this trust account.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div modal-footer>
          <button class="btn btn-secondary" (click)="isLedgerModalOpen = false">Close Ledger</button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .invoices-page {
      .page-title {
        font-size: 1.65rem;
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
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  trustAccounts: TrustAccount[] = [];
  summary: BillingSummary | null = null;
  loading: boolean = false;
  activeTab: 'invoices' | 'trust' = 'invoices';

  searchQuery: string = '';
  statusFilter: string = 'All';

  // Generate Modal
  isGenerateModalOpen: boolean = false;
  generating: boolean = false;
  generateCaseId: number = 0;
  generateDueDate: string = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  generateNotes: string = '';
  caseOptions: SelectOption[] = [];

  // Payment Modal
  isPaymentModalOpen: boolean = false;
  selectedInvoice: Invoice | null = null;
  paymentAmount: number = 0;
  paymentMethod: string = 'LawPay / Credit Card';
  paying: boolean = false;

  // Trust Deposit Modal
  isDepositModalOpen: boolean = false;
  savingTrust: boolean = false;
  trustClientId: number = 0;
  trustAmount: number = 5000;
  trustRef: string = '';
  trustDesc: string = 'Retainer escrow deposit';
  clientOptions: SelectOption[] = [];

  // Ledger Modal
  isLedgerModalOpen: boolean = false;
  activeTrustAccount: TrustAccount | null = null;
  ledgerTransactions: TrustTransaction[] = [];

  pagination = {
    page: 1,
    limit: 5
  };

  constructor(
    private billingService: BillingService,
    private caseService: CaseService,
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadInvoices();
    this.loadCasesList();
    this.loadClientsList();
  }

  get paginatedInvoices(): Invoice[] {
    const startIndex = (this.pagination.page - 1) * this.pagination.limit;
    return this.invoices.slice(startIndex, startIndex + this.pagination.limit);
  }

  get totalPages(): number {
    return Math.ceil(this.invoices.length / this.pagination.limit) || 1;
  }

  changePage(page: number): void {
    this.pagination.page = page;
  }

  onPageSizeChange(): void {
    this.pagination.page = 1;
  }

  getShowingEndCount(): number {
    return Math.min(this.pagination.page * this.pagination.limit, this.invoices.length);
  }

  loadSummary() {
    this.billingService.getSummary().subscribe({
      next: res => this.summary = res.data
    });
  }

  loadInvoices() {
    this.loading = true;
    this.billingService
      .getInvoices({ search: this.searchQuery, status: this.statusFilter })
      .subscribe({
        next: res => {
          this.invoices = res.data;
          this.pagination.page = 1;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  loadTrustAccounts() {
    this.billingService.getTrustAccounts().subscribe({
      next: res => this.trustAccounts = res.data
    });
  }

  loadCasesList() {
    this.caseService.getCases({ limit: 100 }).subscribe({
      next: res => {
        this.caseOptions = res.data.map(c => ({
          label: `${c.case_name} (${c.case_number})`,
          value: c.id
        }));
        if (!this.generateCaseId && this.caseOptions.length > 0) {
          this.generateCaseId = Number(this.caseOptions[0].value);
        }
      }
    });
  }

  loadClientsList() {
    this.clientService.getClients({ limit: 100 }).subscribe({
      next: res => {
        this.clientOptions = res.data.map(cl => ({
          label: cl.name,
          value: cl.id
        }));
        if (!this.trustClientId && this.clientOptions.length > 0) {
          this.trustClientId = Number(this.clientOptions[0].value);
        }
      }
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.loadInvoices();
  }

  openGenerateModal() {
    this.isGenerateModalOpen = true;
  }

  generateInvoice() {
    if (!this.generateCaseId) {
      this.notificationService.warning('Please select a legal matter.');
      return;
    }

    this.generating = true;
    this.billingService.generateFromUnbilledTime({
      case_id: this.generateCaseId,
      due_date: this.generateDueDate,
      notes: this.generateNotes
    }).subscribe({
      next: res => {
        this.generating = false;
        this.isGenerateModalOpen = false;
        this.notificationService.success(res.message);
        this.loadInvoices();
        this.loadSummary();
      },
      error: err => {
        this.generating = false;
        this.notificationService.error(err.message || 'No unbilled time slips found.');
      }
    });
  }

  openPaymentModal(inv: Invoice) {
    this.selectedInvoice = inv;
    this.paymentAmount = (Number(inv.total) - Number(inv.amount_paid || 0));
    this.isPaymentModalOpen = true;
  }

  submitPayment() {
    if (!this.selectedInvoice || !this.paymentAmount) return;
    this.paying = true;
    this.billingService.recordPayment(this.selectedInvoice.id!, {
      amount: this.paymentAmount,
      payment_method: this.paymentMethod
    }).subscribe({
      next: () => {
        this.paying = false;
        this.isPaymentModalOpen = false;
        this.notificationService.success('Payment recorded successfully.');
        this.loadInvoices();
        this.loadSummary();
      },
      error: err => {
        this.paying = false;
        this.notificationService.error(err.message || 'Payment processing failed.');
      }
    });
  }

  openDepositModal() {
    this.isDepositModalOpen = true;
  }

  submitTrustDeposit() {
    if (!this.trustClientId || !this.trustAmount) return;
    this.savingTrust = true;
    this.billingService.recordTrustTransaction({
      client_id: this.trustClientId,
      type: 'Deposit',
      amount: this.trustAmount,
      description: this.trustDesc,
      reference_number: this.trustRef
    }).subscribe({
      next: () => {
        this.savingTrust = false;
        this.isDepositModalOpen = false;
        this.notificationService.success('Trust deposit recorded in IOLTA ledger.');
        this.loadTrustAccounts();
        this.loadSummary();
      },
      error: err => {
        this.savingTrust = false;
        this.notificationService.error(err.message || 'Trust deposit failed.');
      }
    });
  }

  viewLedger(acc: TrustAccount) {
    this.activeTrustAccount = acc;
    this.billingService.getTrustTransactions(acc.id).subscribe({
      next: res => {
        this.ledgerTransactions = res.data;
        this.isLedgerModalOpen = true;
      }
    });
  }

  openDisburseModal(acc: TrustAccount) {
    const amountStr = prompt(`Disburse earned fee from ${acc.client_name}'s trust account (Current Balance: ₹${acc.balance}):`, '1000');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0 || amount > acc.balance) {
      alert('Invalid disbursement amount.');
      return;
    }

    this.billingService.recordTrustTransaction({
      trust_account_id: acc.id,
      type: 'Disbursement',
      amount: amount,
      description: 'Earned fee transfer to operating account for legal services rendered',
      reference_number: `FEE-DISB-${Date.now().toString().slice(-4)}`
    }).subscribe({
      next: () => {
        this.notificationService.success('Disbursement recorded.');
        this.loadTrustAccounts();
        this.loadSummary();
      }
    });
  }

  deleteInvoice(inv: Invoice) {
    if (!confirm(`Delete Invoice ${inv.invoice_number}?`)) return;
    this.billingService.deleteInvoice(inv.id!).subscribe({
      next: () => {
        this.notificationService.success('Invoice deleted.');
        this.loadInvoices();
        this.loadSummary();
      }
    });
  }

  getInvoicePdfUrl(id: number): string {
    return this.billingService.getInvoicePdfUrl(id);
  }

  getInvoiceBadgeClass(status: string): string {
    switch (status) {
      case 'Paid': return 'bg-success-subtle text-success border border-success-subtle';
      case 'Sent': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'Overdue': return 'bg-danger-subtle text-danger border border-danger-subtle';
      default: return 'bg-secondary-subtle text-secondary border';
    }
  }

  formatCurrency(val: any): string {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
