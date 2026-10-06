import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppFormInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-group-custom">
      <label *ngIf="label" class="form-label-custom">
        {{ label }}
        <span *ngIf="required" class="text-danger">*</span>
      </label>

      <div class="input-wrapper" [class.has-icon]="!!icon" [class.has-toggle]="isPasswordField" [class.is-invalid]="hasError">
        <i *ngIf="icon" class="input-icon bi" [ngClass]="icon"></i>
        <input
          [type]="currentType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          (input)="onInputChange($event)"
          (blur)="onBlur()"
          class="form-control-custom"
          [class.has-error]="hasError"
        />
        <button
          *ngIf="isPasswordField"
          type="button"
          class="btn-toggle-password"
          (click)="togglePasswordVisibility()"
          [title]="showPassword ? 'Hide password' : 'Show password'"
          tabindex="-1">
          <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
        </button>
      </div>

      <small *ngIf="hint && !hasError" class="form-hint">{{ hint }}</small>
      <div *ngIf="hasError && errorMessage" class="error-feedback">
        <i class="bi bi-exclamation-circle me-1"></i>
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .form-group-custom {
      margin-bottom: 1.25rem;

      .form-label-custom {
        display: block;
        margin-bottom: 0.4rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #2C3E50;
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .input-icon {
          position: absolute;
          left: 0.85rem;
          color: #7F8C8D;
          font-size: 1rem;
          pointer-events: none;
          z-index: 2;
        }

        &.has-icon .form-control-custom {
          padding-left: 2.5rem;
        }

        &.has-toggle .form-control-custom {
          padding-right: 2.75rem;
        }

        .btn-toggle-password {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #64748B;
          padding: 0.35rem 0.5rem;
          font-size: 1.05rem;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s, background-color 0.15s;
          z-index: 3;

          &:hover {
            color: #1E293B;
            background-color: #F1F5F9;
          }

          &:focus {
            outline: none;
            color: #2563EB;
          }
        }
      }

      .form-control-custom {
        width: 100%;
        min-height: 42px;
        padding: 0.6rem 0.85rem;
        font-size: 0.9rem;
        color: #0F172A;
        background-color: #FFFFFF;
        border: 1px solid #CBD5E1;
        border-radius: 8px;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

        &:focus {
          outline: none;
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        &.has-error {
          border-color: #EF4444;
          &:focus {
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
          }
        }

        &:disabled {
          background-color: #F8FAFC;
          cursor: not-allowed;
        }
      }

      .form-hint {
        display: block;
        font-size: 0.775rem;
        color: #7F8C8D;
        margin-top: 0.25rem;
      }

      .error-feedback {
        display: flex;
        align-items: center;
        font-size: 0.8rem;
        color: #E74C3C;
        margin-top: 0.35rem;
        font-weight: 500;
      }
    }
  `]
})
export class AppFormInputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() icon?: string;
  @Input() hint?: string;
  @Input() hasError: boolean = false;
  @Input() errorMessage?: string;
  @Input() disabled: boolean = false;

  showPassword: boolean = false;

  get isPasswordField(): boolean {
    return this.type === 'password';
  }

  get currentType(): string {
    if (this.isPasswordField) {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  value: any = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(val: any): void {
    this.value = val || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
