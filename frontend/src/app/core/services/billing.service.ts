import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BillingSummary, Invoice, PaginatedResult, TrustAccount, TrustTransaction } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  constructor(private api: ApiService) {}

  getInvoices(params?: {
    search?: string;
    status?: string;
    client_id?: number;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResult<Invoice>> {
    return this.api.get<PaginatedResult<Invoice>>('billing/invoices', params);
  }

  getInvoiceById(id: number): Observable<{ success: boolean; data: Invoice }> {
    return this.api.get<{ success: boolean; data: Invoice }>(`billing/invoices/${id}`);
  }

  createInvoice(invoice: Partial<Invoice>): Observable<{ success: boolean; message: string; data: Invoice }> {
    return this.api.post<{ success: boolean; message: string; data: Invoice }>('billing/invoices', invoice);
  }

  generateFromUnbilledTime(payload: { case_id: number; due_date?: string; notes?: string }): Observable<{ success: boolean; message: string; data: Invoice }> {
    return this.api.post<{ success: boolean; message: string; data: Invoice }>('billing/invoices/generate-from-time', payload);
  }

  recordPayment(id: number, payment: { amount: number; payment_method?: string; stripe_payment_id?: string }): Observable<{ success: boolean; message: string; data: Invoice }> {
    return this.api.post<{ success: boolean; message: string; data: Invoice }>(`billing/invoices/${id}/pay`, payment);
  }

  updateStatus(id: number, status: string): Observable<{ success: boolean; data: Invoice }> {
    return this.api.put<{ success: boolean; data: Invoice }>(`billing/invoices/${id}/status`, { status });
  }

  deleteInvoice(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`billing/invoices/${id}`);
  }

  getInvoicePdfUrl(id: number): string {
    return `${environment.apiUrl}/billing/invoices/${id}/pdf`;
  }

  // --- IOLTA Trust Accounts ---
  getTrustAccounts(): Observable<{ success: boolean; data: TrustAccount[] }> {
    return this.api.get<{ success: boolean; data: TrustAccount[] }>('billing/trust-accounts');
  }

  getTrustTransactions(accountId: number): Observable<{ success: boolean; data: TrustTransaction[] }> {
    return this.api.get<{ success: boolean; data: TrustTransaction[] }>(`billing/trust-accounts/${accountId}/transactions`);
  }

  recordTrustTransaction(transaction: Partial<TrustTransaction> & { client_id?: number }): Observable<{ success: boolean; message: string; data: any }> {
    return this.api.post<{ success: boolean; message: string; data: any }>('billing/trust-accounts/transaction', transaction);
  }

  getSummary(): Observable<{ success: boolean; data: BillingSummary }> {
    return this.api.get<{ success: boolean; data: BillingSummary }>('billing/stats/summary');
  }
}
