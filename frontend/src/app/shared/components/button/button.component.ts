import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      class="btn mx-1"
      [ngClass]="getButtonClass()"
      (click)="onClick($event)">
      <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      <i *ngIf="icon && !loading" class="bi me-2" [ngClass]="icon"></i>
      <ng-content></ng-content>
      <span>{{ label }}</span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: middle;
    }
    :host(.w-100), :host([class*="w-100"]) {
      display: block;
      width: 100%;
    }
    button {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 600;
      border-radius: 10px;
      padding: 0.6rem 1.25rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      line-height: 1.5;
      border: 1px solid transparent;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }
    :host(.w-100) button, :host([class*="w-100"]) button {
      width: 100%;
    }
  `]
})
export class AppButtonComponent {
  @Input() label: string = '';
  @Input() variant: 'primary' | 'secondary' | 'accent' | 'warning' | 'danger' | 'outline' = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() icon?: string;
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() btnClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent) {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit(event);
    }
  }

  getButtonClass(): string {
    const sizeClass = this.size === 'sm' ? 'btn-sm' : this.size === 'lg' ? 'btn-lg' : '';
    switch (this.variant) {
      case 'primary': return `btn-primary ${sizeClass}`;
      case 'secondary': return `btn-secondary ${sizeClass}`;
      case 'accent': return `btn-accent ${sizeClass}`;
      case 'warning': return `btn-warning ${sizeClass}`;
      case 'danger': return `btn-danger ${sizeClass}`;
      case 'outline': return `btn-outline-primary ${sizeClass}`;
      default: return `btn-primary ${sizeClass}`;
    }
  }
}
