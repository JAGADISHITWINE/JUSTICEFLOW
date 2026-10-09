import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="jf-modal-backdrop" (click)="onBackdropClick($event)">
      <div class="jf-modal-dialog" [ngClass]="'modal-' + size" (click)="$event.stopPropagation()">
        <div class="jf-modal-header">
          <h5 class="modal-title">
            <i *ngIf="icon" class="bi me-2" [ngClass]="icon"></i>
            {{ title }}
          </h5>
          <button
            type="button"
            class="btn-close-modal"
            (click)="closeModal()"
            title="Close dialog (Esc)"
            aria-label="Close dialog">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="jf-modal-body">
          <ng-content></ng-content>
        </div>

        <div *ngIf="hasFooter" class="jf-modal-footer">
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .jf-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(11, 19, 43, 0.7);
      backdrop-filter: blur(5px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease-out;
    }

    .jf-modal-dialog {
      background: var(--jf-bg-modal, #FFFFFF);
      border-radius: 14px;
      border: 1px solid var(--jf-border, #E2E8F0);
      box-shadow: var(--jf-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.25));
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &.modal-sm { max-width: 420px; }
      &.modal-md { max-width: 600px; }
      &.modal-lg { max-width: 820px; }
      &.modal-xl { max-width: 1040px; }

      .jf-modal-header {
        padding: 1.15rem 1.5rem;
        border-bottom: 1px solid var(--jf-border, #ECF0F1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--jf-bg-card-header, #FFFFFF);

        .modal-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--jf-text-primary, #2C3E50);
          display: flex;
          align-items: center;
        }

        .btn-close-modal {
          background: transparent;
          border: 1px solid transparent;
          width: 32px;
          height: 32px;
          font-size: 0.95rem;
          color: var(--jf-text-muted, #7F8C8D);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;

          &:hover {
            color: #DC2626 !important;
            background-color: rgba(220, 38, 38, 0.12) !important;
            border-color: rgba(220, 38, 38, 0.2) !important;
            transform: scale(1.05);
          }

          &:active {
            transform: scale(0.95);
          }

          &:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.25);
          }
        }
      }

      .jf-modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
        color: var(--jf-text-body, #334155);
      }

      .jf-modal-footer {
        padding: 1rem 1.5rem;
        background-color: var(--jf-bg-card-footer, #F8FAFC);
        border-top: 1px solid var(--jf-border, #ECF0F1);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideDown {
      from { transform: translateY(-16px) scale(0.98); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `]
})
export class AppModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() icon?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() hasFooter: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  
  // Support both (close) and (closed) outputs
  @Output() close = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  closeModal() {
    this.close.emit();
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (this.closeOnBackdrop) {
      this.closeModal();
    }
  }
}
