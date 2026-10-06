import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TimeEntry } from '../../core/models/models';

@Component({
  selector: 'app-time-tracking-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="table-responsive">
      <table class="table table-custom align-middle mb-0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Attorney</th>
            <th>Matter</th>
            <th>Description</th>
            <th>Hours</th>
            <th>Rate</th>
            <th>Value</th>
            <th class="text-end" *ngIf="showActions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of entries">
            <td><strong class="text-dark">{{ item.entry_date }}</strong></td>
            <td><span class="small text-muted">{{ item.lawyer_name || 'Counsel' }}</span></td>
            <td>
              <a [routerLink]="['/cases', item.case_id]" class="fw-semibold text-dark">
                {{ item.case_name }}
              </a>
            </td>
            <td>{{ item.description }}</td>
            <td><span class="badge bg-primary-subtle text-primary">{{ item.hours }} hrs</span></td>
            <td>\${{ item.hourly_rate }}/hr</td>
            <td><strong class="text-success">\${{ formatCurrency((item.hours || 0) * (item.hourly_rate || 200)) }}</strong></td>
            <td class="text-end" *ngIf="showActions">
              <button class="btn btn-sm btn-outline-danger" (click)="delete.emit(item)">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
          <tr *ngIf="!entries || entries.length === 0">
            <td colspan="8" class="text-center py-4 text-muted">No time entries recorded.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class TimeTrackingListComponent {
  @Input() entries: TimeEntry[] = [];
  @Input() showActions: boolean = true;
  @Output() delete = new EventEmitter<TimeEntry>();

  formatCurrency(val: any): string {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
