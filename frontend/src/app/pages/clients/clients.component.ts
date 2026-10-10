import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { NotificationService } from '../../core/services/notification.service';
import { Client, PaginationMeta } from '../../core/models/models';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppTableComponent, TableColumn } from '../../shared/components/table/table.component';
import { AppBadgeComponent } from '../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppModalComponent } from '../../shared/components/modal/modal.component';
import { ClientFormComponent } from './client-form.component';
import { AppPaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppCardComponent,
    AppTableComponent,
    AppBadgeComponent,
    AppButtonComponent,
    AppModalComponent,
    ClientFormComponent,
    AppPaginationComponent
  ],
  template: `
    <div class="clients-page">
      <!-- Page Title & Header Actions -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">Client Directory</h2>
          <p class="text-muted small mb-0">Manage law firm corporate and private client retainers</p>
        </div>
        <div class="d-flex gap-2">
          <app-button
            label="Add New Client"
            icon="bi-person-plus-fill"
            variant="secondary"
            (btnClick)="openAddModal()">
          </app-button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="filters-card p-3 mb-4 bg-white rounded-3 border">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search by client name, email, phone, city..."
                [(ngModel)]="searchQuery"
                (keyup.enter)="loadClients()"
              />
            </div>
          </div>

          <div class="col-6 col-md-3">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="loadClients()">
              <option value="All">All Statuses</option>
              <option value="Active">Active Retainers</option>
              <option value="Inactive">Inactive / Archived</option>
            </select>
          </div>

          <div class="col-6 col-md-4 text-end">
            <button class="btn btn-outline-secondary me-2" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
            <button class="btn btn-primary" (click)="loadClients()">
              <i class="bi bi-funnel-fill"></i> Filter
            </button>
          </div>
        </div>
      </div>

      <!-- Clients Data Table -->
      <app-card [noPadding]="true">
        <div class="table-responsive">
          <table class="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Contact Details</th>
                <th>Location</th>
                <th>Active Matters</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let client of clients">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="client-avatar">
                      {{ getInitials(client.name) }}
                    </div>
                    <div>
                      <strong class="text-dark d-block">{{ client.name }}</strong>
                      <span class="text-muted small">Assigned: {{ client.assigned_lawyer || 'General Firm' }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="small">
                    <div>
                      <i class="bi bi-envelope text-muted me-1"></i> {{ client.email || 'No email' }}
                      <span *ngIf="client.is_email_verified" class="badge bg-success-subtle text-success border border-success ms-1 px-1 py-0" style="font-size: 0.68rem;" title="Email Verified">
                        <i class="bi bi-patch-check-fill"></i> Verified
                      </span>
                    </div>
                    <div><i class="bi bi-telephone text-muted me-1"></i> {{ client.phone || 'No phone' }}</div>
                  </div>
                </td>
                <td>
                  <span class="small text-muted">{{ client.city || 'N/A' }}, {{ client.state || 'N/A' }}</span>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">
                    <i class="bi bi-folder2-open me-1 text-primary"></i>
                    {{ client.case_count || 0 }} Matters
                  </span>
                </td>
                <td>
                  <app-badge [status]="client.status"></app-badge>
                </td>
                <td class="text-end">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-secondary" (click)="openEditModal(client)" title="Edit Client">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(client)" title="Delete Client">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="!loading && clients.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-people display-6 d-block mb-2 text-muted"></i>
                  No clients found matching your query.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Unified Modern JusticeFlow Pagination -->
        <app-pagination
          [page]="pagination.page"
          [limit]="pagination.limit"
          [total]="pagination.total"
          itemName="clients"
          [pageSizeOptions]="[5, 10, 20, 50]"
          (pageChange)="changePage($event)"
          (limitChange)="onLimitChange($event)">
        </app-pagination>
      </app-card>

      <!-- Client Form Modal -->
      <app-client-form
        [isOpen]="isModalOpen"
        [client]="selectedClient"
        [saving]="saving"
        (save)="saveClient($event)"
        (cancel)="isModalOpen = false">
      </app-client-form>

      <!-- Client Portal Credentials Onboarding Modal -->
      <app-modal
        [isOpen]="showCredentialsModal"
        title="Client Retained - Portal Credentials"
        icon="bi-shield-lock-fill"
        size="md"
        (close)="showCredentialsModal = false">
        <div class="p-2">
          <div class="alert alert-success d-flex align-items-center mb-3">
            <i class="bi bi-check-circle-fill me-2 fs-4"></i>
            <div>
              <strong>Client Retained Successfully!</strong>
              <div class="small">The client record is active. Here are their access credentials for the Client Portal:</div>
            </div>
          </div>

          <div class="card bg-light border p-3 mb-3">
            <div class="mb-2 pb-2 border-bottom">
              <label class="text-muted small fw-semibold d-block">Client Portal Login URL</label>
              <div class="d-flex align-items-center justify-content-between">
                <code class="text-primary fw-bold">/portal/login</code>
                <a routerLink="/portal/login" target="_blank" class="btn btn-sm btn-outline-primary py-0">Open Portal</a>
              </div>
            </div>
            <div class="mb-2 pb-2 border-bottom">
              <label class="text-muted small fw-semibold d-block">Client Username (Email)</label>
              <div class="fw-bold text-dark fs-6">{{ newClientCredentials?.username }}</div>
            </div>
            <div class="mb-1">
              <label class="text-muted small fw-semibold d-block">Initial Access Password</label>
              <div class="d-flex align-items-center gap-2">
                <code class="fs-6 fw-bold bg-white px-3 py-1 border rounded text-dark">{{ newClientCredentials?.password }}</code>
                <span class="badge bg-secondary-subtle text-secondary border">Auto-Generated</span>
              </div>
            </div>
          </div>

          <div *ngIf="newClientCredentials?.emailDispatched" class="alert alert-info py-2 small mb-0">
            <i class="bi bi-envelope-check-fill me-1 text-primary"></i>
            A welcome email containing these credentials and portal instructions has been dispatched to <strong>{{ newClientCredentials?.username }}</strong>.
          </div>
          <div *ngIf="!newClientCredentials?.emailDispatched" class="alert alert-warning py-2 small mb-0">
            <i class="bi bi-info-circle-fill me-1"></i>
            You can copy and securely share these credentials directly with your client (or configure your SMTP settings in <code>backend/.env</code> to send automated emails).
          </div>
        </div>

        <div modal-footer>
          <button class="btn btn-primary" (click)="showCredentialsModal = false">
            <i class="bi bi-check-lg me-1"></i>Got It / Done
          </button>
        </div>
      </app-modal>

      <!-- Delete Confirmation Modal -->
      <app-modal
        [isOpen]="isDeleteModalOpen"
        title="Confirm Client Removal"
        icon="bi-exclamation-triangle-fill"
        size="sm"
        (close)="isDeleteModalOpen = false">
        <p class="text-dark">
          Are you sure you want to remove <strong>{{ clientToDelete?.name }}</strong>?
          All associated cases and records will also be impacted.
        </p>
        <div modal-footer>
          <button class="btn btn-outline-secondary" (click)="isDeleteModalOpen = false">Cancel</button>
          <button class="btn btn-danger" [disabled]="deleting" (click)="executeDelete()">
            <span *ngIf="deleting" class="spinner-border spinner-border-sm me-1"></span>
            Delete Client
          </button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .clients-page {
      .page-title {
        font-size: 1.65rem;
        color: #2C3E50;
      }

      .client-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: rgba(52, 152, 219, 0.15);
        color: #3498DB;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.8rem;
      }
    }
  `]
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;

  searchQuery: string = '';
  statusFilter: string = 'All';

  pagination: PaginationMeta = {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1
  };

  isModalOpen: boolean = false;
  selectedClient: Client | null = null;

  isDeleteModalOpen: boolean = false;
  clientToDelete: Client | null = null;

  // New Client Portal Credentials Modal State
  showCredentialsModal: boolean = false;
  newClientCredentials: any = null;

  constructor(
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  changePage(page: number): void {
    this.pagination.page = page;
    this.loadClients();
  }

  onLimitChange(limit: number): void {
    this.pagination.limit = limit;
    this.pagination.page = 1;
    this.loadClients();
  }

  onPageSizeChange() {
    this.pagination.page = 1;
    this.loadClients();
  }

  getShowingEndCount(): number {
    return Math.min(this.pagination.page * this.pagination.limit, this.pagination.total);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.pagination.totalPages || 1;
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  loadClients() {
    this.loading = true;
    this.clientService
      .getClients({
        search: this.searchQuery,
        status: this.statusFilter,
        page: this.pagination.page,
        limit: this.pagination.limit
      })
      .subscribe({
        next: res => {
          this.clients = res.data;
          this.pagination = res.pagination;
          this.loading = false;
        },
        error: err => {
          this.notificationService.error('Failed to load clients.');
          this.loading = false;
        }
      });
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.pagination.page = 1;
    this.loadClients();
  }

  openAddModal() {
    this.selectedClient = null;
    this.isModalOpen = true;
  }

  openEditModal(client: Client) {
    this.selectedClient = { ...client };
    this.isModalOpen = true;
  }

  saveClient(clientData: Partial<Client>) {
    this.saving = true;
    if (this.selectedClient && this.selectedClient.id) {
      this.clientService.updateClient(this.selectedClient.id, clientData).subscribe({
        next: () => {
          this.saving = false;
          this.isModalOpen = false;
          this.notificationService.success('Client updated successfully.');
          this.loadClients();
        },
        error: err => {
          this.saving = false;
          this.notificationService.error(err.message || 'Failed to update client.');
        }
      });
    } else {
      this.clientService.createClient(clientData).subscribe({
        next: res => {
          this.saving = false;
          this.isModalOpen = false;
          this.notificationService.success('Client retained successfully.');
          this.loadClients();
          if (res.portal_credentials) {
            this.newClientCredentials = res.portal_credentials;
            this.showCredentialsModal = true;
          }
        },
        error: err => {
          this.saving = false;
          this.notificationService.error(err.message || 'Failed to create client.');
        }
      });
    }
  }

  confirmDelete(client: Client) {
    this.clientToDelete = client;
    this.isDeleteModalOpen = true;
  }

  executeDelete() {
    if (!this.clientToDelete || !this.clientToDelete.id) return;
    this.deleting = true;
    this.clientService.deleteClient(this.clientToDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.isDeleteModalOpen = false;
        this.notificationService.success('Client deleted successfully.');
        this.loadClients();
      },
      error: err => {
        this.deleting = false;
        this.notificationService.error(err.message || 'Failed to delete client.');
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'CL';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
}
