import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClientPortalService } from '../../core/services/client-portal.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-portal-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="client-login-wrapper">
      <div class="client-login-container">
        <!-- Brand Header -->
        <div class="text-center mb-4">
          <div class="portal-brand-badge mx-auto mb-3">
            <img src="assets/logo-icon.png" alt="JusticeFlow" class="portal-logo-img" onerror="this.onerror=null; this.src='assets/Justiceflow.jpg';">
          </div>
          <h2 class="portal-title mb-1">JUSTICEFLOW CLIENT ACCESS</h2>
          <p class="portal-subtitle mb-0">Secure Client Self-Service & Privilege Portal</p>
        </div>

        <!-- Login Card -->
        <div class="card client-login-card shadow-lg border-0 rounded-4 p-4 p-md-5">
          <h5 class="fw-bold text-dark mb-1">Client Sign In</h5>
          <p class="text-muted small mb-4">
            Access your case timeline, review confidential invoices, and securely transmit documents to your legal counsel.
          </p>

          <form (ngSubmit)="onLogin()">
            <div class="mb-3">
              <label class="form-label fw-semibold small text-secondary">Client Email Address</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  class="form-control border-start-0 ps-0"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="e.g. client@apexlogistics.com"
                  required>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold small text-secondary">Password / Security Code</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-key"></i>
                </span>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control border-start-0 border-end-0 ps-0"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  required>
                <button
                  type="button"
                  class="btn btn-outline-secondary border-start-0 bg-transparent text-muted"
                  (click)="showPassword = !showPassword"
                  [title]="showPassword ? 'Hide password' : 'Show password'"
                  tabindex="-1">
                  <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-portal-primary w-100 py-2 fw-bold mb-3"
              [disabled]="isLoading || !email">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <i *ngIf="!isLoading" class="bi bi-shield-check me-2 fs-5"></i>
              <span>{{ isLoading ? 'Verifying Confidential Client Credentials...' : 'Sign In to Client Portal' }}</span>
            </button>

            <!-- Quick Demo Button -->
            <div class="demo-box p-3 rounded-3 border mb-3">
              <div class="small fw-semibold text-muted text-uppercase text-center mb-2" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                ⚡ Instant Demo Client Access
              </div>
              <button
                type="button"
                class="btn btn-demo-client w-100"
                (click)="fillDemoClient()">
                <i class="bi bi-person-badge-fill text-success fs-6"></i>
                <span class="text-truncate">Quick Login: Apex Logistics (CEO Marcus Thorne)</span>
              </button>
            </div>

            <div class="text-center pt-3 border-top d-flex flex-column align-items-center gap-1">
              <span class="text-muted small">Are you an attorney or firm staff?</span>
              <a routerLink="/login" class="btn btn-sm btn-link text-primary text-decoration-none fw-bold d-inline-flex align-items-center gap-1">
                <span>Go to Attorney / Admin Portal</span>
                <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </form>
        </div>

        <div class="text-center text-muted small mt-4 opacity-75">
          Protected by Attorney-Client Privilege & Bar Rules of Confidentiality &bull; JusticeFlow OS
        </div>
      </div>
    </div>
  `,
  styles: [`
    .client-login-wrapper {
      min-height: 100vh;
      background: radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.18) 0%, transparent 45%),
                  radial-gradient(circle at 85% 85%, rgba(14, 165, 233, 0.2) 0%, transparent 45%),
                  linear-gradient(135deg, #0B132B 0%, #1C2541 50%, #0A192F 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px 15px;
      font-family: 'Inter', sans-serif;
      position: relative;
    }
    .client-login-container {
      width: 100%;
      max-width: 480px;
    }
    .portal-brand-badge {
      width: 66px;
      height: 66px;
      border-radius: 18px;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      box-shadow: 0 12px 25px rgba(0, 0, 0, 0.35);

      .portal-logo-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .portal-title {
      color: #FFFFFF;
      font-weight: 800;
      letter-spacing: 1.5px;
      font-size: 1.45rem;
    }
    .portal-subtitle {
      color: #94A3B8;
      font-size: 0.88rem;
    }
    .client-login-card {
      background: #FFFFFF;
      border-radius: 20px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .btn-portal-primary {
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #10B981, #059669);
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
      transition: all 0.2s ease;
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #059669, #047857);
        color: #FFFFFF;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
      }
      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
    .demo-box {
      background: #F8FAFC;
      border-radius: 12px;
      border: 1px dashed #CBD5E1;
    }
    .btn-demo-client {
      min-height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      background: #FFFFFF;
      border: 1px solid #A7F3D0;
      color: #065F46;
      font-weight: 600;
      font-size: 0.82rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      &:hover {
        background: #ECFDF5;
        border-color: #10B981;
        color: #047857;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.15);
      }
    }
  `]
})
export class PortalLoginComponent {
  email: string = 'legal@apexlogistic.com';
  password: string = 'password123';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private portalService: ClientPortalService,
    private router: Router,
    private notify: NotificationService
  ) { }

  fillDemoClient(): void {
    this.email = 'legal@apexlogistic.com';
    this.password = 'password123';
    this.onLogin();
  }

  onLogin(): void {
    if (!this.email) return;
    this.isLoading = true;

    this.portalService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.notify.success(`Welcome, ${res.data.client.name}! Secure Client Portal unlocked.`);
          this.router.navigate(['/portal/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.notify.error('Login failed: ' + (err.error?.message || err.message));
      }
    });
  }
}
