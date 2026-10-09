import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppFormInputComponent } from '../../shared/components/form-input/form-input.component';
import { AppAlertComponent } from '../../shared/components/alert/alert.component';
import { AppModalComponent } from '../../shared/components/modal/modal.component';
import { AppThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, AppButtonComponent, AppFormInputComponent, AppAlertComponent, AppModalComponent, AppThemeToggleComponent],
  template: `
    <div class="login-page-container">
      <!-- Floating Day / Night Toggle on Login Screen -->
      <div class="login-theme-corner">
        <app-theme-toggle variant="segmented" [compact]="true"></app-theme-toggle>
      </div>

      <div class="login-card-box">
        <!-- Logo & Branding -->
        <div class="text-center mb-4">
          <div class="brand-logo-container mb-2">
            <img
              src="assets/logo-full.png"
              alt="JusticeFlow"
              class="brand-logo-img"
              onerror="this.onerror=null; this.src='assets/Justiceflow.jpg';"
            />
          </div>
          <p class="brand-subtitle">Indian Legal Practice & Case Management OS</p>
        </div>

        <!-- Mode Toggle (Login / Register) -->
        <div class="mode-tabs mb-4">
          <button
            type="button"
            class="tab-btn"
            [class.active]="isLoginMode"
            (click)="setMode(true)">
            Sign In
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="!isLoginMode"
            (click)="setMode(false)">
            Create Account
          </button>
        </div>

        <!-- Active Session Conflict Box with Terminate Action -->
        <div *ngIf="isConcurrentBlocked" class="session-conflict-box mb-3 p-3 bg-danger-subtle border border-danger-subtle rounded-3 text-start shadow-sm">
          <div class="d-flex align-items-center gap-2 mb-2 text-danger fw-bold">
            <i class="bi bi-shield-lock-fill fs-5"></i>
            <span>Active Session Detected</span>
          </div>
          <p class="small text-danger mb-3">
            {{ errorMessage }}
          </p>
          <div class="d-flex flex-column gap-2">
            <button
              type="button"
              class="btn btn-danger btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 py-2"
              [disabled]="loading"
              (click)="onForceLogin()">
              <i class="bi bi-box-arrow-in-right"></i>
              <span>Terminate Previous Session & Sign In</span>
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm w-100"
              (click)="isConcurrentBlocked = false">
              Cancel
            </button>
          </div>
        </div>

        <app-alert
          *ngIf="errorMessage && !isConcurrentBlocked"
          type="error"
          [message]="errorMessage"
          (dismiss)="errorMessage = ''">
        </app-alert>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()">
          <app-form-input
            *ngIf="!isLoginMode"
            label="Full Name & Title"
            placeholder="e.g. Attorney Eleanor Ross, Esq."
            icon="bi-person"
            [required]="true"
            [(ngModel)]="name"
            name="name">
          </app-form-input>

          <app-form-input
            label="Email Address"
            type="email"
            placeholder="lawyer@justiceflow.com"
            icon="bi-envelope"
            [required]="true"
            [(ngModel)]="email"
            name="email">
          </app-form-input>

          <app-form-input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon="bi-lock"
            [required]="true"
            [(ngModel)]="password"
            name="password">
          </app-form-input>

          <div *ngIf="isLoginMode" class="d-flex justify-content-between align-items-center mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="rememberMe" [(ngModel)]="rememberMe" name="rememberMe">
              <label class="form-check-label text-muted small" for="rememberMe">Remember me</label>
            </div>
            <a href="javascript:void(0)" class="small text-secondary fw-semibold text-decoration-none" (click)="openForgotPassword()">Forgot password?</a>
          </div>

          <app-button
            [label]="isLoginMode ? 'Sign In to Portal' : 'Verify Email & Create Account'"
            [loading]="loading"
            type="submit"
            variant="primary"
            class="w-100 mt-2 mb-3">
          </app-button>
        </form>

        <!-- Demo Accounts Quick Autofill -->
        <div class="demo-box mt-3">
          <span class="demo-title">QUICK DEMO ONE-CLICK CREDENTIALS</span>
          <div class="demo-buttons">
            <button type="button" class="btn-demo" (click)="fillDemo('admin')">
              <i class="bi bi-person-badge-fill me-1"></i>
              <span>Partner Admin (Alexander Vance)</span>
            </button>
            <button type="button" class="btn-demo" (click)="fillDemo('lawyer')">
              <i class="bi bi-briefcase-fill me-1"></i>
              <span>Associate Lawyer (Sarah Jenkins)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- FORGOT PASSWORD MODAL -->
      <app-modal
        [isOpen]="showForgotModal"
        [title]="forgotStep === 1 ? 'Reset Account Password' : 'Enter Verification Code & New Password'"
        icon="bi-shield-lock"
        size="md"
        [hasFooter]="false"
        (close)="closeForgotModal()">
        <div class="p-2">
          <!-- Step 1: Request OTP -->
          <div *ngIf="forgotStep === 1">
            <p class="text-muted small mb-3">
              Enter the email address associated with your JusticeFlow account. We will send a 6-digit verification code to reset your password.
            </p>

            <app-alert *ngIf="forgotError" type="error" [message]="forgotError" class="mb-3"></app-alert>

            <div class="mb-3">
              <app-form-input
                label="Registered Email Address"
                type="email"
                placeholder="you@justiceflow.com"
                icon="bi-envelope"
                [required]="true"
                [(ngModel)]="forgotEmail">
              </app-form-input>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <app-button
                label="Cancel"
                variant="outline"
                (btnClick)="closeForgotModal()">
              </app-button>
              <app-button
                label="Send Verification Code"
                variant="primary"
                [loading]="forgotLoading"
                icon="bi-send"
                (btnClick)="submitForgotStep1()">
              </app-button>
            </div>
          </div>

          <!-- Step 2: Verify OTP and Set New Password -->
          <div *ngIf="forgotStep === 2">
            <div class="alert alert-info py-2 px-3 small d-flex align-items-center mb-3">
              <i class="bi bi-info-circle-fill me-2 fs-5 text-primary"></i>
              <div>
                Verification code dispatched to <strong>{{ forgotEmail }}</strong>.
              </div>
            </div>

            <!-- Demo helper badge for immediate testing -->
            <div *ngIf="forgotDemoOtp" class="alert alert-warning py-2 px-3 small mb-3">
              <i class="bi bi-key-fill me-1"></i>
              <strong>Test Environment OTP:</strong> <code class="fw-bold fs-6 ms-1">{{ forgotDemoOtp }}</code>
            </div>

            <app-alert *ngIf="forgotError" type="error" [message]="forgotError" class="mb-3"></app-alert>

            <div class="mb-3">
              <app-form-input
                label="6-Digit Verification Code"
                type="text"
                placeholder="123456"
                icon="bi-key"
                [required]="true"
                [(ngModel)]="forgotOtp">
              </app-form-input>
            </div>

            <div class="mb-3">
              <app-form-input
                label="New Password"
                type="password"
                placeholder="••••••••"
                icon="bi-lock"
                [required]="true"
                [(ngModel)]="forgotNewPassword">
              </app-form-input>
            </div>

            <div class="mb-3">
              <app-form-input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                icon="bi-lock-fill"
                [required]="true"
                [(ngModel)]="forgotConfirmPassword">
              </app-form-input>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-4">
              <button
                type="button"
                class="btn btn-link text-decoration-none small p-0 text-muted"
                (click)="forgotStep = 1">
                <i class="bi bi-arrow-left me-1"></i>Change Email
              </button>
              <div class="d-flex gap-2">
                <app-button
                  label="Cancel"
                  variant="outline"
                  (btnClick)="closeForgotModal()">
                </app-button>
                <app-button
                  label="Reset Password"
                  variant="primary"
                  [loading]="forgotLoading"
                  icon="bi-check2-circle"
                  (btnClick)="submitForgotStep2()">
                </app-button>
              </div>
            </div>
          </div>
        </div>
      </app-modal>

      <!-- REGISTRATION EMAIL VERIFICATION OTP MODAL -->
      <app-modal
        [isOpen]="showRegisterOtpModal"
        title="Verify Your Email Address"
        icon="bi-envelope-check"
        size="md"
        [hasFooter]="false"
        (close)="showRegisterOtpModal = false">
        <div class="p-2">
          <p class="text-muted small mb-3">
            To activate your firm account, please enter the 6-digit verification code sent to <strong>{{ email }}</strong>.
          </p>

          <div *ngIf="registerDemoOtp" class="alert alert-warning py-2 px-3 small mb-3">
            <i class="bi bi-shield-check me-1"></i>
            <strong>Test Environment OTP:</strong> <code class="fw-bold fs-6 ms-1">{{ registerDemoOtp }}</code>
          </div>

          <app-alert *ngIf="regOtpError" type="error" [message]="regOtpError" class="mb-3"></app-alert>

          <div class="mb-3">
            <app-form-input
              label="6-Digit Verification Code"
              type="text"
              placeholder="123456"
              icon="bi-key"
              [required]="true"
              [(ngModel)]="regOtp">
            </app-form-input>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-4">
            <button
              type="button"
              class="btn btn-link text-decoration-none small p-0 text-primary"
              [disabled]="regOtpLoading"
              (click)="resendRegisterOtp()">
              <i class="bi bi-arrow-repeat me-1"></i>Resend Code
            </button>
            <div class="d-flex gap-2">
              <app-button
                label="Cancel"
                variant="outline"
                (btnClick)="showRegisterOtpModal = false">
              </app-button>
              <app-button
                label="Confirm & Activate"
                variant="primary"
                [loading]="regOtpLoading"
                icon="bi-check-circle"
                (btnClick)="confirmRegistration()">
              </app-button>
            </div>
          </div>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .login-page-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.2) 0%, transparent 45%),
                  radial-gradient(circle at 90% 90%, rgba(14, 165, 233, 0.18) 0%, transparent 45%),
                  linear-gradient(135deg, #0B132B 0%, #1C2541 50%, #0F172A 100%);
      padding: 1.5rem;
      position: relative;

      .login-theme-corner {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        z-index: 20;
      }
    }

    .login-card-box {
      width: 100%;
      max-width: 450px;
      background: var(--jf-bg-card, #FFFFFF);
      border-radius: 20px;
      padding: 2.25rem 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
      border: 1px solid var(--jf-border, rgba(255, 255, 255, 0.12));
      transition: background-color 0.25s ease, border-color 0.25s ease;

      .brand-logo-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0 0.5rem 0;

        .brand-logo-img {
          max-width: 250px;
          max-height: 95px;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));
        }
      }

      .brand-title {
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        font-size: 1.65rem;
        color: var(--jf-text-primary, #0F172A);
        margin-bottom: 0.2rem;
      }

      .brand-subtitle {
        font-size: 0.85rem;
        color: var(--jf-text-muted, #64748B);
        margin-bottom: 0;
      }

      .mode-tabs {
        display: flex;
        background: var(--jf-bg-subtle, #F1F5F9);
        padding: 4px;
        border-radius: 12px;
        border: 1px solid var(--jf-border, #E2E8F0);
        gap: 4px;

        .tab-btn {
          flex: 1;
          height: 40px;
          border: none;
          background: transparent;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--jf-text-muted, #64748B);
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

          &.active {
            background: var(--jf-bg-card, #FFFFFF);
            color: var(--jf-text-primary, #0F172A);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          }

          &:hover:not(.active) {
            color: var(--jf-text-primary, #1E293B);
          }
        }
      }

      .demo-box {
        background-color: var(--jf-bg-subtle, #F8FAFC);
        border-radius: 12px;
        padding: 1rem;
        border: 1px dashed var(--jf-border-input, #CBD5E1);

        .demo-title {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748B;
          text-align: center;
          margin-bottom: 0.65rem;
          letter-spacing: 0.05em;
        }

        .demo-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .btn-demo {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            padding: 0.6rem 0.85rem;
            min-height: 42px;
            border-radius: 8px;
            font-size: 0.82rem;
            color: #1E293B;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            cursor: pointer;
            transition: all 0.15s ease;
            width: 100%;

            i {
              font-size: 1rem;
              color: #3B82F6;
              flex-shrink: 0;
            }

            &:hover {
              background: #EFF6FF;
              border-color: #93C5FD;
              color: #1D4ED8;
              transform: translateY(-1px);
              box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
            }
          }
        }
      }

      .system-status-indicator {
        font-size: 0.75rem;
        color: #94A3B8;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;

        .dot-online {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #10B981;
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
        }
      }
    }
  `]
})
export class LoginComponent {
  isLoginMode: boolean = true;
  email: string = 'admin@justiceflow.com';
  password: string = 'password123';
  name: string = '';
  rememberMe: boolean = true;
  loading: boolean = false;
  errorMessage: string = '';
  isConcurrentBlocked: boolean = false;

  // Forgot password modal state
  showForgotModal: boolean = false;
  forgotStep: number = 1;
  forgotEmail: string = '';
  forgotOtp: string = '';
  forgotDemoOtp: string = '';
  forgotNewPassword: string = '';
  forgotConfirmPassword: string = '';
  forgotLoading: boolean = false;
  forgotError: string = '';

  // Register OTP verification modal state
  showRegisterOtpModal: boolean = false;
  regOtp: string = '';
  registerDemoOtp: string = '';
  regOtpLoading: boolean = false;
  regOtpError: string = '';

  private returnUrl: string = '/dashboard';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    const qp = this.route.snapshot.queryParams;
    if (qp['msg']) {
      this.errorMessage = qp['msg'];
    }
  }

  setMode(isLogin: boolean) {
    this.isLoginMode = isLogin;
    this.errorMessage = '';
    this.isConcurrentBlocked = false;
  }

  fillDemo(role: 'admin' | 'lawyer') {
    this.isLoginMode = true;
    this.isConcurrentBlocked = false;
    this.errorMessage = '';
    if (role === 'admin') {
      this.email = 'admin@justiceflow.com';
      this.password = 'password123';
    } else {
      this.email = 'sarah.jenkins@justiceflow.com';
      this.password = 'password123';
    }
  }

  openForgotPassword() {
    this.showForgotModal = true;
    this.forgotStep = 1;
    this.forgotEmail = this.email || '';
    this.forgotOtp = '';
    this.forgotDemoOtp = '';
    this.forgotNewPassword = '';
    this.forgotConfirmPassword = '';
    this.forgotError = '';
    this.forgotLoading = false;
  }

  closeForgotModal() {
    this.showForgotModal = false;
    this.forgotError = '';
  }

  submitForgotStep1() {
    if (!this.forgotEmail) {
      this.forgotError = 'Please enter your registered email address.';
      return;
    }
    this.forgotError = '';
    this.forgotLoading = true;
    this.authService.sendPasswordResetCode(this.forgotEmail).subscribe({
      next: res => {
        this.forgotLoading = false;
        this.forgotStep = 2;
        if (res.otp) {
          this.forgotDemoOtp = res.otp;
        }
        this.notificationService.info('Verification code sent to your email.');
      },
      error: err => {
        this.forgotLoading = false;
        this.forgotError = err.error?.message || err.message || 'Unable to send verification code. Please check your email.';
      }
    });
  }

  submitForgotStep2() {
    if (!this.forgotOtp || this.forgotOtp.length < 4) {
      this.forgotError = 'Please enter the 6-digit verification code.';
      return;
    }
    if (!this.forgotNewPassword) {
      this.forgotError = 'Please enter a new password.';
      return;
    }
    if (this.forgotNewPassword.length < 6) {
      this.forgotError = 'Password must be at least 6 characters long.';
      return;
    }
    if (this.forgotNewPassword !== this.forgotConfirmPassword) {
      this.forgotError = 'Passwords do not match.';
      return;
    }

    this.forgotError = '';
    this.forgotLoading = true;
    this.authService.resetPassword({
      email: this.forgotEmail,
      otp: this.forgotOtp,
      newPassword: this.forgotNewPassword
    }).subscribe({
      next: () => {
        this.forgotLoading = false;
        this.closeForgotModal();
        this.notificationService.success('Password reset successfully! You can now sign in.');
        this.isLoginMode = true;
        this.email = this.forgotEmail;
        this.password = '';
      },
      error: err => {
        this.forgotLoading = false;
        this.forgotError = err.error?.message || err.message || 'Failed to reset password. Please verify the code.';
      }
    });
  }

  resendRegisterOtp() {
    if (!this.email) return;
    this.regOtpLoading = true;
    this.regOtpError = '';
    this.authService.sendRegistrationOtp(this.email).subscribe({
      next: res => {
        this.regOtpLoading = false;
        if (res.otp) this.registerDemoOtp = res.otp;
        this.notificationService.info('A new verification code has been dispatched.');
      },
      error: err => {
        this.regOtpLoading = false;
        this.regOtpError = err.error?.message || 'Failed to resend code.';
      }
    });
  }

  confirmRegistration() {
    if (!this.regOtp || this.regOtp.trim().length === 0) {
      this.regOtpError = 'Please enter the verification code.';
      return;
    }

    this.regOtpLoading = true;
    this.regOtpError = '';
    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      otp: this.regOtp.trim()
    }).subscribe({
      next: () => {
        this.regOtpLoading = false;
        this.showRegisterOtpModal = false;
        this.notificationService.success('Email verified and lawyer account created successfully!');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: err => {
        this.regOtpLoading = false;
        this.regOtpError = err.error?.message || err.message || 'Account registration failed.';
      }
    });
  }

  onForceLogin() {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.errorMessage = '';
    this.authService.login({
      email: this.email,
      password: this.password,
      forceUnlock: true,
      currentToken: this.authService.getToken() || undefined
    }).subscribe({
      next: res => {
        this.loading = false;
        this.isConcurrentBlocked = false;
        this.notificationService.success(`Previous session terminated. Welcome back, ${res.data.user.name}!`);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.message || 'Failed to terminate previous session. Please verify your credentials.';
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';
    if (!this.email || !this.password || (!this.isLoginMode && !this.name)) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.loading = true;

    if (this.isLoginMode) {
      this.isConcurrentBlocked = false;
      this.authService.login({ 
        email: this.email, 
        password: this.password,
        currentToken: this.authService.getToken() || undefined
      }).subscribe({
        next: res => {
          this.loading = false;
          this.notificationService.success(`Welcome back, ${res.data.user.name}!`);
          this.router.navigateByUrl(this.returnUrl);
        },
        error: err => {
          this.loading = false;
          if (err.error && err.error.isConcurrentSession) {
            this.isConcurrentBlocked = true;
          }
          this.errorMessage = err.error?.message || err.message || 'Authentication failed. Please verify your credentials.';
        }
      });
    } else {
      // Step 1 of registration: Request OTP to verify email
      this.authService.sendRegistrationOtp(this.email).subscribe({
        next: res => {
          this.loading = false;
          if (res.otp) {
            this.registerDemoOtp = res.otp;
          }
          this.regOtp = '';
          this.regOtpError = '';
          this.showRegisterOtpModal = true;
        },
        error: err => {
          this.loading = false;
          this.errorMessage = err.error?.message || err.message || 'Failed to send email verification code.';
        }
      });
    }
  }
}
