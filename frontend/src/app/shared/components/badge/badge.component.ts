import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge-status" [ngClass]="getBadgeClass()">
      <span class="dot"></span>
      {{ label || status }}
    </span>
  `,
  styles: [`
    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.28rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: currentColor;
      }

      &.status-open, &.status-active {
        background-color: #E8F8F0;
        color: #27AE60;
        border: 1px solid rgba(39, 174, 96, 0.25);
      }

      &.status-pending {
        background-color: #FEF5E7;
        color: #D35400;
        border: 1px solid rgba(243, 156, 18, 0.25);
      }

      &.status-on-hold {
        background-color: #EBF5FB;
        color: #2980B9;
        border: 1px solid rgba(52, 152, 219, 0.25);
      }

      &.status-closed, &.status-inactive {
        background-color: #F2F4F4;
        color: #7F8C8D;
        border: 1px solid rgba(127, 140, 141, 0.25);
      }
    }
  `]
})
export class AppBadgeComponent {
  @Input() status: string = 'Open';
  @Input() label?: string;

  getBadgeClass(): string {
    const s = (this.status || '').toLowerCase().replace(/\s+/g, '-');
    return `status-${s}`;
  }
}
