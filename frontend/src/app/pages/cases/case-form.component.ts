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
      [title]="isEditMode ? 'Edit Case / Legal Matter' : 'Open New Legal Matter'"
      [icon]="isEditMode ? 'bi-pencil-square' : 'bi-folder-plus'"
      size="lg"
      (close)="onCancel()">

      <form (ngSubmit)="onSave()" id="caseForm">
        <div class="row g-3">
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

          <div class="col-12 col-md-4">
            <app-form-input
              label="Case / Docket Number"
              placeholder="Auto-generated if empty"
              icon="bi-hash"
              [(ngModel)]="formData.case_number"
              name="case_number">
            </app-form-input>
          </div>

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

          <div class="col-12 col-md-6">
            <app-form-select
              label="Practice Area / Case Type"
              [options]="caseTypeOptions"
              [(ngModel)]="formData.case_type"
              name="case_type">
            </app-form-select>
          </div>

          <div class="col-12 col-md-6">
            <app-form-select
              label="Matter Status"
              [options]="statusOptions"
              [(ngModel)]="formData.status"
              name="status">
            </app-form-select>
          </div>

          <div class="col-12 col-md-6">
            <app-form-input
              label="Approved Budget ($ USD)"
              type="number"
              placeholder="50000.00"
              icon="bi-currency-dollar"
              [(ngModel)]="formData.budget"
              name="budget">
            </app-form-input>
          </div>

          <div class="col-12 col-md-6">
            <app-form-input
              label="Jurisdiction / Court Name"
              placeholder="e.g. US District Court - SDNY"
              icon="bi-bank"
              [(ngModel)]="formData.court_name"
              name="court_name">
            </app-form-input>
          </div>

          <div class="col-12 col-md-6">
            <app-form-input
              label="Presiding Judge"
              placeholder="Hon. Katherine Failla"
              icon="bi-person-badge"
              [(ngModel)]="formData.judge_name"
              name="judge_name">
            </app-form-input>
          </div>

          <div class="col-12 col-md-6">
            <app-form-input
              label="Filing Date"
              type="date"
              [(ngModel)]="formData.filing_date"
              name="filing_date">
            </app-form-input>
          </div>

          <div class="col-12 col-md-6">
            <app-form-input
              label="Expected Trial / Close Date"
              type="date"
              [(ngModel)]="formData.expected_close_date"
              name="expected_close_date">
            </app-form-input>
          </div>

          <div class="col-12">
            <label class="form-label-custom mb-1 text-dark fw-medium small">Description / Case Synopsis</label>
            <textarea
              class="form-control"
              rows="3"
              placeholder="Summary of legal claims, defenses, and strategic goals..."
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

  formData: Partial<Case> = {
    case_name: '',
    case_number: '',
    client_id: 1,
    case_type: 'Commercial Litigation',
    status: 'Open',
    court_name: '',
    judge_name: '',
    filing_date: '',
    expected_close_date: '',
    budget: 25000,
    description: ''
  };

  caseTypeOptions: SelectOption[] = [
    { label: 'Commercial Litigation', value: 'Commercial Litigation' },
    { label: 'Corporate / Securities', value: 'Corporate / Securities' },
    { label: 'Intellectual Property & Patents', value: 'Intellectual Property' },
    { label: 'Estate Planning / Probate', value: 'Estate Planning / Probate' },
    { label: 'Real Estate / Land Use', value: 'Real Estate' },
    { label: 'Employment & Labor', value: 'Employment Law' }
  ];

  statusOptions: SelectOption[] = [
    { label: 'Open / In Discovery', value: 'Open' },
    { label: 'Pending / In Trial', value: 'Pending' },
    { label: 'On Hold / Stayed', value: 'On Hold' },
    { label: 'Closed / Resolved', value: 'Closed' }
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
          filing_date: this.caseItem.filing_date ? this.caseItem.filing_date.slice(0, 10) : '',
          expected_close_date: this.caseItem.expected_close_date ? this.caseItem.expected_close_date.slice(0, 10) : ''
        };
      } else {
        this.isEditMode = false;
        this.formData = {
          case_name: '',
          case_number: '',
          client_id: this.clientOptions.length ? Number(this.clientOptions[0].value) : 1,
          case_type: 'Commercial Litigation',
          status: 'Open',
          court_name: '',
          judge_name: '',
          filing_date: new Date().toISOString().slice(0, 10),
          expected_close_date: '',
          budget: 25000,
          description: ''
        };
      }
    }
  }

  onSave() {
    if (!this.formData.case_name || !this.formData.client_id) return;
    this.save.emit(this.formData);
  }

  onCancel() {
    this.cancel.emit();
  }
}
