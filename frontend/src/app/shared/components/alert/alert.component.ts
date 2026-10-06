import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message" class="alert-box" [ngClass]="'alert-' + type">
      <div class="alert-icon">
        <i class="bi" [ngClass]="getIcon()"></i>
      </div>
      <div class="alert-content">
        <strong *ngIf="title" class="alert-title">{{ title }}</strong>
        <span class="alert-text">{{ message }}</span>
      </div>
      <button *ngIf="dismissible" type="button" class="btn-close-alert" (click)="onDismiss()">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `,
  styles: [`
    .alert-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      .alert-icon {
        font-size: 1.15rem;
        display: flex;
        align-items: center;
      }

      .alert-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;

        .alert-title {
          font-weight: 600;
        }

        .alert-text {
          line-height: 1.4;
        }
      }

      .btn-close-alert {
        background: none;
        border: none;
        font-size: 1.15rem;
        cursor: pointer;
        padding: 0.2rem;
        display: flex;
        align-items: center;
        opacity: 0.6;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }
      }

      &.alert-success {
        background-color: #E8F8F0;
        color: #1E8449;
        border: 1px solid #A9DFBF;
      }

      &.alert-error, &.alert-danger {
        background-color: #FDEDEC;
        color: #B03A2E;
        border: 1px solid #F5B7B1;
      }

      &.alert-warning {
        background-color: #FEF9E7;
        color: #B7950B;
        border: 1px solid #F9E79F;
      }

      &.alert-info {
        background-color: #EBF5FB;
        color: #2471A3;
        border: 1px solid #AED6F1;
      }
    }
  `]
})
export class AppAlertComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() title?: string;
  @Input() message?: string;
  @Input() dismissible: boolean = true;
  @Output() dismiss = new EventEmitter<void>();

  getIcon(): string {
    switch (this.type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-exclamation-triangle-fill';
      case 'warning': return 'bi-exclamation-circle-fill';
      default: return 'bi-info-circle-fill';
    }
  }

  onDismiss() {
    this.dismiss.emit();
  }
}
