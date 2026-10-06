import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppFormSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-group-custom">
      <label *ngIf="label" class="form-label-custom">
        {{ label }}
        <span *ngIf="required" class="text-danger">*</span>
      </label>

      <div class="select-wrapper">
        <select
          [disabled]="disabled"
          [value]="value"
          (change)="onSelectChange($event)"
          (blur)="onBlur()"
          class="form-select-custom"
          [class.has-error]="hasError">
          <option *ngIf="placeholder" value="" [disabled]="required">{{ placeholder }}</option>
          <option *ngFor="let opt of options" [value]="opt.value">{{ opt.label }}</option>
        </select>
        <i class="bi bi-chevron-down select-chevron"></i>
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

      .select-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .select-chevron {
          position: absolute;
          right: 1rem;
          pointer-events: none;
          color: #7F8C8D;
          font-size: 0.8rem;
        }
      }

      .form-select-custom {
        width: 100%;
        padding: 0.6rem 2.25rem 0.6rem 0.85rem;
        font-size: 0.9rem;
        color: #2C3E50;
        background-color: #FFFFFF;
        border: 1px solid #BDC3C7;
        border-radius: 8px;
        appearance: none;
        cursor: pointer;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

        &:focus {
          outline: none;
          border-color: #3498DB;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }

        &.has-error {
          border-color: #E74C3C;
          &:focus {
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
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
export class AppFormSelectComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() hint?: string;
  @Input() hasError: boolean = false;
  @Input() errorMessage?: string;
  @Input() disabled: boolean = false;

  value: any = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(val: any): void {
    this.value = val !== undefined && val !== null ? val : '';
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

  onSelectChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
