import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLoaderComponent } from '../loader/loader.component';
import { AppEmptyStateComponent } from '../empty-state/empty-state.component';
import { AppPaginationComponent } from '../pagination/pagination.component';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
  cellClass?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, AppLoaderComponent, AppEmptyStateComponent, AppPaginationComponent],
  template: `
    <div class="table-container-card">
      <div *ngIf="loading" class="table-loading-overlay">
        <app-loader message="Fetching legal records..."></app-loader>
      </div>

      <div class="table-responsive">
        <table class="table table-custom align-middle">
          <thead>
            <tr>
              <th
                *ngFor="let col of columns"
                [style.width]="col.width"
                [class.sortable-th]="col.sortable"
                (click)="onSort(col)">
                <div class="th-content">
                  <span>{{ col.header }}</span>
                  <i *ngIf="col.sortable" class="bi sort-icon" [ngClass]="getSortIcon(col.field)"></i>
                </div>
              </th>
              <th *ngIf="hasActions" class="text-end" style="width: 140px;">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let row of data; let i = index">
              <td *ngFor="let col of columns" [ngClass]="col.cellClass">
                <ng-container *ngIf="customCellTemplate; else defaultCell">
                  <ng-container *ngTemplateOutlet="customCellTemplate; context: { $implicit: row, col: col, index: i }"></ng-container>
                </ng-container>
                <ng-template #defaultCell>
                  {{ row[col.field] }}
                </ng-template>
              </td>

              <td *ngIf="hasActions" class="text-end">
                <ng-content select="[row-actions]"></ng-content>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state when no data and not loading -->
      <div *ngIf="!loading && (!data || data.length === 0)" class="py-4">
        <app-empty-state
          [title]="emptyTitle"
          [message]="emptyMessage"
          [icon]="emptyIcon">
        </app-empty-state>
      </div>

      <!-- Attractive Pagination Footer -->
      <app-pagination
        *ngIf="showPagination && totalItems > 0"
        [page]="currentPage"
        [limit]="pageSize"
        [total]="totalItems"
        itemName="entries"
        [showPageSize]="false"
        (pageChange)="goToPage($event)">
      </app-pagination>
    </div>
  `,
  styles: [`
    .table-container-card {
      position: relative;
      background: var(--jf-bg-card, #FFFFFF);
      border-radius: 12px;
      border: 1px solid var(--jf-border, rgba(189, 195, 199, 0.45));
      box-shadow: var(--jf-shadow-sm, 0 2px 4px rgba(44, 62, 80, 0.04));
      overflow: hidden;

      .table-loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--jf-bg-card, rgba(255, 255, 255, 0.85));
        opacity: 0.9;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .table-responsive {
        margin: 0;
        overflow-x: auto;
      }

      .sortable-th {
        cursor: pointer;
        user-select: none;

        &:hover {
          background-color: var(--jf-bg-hover, #EDF2F7) !important;
        }

        .th-content {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .sort-icon {
          font-size: 0.85rem;
          color: var(--jf-text-muted, #7F8C8D);
        }
      }

      .table-pagination-footer {
        padding: 0.9rem 1.5rem;
        border-top: 1px solid var(--jf-border, #ECF0F1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        background-color: var(--jf-bg-card, #FFFFFF);

        .pagination-info {
          font-size: 0.85rem;
          color: var(--jf-text-muted, #7F8C8D);

          span {
            font-weight: 600;
            color: var(--jf-text-primary, #2C3E50);
          }
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .page-current-indicator {
            font-size: 0.85rem;
            color: var(--jf-text-primary, #2C3E50);
            font-weight: 500;
          }
        }
      }
    }
  `]
})
export class AppTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() hasActions: boolean = false;
  @Input() customCellTemplate?: any;

  // Pagination inputs
  @Input() showPagination: boolean = true;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;
  @Input() totalPages: number = 1;

  // Empty state inputs
  @Input() emptyTitle: string = 'No records found';
  @Input() emptyMessage: string = 'Try adjusting your search filters or add a new record.';
  @Input() emptyIcon: string = 'bi-folder2-open';

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ field: string; direction: 'asc' | 'desc' }>();

  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  onSort(col: TableColumn) {
    if (!col.sortable) return;
    if (this.sortField === col.field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = col.field;
      this.sortDirection = 'asc';
    }
    this.sortChange.emit({ field: this.sortField, direction: this.sortDirection });
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  getShowingStart(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getShowingEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages || 1;
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }
}
