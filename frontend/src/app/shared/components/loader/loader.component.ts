import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-container" [class.overlay]="overlay">
      <div class="spinner-wrapper">
        <div class="spinner-border text-primary" role="status" [style.width.rem]="size" [style.height.rem]="size">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p *ngIf="message" class="loader-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
      width: 100%;

      &.overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(2px);
        z-index: 50;
      }

      .spinner-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;

        .text-primary {
          color: #3498DB !important;
        }

        .loader-message {
          font-size: 0.875rem;
          color: #7F8C8D;
          font-weight: 500;
          margin: 0;
        }
      }
    }
  `]
})
export class AppLoaderComponent {
  @Input() message?: string;
  @Input() overlay: boolean = false;
  @Input() size: number = 2.25;
}
