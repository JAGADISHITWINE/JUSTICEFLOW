import { Component, EventEmitter, Input, Output } from '@angular/core';
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
          <button type="button" class="btn-close-modal" (click)="closeModal()">
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
      background: rgba(44, 62, 80, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease-out;
    }

    .jf-modal-dialog {
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #ECF0F1;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .modal-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 600;
          color: #2C3E50;
          display: flex;
          align-items: center;
        }

        .btn-close-modal {
          background: none;
          border: none;
          font-size: 1rem;
          color: #7F8C8D;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          border-radius: 6px;
          transition: all 0.15s ease;

          &:hover {
            color: #2C3E50;
            background-color: #ECF0F1;
          }
        }
      }

      .jf-modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
      }

      .jf-modal-footer {
        padding: 1rem 1.5rem;
        background-color: #F8FAFC;
        border-top: 1px solid #ECF0F1;
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
      from { transform: translateY(-20px) scale(0.98); opacity: 0; }
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
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (this.closeOnBackdrop) {
      this.closeModal();
    }
  }
}
