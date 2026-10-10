import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="total > 0" class="jf-pagination-bar">
      <div class="jf-pagination-summary">
        <span class="summary-numbers">
          Showing <strong>{{ showingStart }}</strong> - 
          <strong>{{ showingEnd }}</strong> of 
          <strong>{{ total }}</strong> {{ itemName }}
        </span>

        <div *ngIf="showPageSize" class="jf-page-size-select">
          <label class="form-label small text-muted mb-0">Show:</label>
          <select [value]="limit" (change)="onSizeChange($event)">
            <option *ngFor="let opt of pageSizeOptions" [value]="opt">{{ opt }}</option>
          </select>
          <span class="small text-muted">per page</span>
        </div>
      </div>

      <div class="jf-pagination-nav">
        <button
          type="button"
          class="jf-page-btn btn-nav-prev"
          [disabled]="page <= 1"
          (click)="onPrev()"
          title="Previous Page">
          <i class="bi bi-chevron-left"></i>
          <span>Prev</span>
        </button>

        <ng-container *ngFor="let p of getPageNumbers()">
          <button
            *ngIf="p !== '...'; else ellipsisTpl"
            type="button"
            class="jf-page-btn"
            [class.active]="p === page"
            (click)="onPageClick(p)"
            [title]="'Go to page ' + p">
            {{ p }}
          </button>
          <ng-template #ellipsisTpl>
            <span class="jf-page-btn ellipsis">&hellip;</span>
          </ng-template>
        </ng-container>

        <button
          type="button"
          class="jf-page-btn btn-nav-next"
          [disabled]="page >= totalPages"
          (click)="onNext()"
          title="Next Page">
          <span>Next</span>
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  `
})
export class AppPaginationComponent {
  @Input() page: number = 1;
  @Input() limit: number = 10;
  @Input() total: number = 0;
  @Input() itemName: string = 'items';
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
  @Input() showPageSize: boolean = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() limitChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.total / (this.limit || 10)) || 1;
  }

  get showingStart(): number {
    if (this.total === 0) return 0;
    return ((this.page - 1) * this.limit) + 1;
  }

  get showingEnd(): number {
    return Math.min(this.page * this.limit, this.total);
  }

  getPageNumbers(): (number | string)[] {
    const total = this.totalPages;
    const current = this.page;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  onPageClick(p: number | string): void {
    if (typeof p === 'number' && p !== this.page && p >= 1 && p <= this.totalPages) {
      this.pageChange.emit(p);
    }
  }

  onPrev(): void {
    if (this.page > 1) {
      this.pageChange.emit(this.page - 1);
    }
  }

  onNext(): void {
    if (this.page < this.totalPages) {
      this.pageChange.emit(this.page + 1);
    }
  }

  onSizeChange(event: any): void {
    const val = Number(event.target.value);
    this.limitChange.emit(val);
  }
}
