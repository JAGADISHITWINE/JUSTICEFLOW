import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClientProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  status?: string;
}

export interface ClientCaseMilestone {
  name: string;
  status: string;
  date?: string;
  icon: string;
}

export interface ClientCase {
  id: number;
  case_number: string;
  case_name: string;
  case_type?: string;
  status: string;
  filing_date?: string;
  expected_close_date?: string;
  court_name?: string;
  judge_name?: string;
  lead_attorney?: string;
  attorney_email?: string;
  progression_percentage: number;
  milestones: ClientCaseMilestone[];
}

export interface ClientInvoice {
  id: number;
  invoice_number: string;
  case_id?: number;
  case_number?: string;
  case_name?: string;
  issue_date: string;
  due_date: string;
  total: number;
  amount_paid?: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  payment_link?: string;
  notes?: string;
}

export interface ClientDocument {
  id: number;
  case_id?: number;
  case_number?: string;
  case_name?: string;
  doc_name: string;
  doc_type?: string;
  file_path?: string;
  file_size?: number;
  uploader_name?: string;
  uploaded_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientPortalService {
  private readonly TOKEN_KEY = 'justiceflow_client_token';
  private readonly USER_KEY = 'justiceflow_client_user';

  private currentClientSubject = new BehaviorSubject<ClientProfile | null>(this.getStoredClient());
  public currentClient$ = this.currentClientSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  private getStoredClient(): ClientProfile | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getClientUser(): ClientProfile | null {
    return this.currentClientSubject.value;
  }

  login(email: string, password?: string): Observable<{ success: boolean; message: string; data: { token: string; client: ClientProfile } }> {
    return this.http.post<{ success: boolean; message: string; data: { token: string; client: ClientProfile } }>(
      `${environment.apiUrl}/portal/auth/login`,
      { email, password }
    ).pipe(
      tap((res) => {
        if (res.success && res.data.token) {
          localStorage.setItem(this.TOKEN_KEY, res.data.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data.client));
          this.currentClientSubject.next(res.data.client);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentClientSubject.next(null);
  }

  getProfileStats(): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(
      `${environment.apiUrl}/portal/me`,
      { headers: this.getAuthHeaders() }
    );
  }

  getCases(): Observable<{ success: boolean; data: ClientCase[] }> {
    return this.http.get<{ success: boolean; data: ClientCase[] }>(
      `${environment.apiUrl}/portal/cases`,
      { headers: this.getAuthHeaders() }
    );
  }

  getInvoices(): Observable<{ success: boolean; data: ClientInvoice[] }> {
    return this.http.get<{ success: boolean; data: ClientInvoice[] }>(
      `${environment.apiUrl}/portal/invoices`,
      { headers: this.getAuthHeaders() }
    );
  }

  getDocuments(): Observable<{ success: boolean; data: ClientDocument[] }> {
    return this.http.get<{ success: boolean; data: ClientDocument[] }>(
      `${environment.apiUrl}/portal/documents`,
      { headers: this.getAuthHeaders() }
    );
  }

  uploadDocument(docData: { doc_name: string; doc_type?: string; case_id?: number }): Observable<{ success: boolean; message: string; data: ClientDocument }> {
    return this.http.post<{ success: boolean; message: string; data: ClientDocument }>(
      `${environment.apiUrl}/portal/documents/upload`,
      docData,
      { headers: this.getAuthHeaders() }
    );
  }
}
