import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-box">
      <div class="empty-icon-bubble">
        <i [class]="'bi ' + icon"></i>
      </div>
      <h4 class="empty-title">{{ title }}</h4>
      <p class="empty-description">{{ message }}</p>
      <button *ngIf="actionLabel" class="btn btn-secondary" (click)="onAction()">
        <i *ngIf="actionIcon" [class]="'bi ' + actionIcon"></i>
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state-box {
      text-align: center;
      padding: 3rem 1.5rem;
      max-width: 480px;
      margin: 0 auto;

      .empty-icon-bubble {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: rgba(52, 152, 219, 0.1);
        color: #3498DB;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        margin-bottom: 1.25rem;
      }

      .empty-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #2C3E50;
        margin-bottom: 0.5rem;
      }

      .empty-description {
        font-size: 0.9rem;
        color: #7F8C8D;
        line-height: 1.5;
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class AppEmptyStateComponent {
  @Input() icon: string = 'bi-inbox';
  @Input() title: string = 'No records found';
  @Input() message: string = 'There are no items to display at this time.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;
  @Output() action = new EventEmitter<void>();

  onAction() {
    this.action.emit();
  }
}
