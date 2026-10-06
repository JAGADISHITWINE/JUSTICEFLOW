import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="jf-card-box" [class.no-padding]="noPadding">
      <div *ngIf="title || subtitle || hasCustomHeader" class="card-header-bar">
        <div class="header-titles">
          <h5 *ngIf="title" class="card-main-title">
            <i *ngIf="icon" class="bi me-2" [ngClass]="icon"></i>
            {{ title }}
          </h5>
          <span *ngIf="subtitle" class="card-subtitle-text">{{ subtitle }}</span>
        </div>
        <div class="header-actions">
          <ng-content select="[card-actions]"></ng-content>
        </div>
      </div>

      <div class="card-body-content" [class.p-0]="noPadding">
        <ng-content></ng-content>
      </div>

      <div *ngIf="hasFooter" class="card-footer-bar">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .jf-card-box {
      background: #FFFFFF;
      border-radius: 14px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.06), 0 4px 8px -4px rgba(0, 0, 0, 0.03);
      }

      .card-header-bar {
        padding: 1.15rem 1.5rem;
        border-bottom: 1px solid #E2E8F0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        background: #FFFFFF;

        .header-titles {
          .card-main-title {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 600;
            color: #2C3E50;
            display: flex;
            align-items: center;
          }

          .card-subtitle-text {
            display: block;
            margin-top: 0.2rem;
            font-size: 0.8rem;
            color: #7F8C8D;
          }
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }

      .card-body-content {
        padding: 1.5rem;
        flex: 1;

        &.p-0 {
          padding: 0;
        }
      }

      .card-footer-bar {
        padding: 1rem 1.5rem;
        background-color: #F8FAFC;
        border-top: 1px solid #E2E8F0;
      }
    }
  `]
})
export class AppCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() noPadding: boolean = false;
  @Input() hasCustomHeader: boolean = false;
  @Input() hasFooter: boolean = false;
}
