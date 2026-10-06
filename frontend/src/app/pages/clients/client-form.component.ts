import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../../core/models/models';
import { ClientService } from '../../core/services/client.service';
import { NotificationService } from '../../core/services/notification.service';
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
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label-custom-header small fw-semibold text-secondary mb-0">
                Primary Email Address
              </label>
              <div class="d-flex align-items-center gap-1">
                <span *ngIf="formData.is_email_verified" class="badge bg-success-subtle text-success border border-success px-2 py-1" style="font-size: 0.72rem;">
                  <i class="bi bi-patch-check-fill me-1"></i>Verified
                </span>
                <button
                  *ngIf="!formData.is_email_verified && formData.email && !otpSent"
                  type="button"
                  class="btn btn-sm btn-link p-0 text-decoration-none text-primary fw-semibold"
                  style="font-size: 0.75rem;"
                  [disabled]="otpSending"
                  (click)="sendVerificationOtp()">
                  <i class="bi bi-shield-check me-1"></i>{{ otpSending ? 'Sending OTP...' : 'Verify Email' }}
                </button>
              </div>
            </div>

            <app-form-input
              placeholder="contact@client.com"
              icon="bi-envelope"
              [(ngModel)]="formData.email"
              (ngModelChange)="onEmailChange()"
              name="email">
            </app-form-input>

            <!-- Inline Verification Box when OTP is sent -->
            <div *ngIf="otpSent && !formData.is_email_verified" class="p-3 mb-2 bg-light rounded border border-primary-subtle">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="small fw-semibold text-dark">
                  <i class="bi bi-key-fill text-primary me-1"></i>Enter 6-Digit Verification Code:
                </span>
                <span *ngIf="clientDemoOtp" class="badge bg-warning text-dark border">
                  Demo Code: <strong>{{ clientDemoOtp }}</strong>
                </span>
              </div>
              <div class="input-group input-group-sm mb-2">
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. 123456"
                  maxlength="6"
                  [(ngModel)]="clientOtp"
                  name="clientOtp">
                <button
                  class="btn btn-primary"
                  type="button"
                  [disabled]="verifyingOtp || !clientOtp"
                  (click)="verifyEmailOtp()">
                  <span *ngIf="verifyingOtp" class="spinner-border spinner-border-sm me-1"></span>
                  Confirm OTP
                </button>
              </div>
              <div *ngIf="otpError" class="text-danger small mb-1">{{ otpError }}</div>
              <div class="d-flex justify-content-between align-items-center">
                <a href="javascript:void(0)" class="small text-muted" (click)="sendVerificationOtp()">Resend Code</a>
                <a href="javascript:void(0)" class="small text-secondary" (click)="otpSent = false">Dismiss</a>
              </div>
            </div>

            <div *ngIf="emailVerificationWarning" class="text-danger small mt-1">
              <i class="bi bi-exclamation-circle me-1"></i>{{ emailVerificationWarning }}
            </div>
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
          [label]="isEditMode ? 'Update Client' : 'Retain & Save Client'"
          [loading]="saving"
          variant="primary"
          icon="bi-check-circle"
          (btnClick)="onSave()">
        </app-button>
      </div>
    </app-modal>
  `,
  styles: [`
    .form-label-custom-header {
      font-size: 0.875rem;
      font-weight: 500;
      color: #2C3E50;
    }
  `]
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
    status: 'Active',
    is_email_verified: false
  };

  statusOptions: SelectOption[] = [
    { label: 'Active Retainer', value: 'Active' },
    { label: 'Inactive / Archived', value: 'Inactive' }
  ];

  // OTP Verification State
  otpSent: boolean = false;
  otpSending: boolean = false;
  clientOtp: string = '';
  verifyingOtp: boolean = false;
  clientDemoOtp: string = '';
  otpError: string = '';
  emailVerificationWarning: string = '';

  constructor(
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client']) {
      this.resetOtpState();
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
          status: 'Active',
          is_email_verified: false
        };
      }
    }
  }

  resetOtpState() {
    this.otpSent = false;
    this.otpSending = false;
    this.clientOtp = '';
    this.verifyingOtp = false;
    this.clientDemoOtp = '';
    this.otpError = '';
    this.emailVerificationWarning = '';
  }

  onEmailChange() {
    this.formData.is_email_verified = false;
    this.otpSent = false;
    this.clientOtp = '';
    this.clientDemoOtp = '';
    this.emailVerificationWarning = '';
  }

  sendVerificationOtp() {
    if (!this.formData.email) return;
    this.otpSending = true;
    this.otpError = '';
    this.emailVerificationWarning = '';

    this.clientService.sendClientVerificationOtp(this.formData.email).subscribe({
      next: res => {
        this.otpSending = false;
        this.otpSent = true;
        if (res.otp) {
          this.clientDemoOtp = res.otp;
        }
        this.notificationService.info(`Verification code sent to ${this.formData.email}`);
      },
      error: err => {
        this.otpSending = false;
        this.otpError = err.error?.message || 'Failed to send verification code.';
      }
    });
  }

  verifyEmailOtp() {
    if (!this.clientOtp || this.clientOtp.trim().length === 0) {
      this.otpError = 'Please enter the 6-digit code.';
      return;
    }

    this.verifyingOtp = true;
    this.otpError = '';

    this.clientService.verifyClientEmail(this.formData.email!, this.clientOtp.trim()).subscribe({
      next: () => {
        this.verifyingOtp = false;
        this.formData.is_email_verified = true;
        this.otpSent = false;
        this.clientOtp = '';
        this.clientDemoOtp = '';
        this.notificationService.success('Client email verified successfully!');
      },
      error: err => {
        this.verifyingOtp = false;
        this.otpError = err.error?.message || 'Invalid or expired verification code.';
      }
    });
  }

  onSave() {
    if (!this.formData.name) return;

    // If retaining a new client with an email that is not yet verified, require or prompt verification
    if (!this.isEditMode && this.formData.email && !this.formData.is_email_verified) {
      this.emailVerificationWarning = 'Please verify the client email address before retaining.';
      if (!this.otpSent) {
        this.sendVerificationOtp();
      }
      return;
    }

    this.save.emit(this.formData);
  }

  onCancel() {
    this.cancel.emit();
  }
}
