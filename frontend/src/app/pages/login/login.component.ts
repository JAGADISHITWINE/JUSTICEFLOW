import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppFormInputComponent } from '../../shared/components/form-input/form-input.component';
import { AppAlertComponent } from '../../shared/components/alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, AppButtonComponent, AppFormInputComponent, AppAlertComponent],
  template: `
    <div class="login-page-container">
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

        <app-alert
          *ngIf="errorMessage"
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
            <a href="javascript:void(0)" class="small text-secondary" (click)="fillDemo('admin')">Forgot password?</a>
          </div>

          <app-button
            [label]="isLoginMode ? 'Sign In to Portal' : 'Register Law Firm Account'"
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

        <!-- Switch to Client Portal -->
        <div class="text-center pt-3 mt-3 border-top d-flex flex-column align-items-center gap-1">
          <span class="text-muted small">Are you a client looking for your case?</span>
          <a routerLink="/portal/login" class="btn btn-sm btn-link text-success text-decoration-none fw-bold d-inline-flex align-items-center gap-1">
            <i class="bi bi-shield-lock-fill"></i>
            <span>Switch to Client Self-Service Portal</span>
            <i class="bi bi-arrow-right"></i>
          </a>
        </div>

        <div class="system-status-indicator mt-3 text-center">
          <span class="dot-online"></span>
          <span>Gateway: Port 5000 | MySQL Connected</span>
        </div>
      </div>
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
    }

    .login-card-box {
      width: 100%;
      max-width: 450px;
      background: #FFFFFF;
      border-radius: 20px;
      padding: 2.25rem 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);

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
        color: #0F172A;
        margin-bottom: 0.2rem;
      }

      .brand-subtitle {
        font-size: 0.85rem;
        color: #64748B;
        margin-bottom: 0;
      }

      .mode-tabs {
        display: flex;
        background: #F1F5F9;
        padding: 4px;
        border-radius: 12px;
        border: 1px solid #E2E8F0;
        gap: 4px;

        .tab-btn {
          flex: 1;
          height: 40px;
          border: none;
          background: transparent;
          font-size: 0.88rem;
          font-weight: 600;
          color: #64748B;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

          &.active {
            background: #FFFFFF;
            color: #0F172A;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          }

          &:hover:not(.active) {
            color: #1E293B;
          }
        }
      }

      .demo-box {
        background-color: #F8FAFC;
        border-radius: 12px;
        padding: 1rem;
        border: 1px dashed #CBD5E1;

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

  private returnUrl: string = '/dashboard';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  setMode(isLogin: boolean) {
    this.isLoginMode = isLogin;
    this.errorMessage = '';
  }

  fillDemo(role: 'admin' | 'lawyer') {
    this.isLoginMode = true;
    if (role === 'admin') {
      this.email = 'admin@justiceflow.com';
      this.password = 'password123';
    } else {
      this.email = 'sarah.jenkins@justiceflow.com';
      this.password = 'password123';
    }
  }

  onSubmit() {
    this.errorMessage = '';
    if (!this.email || !this.password || (!this.isLoginMode && !this.name)) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.loading = true;

    if (this.isLoginMode) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: res => {
          this.loading = false;
          this.notificationService.success(`Welcome back, ${res.data.user.name}!`);
          this.router.navigateByUrl(this.returnUrl);
        },
        error: err => {
          this.loading = false;
          this.errorMessage = err.message || 'Authentication failed. Please verify your credentials.';
        }
      });
    } else {
      this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
        next: res => {
          this.loading = false;
          this.notificationService.success('Lawyer account created successfully!');
          this.router.navigateByUrl(this.returnUrl);
        },
        error: err => {
          this.loading = false;
          this.errorMessage = err.message || 'Account registration failed.';
        }
      });
    }
  }
}
