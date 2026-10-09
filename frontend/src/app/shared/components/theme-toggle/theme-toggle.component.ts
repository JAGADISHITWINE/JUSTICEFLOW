import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, AppTheme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Segmented Capsule Mode -->
    <div
      *ngIf="variant === 'segmented'"
      class="jf-theme-segmented"
      [class.compact]="compact"
      role="radiogroup"
      aria-label="Color scheme preference">
      <button
        type="button"
        class="theme-segment-btn"
        [class.active]="themeService.currentTheme === 'light'"
        (click)="setTheme('light')"
        role="radio"
        [attr.aria-checked]="themeService.currentTheme === 'light'"
        title="Switch to Day Mode (Light theme)">
        <i class="bi bi-sun-fill segment-icon sun"></i>
        <span class="segment-label" *ngIf="!compact">Day</span>
      </button>

      <button
        type="button"
        class="theme-segment-btn"
        [class.active]="themeService.currentTheme === 'dark'"
        (click)="setTheme('dark')"
        role="radio"
        [attr.aria-checked]="themeService.currentTheme === 'dark'"
        title="Switch to Night Mode (Dark theme)">
        <i class="bi bi-moon-stars-fill segment-icon moon"></i>
        <span class="segment-label" *ngIf="!compact">Night</span>
      </button>
    </div>

    <!-- Single Compact Pill Toggle Button Mode -->
    <button
      *ngIf="variant === 'toggle'"
      type="button"
      class="jf-theme-toggle-btn"
      [class.is-night]="themeService.isDark"
      (click)="toggleTheme()"
      role="switch"
      [attr.aria-checked]="themeService.isDark"
      [attr.aria-label]="themeService.isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'"
      [title]="themeService.isDark ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'">
      
      <div class="toggle-track">
        <div class="toggle-icon-bg sun-icon">
          <i class="bi bi-sun-fill"></i>
        </div>
        <div class="toggle-icon-bg moon-icon">
          <i class="bi bi-moon-stars-fill"></i>
        </div>
        <div class="toggle-thumb">
          <i class="bi" [ngClass]="themeService.isDark ? 'bi-moon-stars-fill text-indigo' : 'bi-sun-fill text-amber'"></i>
        </div>
      </div>

      <span class="toggle-text d-none d-xl-inline" *ngIf="showLabel">
        {{ themeService.isDark ? 'Night' : 'Day' }}
      </span>
    </button>

    <!-- Icon Only Button Mode -->
    <button
      *ngIf="variant === 'icon'"
      type="button"
      class="jf-theme-icon-btn"
      [class.is-night]="themeService.isDark"
      (click)="toggleTheme()"
      [title]="themeService.isDark ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'"
      aria-label="Toggle Day / Night mode">
      <i class="bi" [ngClass]="themeService.isDark ? 'bi-moon-stars-fill' : 'bi-sun-fill'"></i>
    </button>
  `,
  styles: [`
    /* Segmented Capsule Style */
    .jf-theme-segmented {
      display: inline-flex;
      align-items: center;
      background: var(--jf-bg-subtle, #F1F5F9);
      border: 1px solid var(--jf-border, #E2E8F0);
      border-radius: 9999px;
      padding: 3px;
      gap: 2px;
      user-select: none;
      transition: background-color 0.25s ease, border-color 0.25s ease;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);

      &.compact {
        padding: 2px;
        .theme-segment-btn {
          padding: 0.3rem 0.5rem;
          font-size: 0.8rem;
        }
      }

      .theme-segment-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.75rem;
        border-radius: 9999px;
        border: none;
        background: transparent;
        color: var(--jf-text-muted, #64748B);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        line-height: 1;

        .segment-icon {
          font-size: 0.95rem;
          line-height: 1;
          transition: transform 0.3s ease;
        }

        &.active {
          background: var(--jf-bg-card, #FFFFFF);
          color: var(--jf-text-primary, #0F172A);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);

          .sun {
            color: #F59E0B;
            filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4));
            transform: rotate(20deg);
          }

          .moon {
            color: #60A5FA;
            filter: drop-shadow(0 0 4px rgba(96, 165, 250, 0.4));
            transform: rotate(-10deg);
          }
        }

        &:hover:not(.active) {
          color: var(--jf-text-primary, #0F172A);
          background: rgba(148, 163, 184, 0.15);
        }
      }
    }

    /* Single Pill Toggle Style */
    .jf-theme-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.3rem 0.65rem 0.3rem 0.35rem;
      border-radius: 9999px;
      border: 1px solid var(--jf-border, #E2E8F0);
      background: var(--jf-bg-card, #FFFFFF);
      color: var(--jf-text-primary, #1E293B);
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

      &:hover {
        border-color: var(--jf-accent-primary, #3B82F6);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
      }

      .toggle-track {
        width: 44px;
        height: 24px;
        background: #E2E8F0;
        border-radius: 9999px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 5px;
        transition: background-color 0.3s ease;

        .toggle-icon-bg {
          font-size: 0.72rem;
          line-height: 1;
          z-index: 1;

          &.sun-icon {
            color: #D97706;
          }

          &.moon-icon {
            color: #94A3B8;
          }
        }

        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease;
          z-index: 2;
          font-size: 0.75rem;

          .text-amber {
            color: #D97706;
          }

          .text-indigo {
            color: #38BDF8;
          }
        }
      }

      &.is-night {
        background: var(--jf-bg-card, #151F32);
        border-color: var(--jf-border, #24324D);

        .toggle-track {
          background: #1E293B;

          .toggle-icon-bg {
            &.sun-icon {
              color: #475569;
            }
            &.moon-icon {
              color: #38BDF8;
            }
          }

          .toggle-thumb {
            transform: translateX(20px);
            background: #0B1120;
          }
        }
      }
    }

    /* Icon Button Style */
    .jf-theme-icon-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: 1px solid var(--jf-border, #E2E8F0);
      background: var(--jf-bg-card, #FFFFFF);
      color: var(--jf-text-primary, #1E293B);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.15rem;
      transition: all 0.25s ease;

      i {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease;
      }

      &:hover {
        background: var(--jf-bg-subtle, #F1F5F9);
        border-color: var(--jf-accent-primary, #3B82F6);
        transform: translateY(-1px);

        i {
          transform: rotate(20deg) scale(1.1);
        }
      }

      &:active {
        transform: translateY(0);
      }

      &.is-night {
        color: #60A5FA;
        &:hover {
          i {
            transform: rotate(-20deg) scale(1.1);
          }
        }
      }

      &:not(.is-night) {
        color: #F59E0B;
      }
    }
  `]
})
export class AppThemeToggleComponent {
  @Input() variant: 'segmented' | 'toggle' | 'icon' = 'segmented';
  @Input() compact: boolean = false;
  @Input() showLabel: boolean = true;

  constructor(public themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
  }
}
