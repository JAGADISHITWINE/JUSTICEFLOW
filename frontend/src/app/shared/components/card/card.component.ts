import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="jf-card-box" [class.no-padding]="noPadding" [class.is-collapsed]="collapsible && collapsed">
      <div
        *ngIf="title || subtitle || hasCustomHeader"
        class="card-header-bar"
        [class.is-clickable]="collapsible"
        (click)="onHeaderClick()"
        [attr.role]="collapsible ? 'button' : null"
        [attr.tabindex]="collapsible ? 0 : null"
        [attr.aria-expanded]="collapsible ? !collapsed : null"
        (keydown.enter)="collapsible && onHeaderClick()"
        (keydown.space)="$event.preventDefault(); collapsible && onHeaderClick()">
        <div class="header-titles">
          <h5 *ngIf="title" class="card-main-title">
            <i *ngIf="icon" class="bi me-2" [ngClass]="icon"></i>
            <span>{{ title }}</span>
            <span *ngIf="badgeText" class="card-badge ms-2" [ngClass]="badgeClass">{{ badgeText }}</span>
          </h5>
          <span *ngIf="subtitle" class="card-subtitle-text">{{ subtitle }}</span>
        </div>
        <div class="header-actions" (click)="$event.stopPropagation()">
          <ng-content select="[card-actions]"></ng-content>
          <button
            *ngIf="collapsible"
            type="button"
            class="btn-card-collapse"
            (click)="toggleCollapse($event)"
            [attr.aria-expanded]="!collapsed"
            [title]="collapsed ? 'Expand section' : 'Collapse section'">
            <i class="bi" [ngClass]="collapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
          </button>
        </div>
      </div>

      <div class="card-body-wrapper" [class.collapsed-body]="collapsible && collapsed">
        <div class="card-body-content" [class.p-0]="noPadding">
          <ng-content></ng-content>
        </div>

        <div *ngIf="hasFooter" class="card-footer-bar">
          <ng-content select="[card-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .jf-card-box {
      background: var(--jf-bg-card, #FFFFFF);
      border-radius: 14px;
      border: 1px solid var(--jf-border, #E2E8F0);
      box-shadow: var(--jf-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04));
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

      &.is-collapsed {
        height: auto;
      }

      &:hover {
        box-shadow: var(--jf-shadow-md, 0 8px 20px -4px rgba(0, 0, 0, 0.06));
      }

      .card-header-bar {
        padding: 1.15rem 1.5rem;
        border-bottom: 1px solid var(--jf-border, #E2E8F0);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        background: var(--jf-bg-card-header, #FFFFFF);
        user-select: none;

        &.is-clickable {
          cursor: pointer;
          transition: background-color 0.15s ease;

          &:hover {
            background-color: var(--jf-bg-hover, #F8FAFC);
          }

          &:focus-visible {
            outline: 2px solid var(--jf-accent-primary, #2563EB);
            outline-offset: -2px;
          }
        }

        .header-titles {
          .card-main-title {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--jf-text-primary, #2C3E50);
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.35rem;

            .card-badge {
              font-size: 0.72rem;
              font-weight: 600;
              padding: 0.2rem 0.55rem;
              border-radius: 20px;
            }
          }

          .card-subtitle-text {
            display: block;
            margin-top: 0.2rem;
            font-size: 0.8rem;
            color: var(--jf-text-muted, #7F8C8D);
          }
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .btn-card-collapse {
            background: none;
            border: 1px solid var(--jf-border, #E2E8F0);
            border-radius: 8px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--jf-text-muted, #64748B);
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              background-color: var(--jf-bg-subtle, #F1F5F9);
              color: var(--jf-accent-primary, #2563EB);
              border-color: var(--jf-accent-primary, #2563EB);
            }
          }
        }
      }

      .card-body-wrapper {
        transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, visibility 0.35s;
        max-height: 2500px;
        opacity: 1;
        visibility: visible;
        overflow: hidden;

        &.collapsed-body {
          max-height: 0;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
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
          background-color: var(--jf-bg-card-footer, #F8FAFC);
          border-top: 1px solid var(--jf-border, #E2E8F0);
        }
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

  @Input() collapsible: boolean = false;
  @Input() collapsed: boolean = false;
  @Input() badgeText?: string;
  @Input() badgeClass: string = 'badge bg-primary-subtle text-primary border border-primary-subtle';
  @Output() collapsedChange = new EventEmitter<boolean>();

  onHeaderClick() {
    if (this.collapsible) {
      this.toggleCollapse();
    }
  }

  toggleCollapse(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
