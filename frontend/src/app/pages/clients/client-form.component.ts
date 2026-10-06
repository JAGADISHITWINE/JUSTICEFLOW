import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../../core/models/models';
import { AppModalComponent } from '../../shared/components/modal/modal.component';
import { AppFormInputComponent } from '../../shared/components/form-input/form-input.component';
import { AppFormSelectComponent, SelectOption } from '../../shared/components/form-select/form-select.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AppModalComponent, AppFormInputComponent, AppFormSelectComponent, AppButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="isEditMode ? 'Edit Client Profile' : 'Retain New Client'"
      [icon]="isEditMode ? 'bi-pencil-square' : 'bi-person-plus-fill'"
      size="lg"
      (close)="onCancel()">

      <form (ngSubmit)="onSave()" id="clientForm">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <app-form-input
              label="Client Name / Corporation"
              placeholder="e.g. Apex Global Logistics LLC"
              icon="bi-building"
              [required]="true"
              [(ngModel)]="formData.name"
              name="name">
            </app-form-input>
          </div>

          <div class="col-12 col-md-6">
            <app-form-input
              label="Primary Email"
              type="email"
              placeholder="contact@client.com"
              icon="bi-envelope"
              [(ngModel)]="formData.email"
              name="email">
            </app-form-input>
          </div>

          <div class="col-12 col-md-6">
            <app-form-input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              icon="bi-telephone"
              [(ngModel)]="formData.phone"
              name="phone">
            </app-form-input>
          </div>

          <div class="col-12 col-md-6">
            <app-form-select
              label="Account Status"
              [options]="statusOptions"
              [(ngModel)]="formData.status"
              name="status">
            </app-form-select>
          </div>

          <div class="col-12">
            <app-form-input
              label="Street Address"
              placeholder="Suite, Street Number"
              icon="bi-geo-alt"
              [(ngModel)]="formData.address"
              name="address">
            </app-form-input>
          </div>

          <div class="col-12 col-md-4">
            <app-form-input
              label="City"
              placeholder="New York"
              [(ngModel)]="formData.city"
              name="city">
            </app-form-input>
          </div>

          <div class="col-12 col-md-4">
            <app-form-input
              label="State / Province"
              placeholder="NY"
              [(ngModel)]="formData.state"
              name="state">
            </app-form-input>
          </div>

          <div class="col-12 col-md-4">
            <app-form-input
              label="Postal Code"
              placeholder="10001"
              [(ngModel)]="formData.zip_code"
              name="zip_code">
            </app-form-input>
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
          [label]="isEditMode ? 'Update Client' : 'Create Client'"
          [loading]="saving"
          variant="primary"
          icon="bi-check-circle"
          (btnClick)="onSave()">
        </app-button>
      </div>
    </app-modal>
  `
})
export class ClientFormComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() client: Client | null = null;
  @Input() saving: boolean = false;
  @Output() save = new EventEmitter<Partial<Client>>();
  @Output() cancel = new EventEmitter<void>();

  isEditMode: boolean = false;

  formData: Partial<Client> = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    status: 'Active'
  };

  statusOptions: SelectOption[] = [
    { label: 'Active Retainer', value: 'Active' },
    { label: 'Inactive / Archived', value: 'Inactive' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client']) {
      if (this.client && this.client.id) {
        this.isEditMode = true;
        this.formData = { ...this.client };
      } else {
        this.isEditMode = false;
        this.formData = {
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zip_code: '',
          status: 'Active'
        };
      }
    }
  }

  onSave() {
    if (!this.formData.name) return;
    this.save.emit(this.formData);
  }

  onCancel() {
    this.cancel.emit();
  }
}
