import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Case, Client } from '../../core/models/models';
import { ClientService } from '../../core/services/client.service';
import { AppModalComponent } from '../../shared/components/modal/modal.component';
import { AppFormInputComponent } from '../../shared/components/form-input/form-input.component';
import { AppFormSelectComponent, SelectOption } from '../../shared/components/form-select/form-select.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AppModalComponent, AppFormInputComponent, AppFormSelectComponent, AppButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="isEditMode ? 'Edit Case / Docket' : 'Open New Legal Matter'"
      [icon]="isEditMode ? 'bi-pencil-square' : 'bi-folder-plus'"
      size="lg"
      (close)="onCancel()">

      <form (ngSubmit)="onSave()" id="caseForm">
        <div class="row g-3">
          <!-- Matter Title -->
          <div class="col-12 col-md-8">
            <app-form-input
              label="Case / Matter Title"
              placeholder="e.g. Acme Corp v. Pinnacle Logistics Breach of Contract"
              icon="bi-briefcase"
              [required]="true"
              [(ngModel)]="formData.case_name"
              name="case_name">
            </app-form-input>
          </div>

          <!-- Docket / Case Number -->
          <div class="col-12 col-md-4">
            <app-form-input
              label="Internal Docket Number"
              placeholder="Auto-generated if empty"
              icon="bi-hash"
              [(ngModel)]="formData.case_number"
              name="case_number">
            </app-form-input>
          </div>

          <!-- Official 16-Digit CNR Number -->
          <div class="col-12 col-md-6">
            <div class="form-group mb-1">
              <label class="form-label d-flex justify-content-between align-items-center small fw-semibold text-dark">
                <span><i class="bi bi-upc-scan text-primary me-1"></i> Official CNR Number (e-Courts)</span>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 0.65rem;">
                  <i class="bi bi-arrow-repeat me-1"></i>Live Sync Enabled
                </span>
              </label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control font-monospace"
                  placeholder="e.g. DLHC010045232024"
                  maxlength="20"
                  [(ngModel)]="formData.cnr_number"
                  name="cnr_number"
                  style="text-transform: uppercase; letter-spacing: 1px;" />
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm" 
                  title="Generate sample CNR format"
                  (click)="generateSampleCNR()">
                  <i class="bi bi-magic"></i>
                </button>
              </div>
              <small class="text-muted" style="font-size: 0.72rem;">
                Enter 16-character Case Number Record for automatic daily cause list & hearing sync.
              </small>
            </div>
          </div>

          <!-- Court Category / Forum -->
          <div class="col-12 col-md-6">
            <app-form-select
              label="Judicial Forum / Court Category"
              [options]="courtForumOptions"
              [required]="true"
              [(ngModel)]="formData.court_forum"
              (ngModelChange)="onCourtForumChange($event)"
              name="court_forum">
            </app-form-select>
          </div>

          <!-- Custom Court Forum Text Box (If Custom Forum selected) -->
          <div class="col-12" *ngIf="formData.court_forum === 'Custom Forum'">
            <app-form-input
              label="Specify Custom Judicial Forum / Specialized Tribunal"
              placeholder="e.g. Armed Forces Tribunal, RERA Appellate, National Green Tribunal (NGT)"
              icon="bi-building-gear"
              [required]="true"
              [(ngModel)]="customForumName"
              (ngModelChange)="onCustomForumNameChange($event)"
              name="custom_forum_name">
            </app-form-input>
          </div>

          <!-- Criminal Court Specific Fields (FIR & Police Station) -->
          <div class="col-12 col-md-6" *ngIf="formData.court_forum === 'Criminal Court'">
            <app-form-input
              label="FIR / Crime Number"
              placeholder="e.g. FIR No. 142/2024"
              icon="bi-shield-shaded"
              [(ngModel)]="formData.fir_number"
              name="fir_number">
            </app-form-input>
          </div>

          <div class="col-12 col-md-6" *ngIf="formData.court_forum === 'Criminal Court'">
            <app-form-input
              label="Jurisdiction Police Station"
              placeholder="e.g. Connaught Place Police Station, New Delhi"
              icon="bi-geo-alt"
              [(ngModel)]="formData.police_station"
              name="police_station">
            </app-form-input>
          </div>

          <!-- Retained Client -->
          <div class="col-12 col-md-6">
            <app-form-select
              label="Retained Client"
              [options]="clientOptions"
              placeholder="Select Client..."
              [required]="true"
              [(ngModel)]="formData.client_id"
              name="client_id">
            </app-form-select>
          </div>

          <!-- Practice Area / Case Type -->
          <div class="col-12 col-md-6">
            <app-form-select
              label="Practice Area / Sub-Type"
              [options]="caseTypeOptions"
              [(ngModel)]="formData.case_type"
              name="case_type">
            </app-form-select>
          </div>

          <!-- Matter Status -->
          <div class="col-12 col-md-6">
            <app-form-select
              label="Matter Status"
              [options]="statusOptions"
              [(ngModel)]="formData.status"
              name="status">
            </app-form-select>
          </div>

          <!-- Approved Retainer / Budget -->
          <div class="col-12 col-md-6">
            <app-form-input
              label="Approved Budget / Fee (₹ INR)"
              type="number"
              placeholder="150000.00"
              icon="bi-currency-rupee"
              [(ngModel)]="formData.budget"
              name="budget">
            </app-form-input>
          </div>

          <!-- Court Name / Hall -->
          <div class="col-12 col-md-6">
            <app-form-input
              label="Court Complex & Bench / Room"
              placeholder="e.g. Delhi High Court - Court Room 14"
              icon="bi-bank"
              [(ngModel)]="formData.court_name"
              name="court_name">
            </app-form-input>
          </div>

          <!-- Presiding Judge -->
          <div class="col-12 col-md-6">
            <app-form-input
              label="Presiding Judge / Magistrate"
              placeholder="e.g. Hon. Justice S. Muralidhar"
              icon="bi-person-badge"
              [(ngModel)]="formData.judge_name"
              name="judge_name">
            </app-form-input>
          </div>

          <!-- Filing Date -->
          <div class="col-12 col-md-6">
            <app-form-input
              label="Filing Date / Institution Date"
              type="date"
              [(ngModel)]="formData.filing_date"
              name="filing_date">
            </app-form-input>
          </div>

          <!-- Expected Hearing / Close Date -->
          <div class="col-12 col-md-6">
            <app-form-input
              label="Next Hearing / Expected Disposal Date"
              type="date"
              [(ngModel)]="formData.expected_close_date"
              name="expected_close_date">
            </app-form-input>
          </div>

          <!-- Description -->
          <div class="col-12">
            <label class="form-label-custom mb-1 text-dark fw-medium small">Description / Case Synopsis & Prayer</label>
            <textarea
              class="form-control"
              rows="3"
              placeholder="Summary of claims, interim prayers, statutory citations, and strategic notes..."
              [(ngModel)]="formData.description"
              name="description">
            </textarea>
          </div>
        </div>
      </form>

      <div modal-footer>
        <app-button
          label="Cancel"
          variant="outline"
          (btnClick)="onCancel()">
        </app-button>
        <app-button
          [label]="isEditMode ? 'Update Matter' : 'Open Matter'"
          [loading]="saving"
          variant="primary"
          icon="bi-check-circle"
          (btnClick)="onSave()">
        </app-button>
      </div>
    </app-modal>
  `
})
export class CaseFormComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() caseItem: Case | null = null;
  @Input() saving: boolean = false;
  @Output() save = new EventEmitter<Partial<Case>>();
  @Output() cancel = new EventEmitter<void>();

  isEditMode: boolean = false;
  clientOptions: SelectOption[] = [];
  customForumName: string = '';

  formData: Partial<Case> = {
    case_name: '',
    case_number: '',
    cnr_number: '',
    client_id: 1,
    court_forum: 'Commercial Court',
    case_type: 'Commercial Litigation',
    fir_number: '',
    police_station: '',
    status: 'Open',
    court_name: '',
    judge_name: '',
    filing_date: '',
    expected_close_date: '',
    budget: 150000,
    description: ''
  };

  courtForumOptions: SelectOption[] = [
    { label: '🏛️ High Court / Constitutional (Writ / Appeal)', value: 'High Court' },
    { label: '🔴 Criminal Court (Sessions / CJM / Bail / Trial)', value: 'Criminal Court' },
    { label: '💜 Family Court (Matrimonial / Custody / Sec 125)', value: 'Family Court' },
    { label: '🟢 Civil & Commercial Court (Specific Relief / Money Suit)', value: 'Commercial Court' },
    { label: '🟠 NCLT / IBC / Company Law Tribunal', value: 'NCLT Tribunal' },
    { label: '⚖️ Consumer Disputes Forum (DCDRC / State Commission)', value: 'Consumer Forum' },
    { label: '🛡️ DRT / Debt Recovery Tribunal', value: 'DRT Tribunal' },
    { label: '🏢 Labour & Industrial Tribunal', value: 'Labour Court' },
    { label: '👑 Supreme Court of India', value: 'Supreme Court' },
    { label: '✍️ Custom / Other Specialized Judicial Forum', value: 'Custom Forum' }
  ];

  caseTypeOptions: SelectOption[] = [
    { label: 'Commercial Litigation & Contracts', value: 'Commercial Litigation' },
    { label: 'Criminal Defense & Bail Proceedings', value: 'Criminal Defense' },
    { label: 'Matrimonial & Family Dispute', value: 'Matrimonial' },
    { label: 'Writ Petition (Civil / Criminal)', value: 'Writ Petition' },
    { label: 'Insolvency & Corporate Resolution (IBC)', value: 'Insolvency / IBC' },
    { label: 'Intellectual Property, Trademarks & Patents', value: 'Intellectual Property' },
    { label: 'Real Estate, RERA & Land Acquisition', value: 'Real Estate / RERA' },
    { label: 'Arbitration & Section 34 / 37 Appeals', value: 'Arbitration' },
    { label: 'Banking & Securitisation (SARFAESI / DRT)', value: 'Banking / SARFAESI' },
    { label: 'Taxation (GST / Direct Tax Appeals)', value: 'Taxation' }
  ];

  statusOptions: SelectOption[] = [
    { label: 'Open / In Active Proceedings', value: 'Open' },
    { label: 'Pending / Arguments Stage', value: 'Pending' },
    { label: 'On Hold / Stayed by Appellate Court', value: 'On Hold' },
    { label: 'Closed / Final Order & Disposed', value: 'Closed' }
  ];

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClientsList();
  }

  loadClientsList() {
    this.clientService.getClients({ limit: 100 }).subscribe({
      next: res => {
        this.clientOptions = res.data.map(c => ({
          label: c.name,
          value: c.id
        }));
        if (!this.formData.client_id && this.clientOptions.length > 0) {
          this.formData.client_id = Number(this.clientOptions[0].value);
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['caseItem']) {
      if (this.caseItem && this.caseItem.id) {
        this.isEditMode = true;
        this.formData = {
          ...this.caseItem,
          court_forum: this.caseItem.court_forum || 'Commercial Court',
          filing_date: this.caseItem.filing_date ? this.caseItem.filing_date.slice(0, 10) : '',
          expected_close_date: this.caseItem.expected_close_date ? this.caseItem.expected_close_date.slice(0, 10) : ''
        };
        const standardForums = this.courtForumOptions.map(o => o.value);
        if (!standardForums.includes(this.formData.court_forum)) {
          this.customForumName = this.formData.court_forum || '';
          this.formData.court_forum = 'Custom Forum';
        }
      } else {
        this.isEditMode = false;
        this.customForumName = '';
        this.formData = {
          case_name: '',
          case_number: '',
          cnr_number: '',
          client_id: this.clientOptions.length ? Number(this.clientOptions[0].value) : 1,
          court_forum: 'Commercial Court',
          case_type: 'Commercial Litigation',
          fir_number: '',
          police_station: '',
          status: 'Open',
          court_name: '',
          judge_name: '',
          filing_date: new Date().toISOString().slice(0, 10),
          expected_close_date: '',
          budget: 150000,
          description: ''
        };
      }
    }
  }

  onCourtForumChange(forum: string) {
    if (forum !== 'Custom Forum') {
      this.customForumName = '';
    }
  }

  onCustomForumNameChange(val: string) {
    this.customForumName = val;
  }

  generateSampleCNR() {
    const states = ['DL', 'MH', 'KA', 'TN', 'WB'];
    const randomState = states[Math.floor(Math.random() * states.length)];
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    this.formData.cnr_number = `${randomState}HC0100${randomDigits}2026`;
  }

  onSave() {
    if (!this.formData.case_name || !this.formData.client_id) return;
    
    // Process custom forum name if selected
    const payload = { ...this.formData };
    if (payload.court_forum === 'Custom Forum' && this.customForumName.trim()) {
      payload.court_forum = this.customForumName.trim();
    }

    this.save.emit(payload);
  }

  onCancel() {
    this.cancel.emit();
  }
}

