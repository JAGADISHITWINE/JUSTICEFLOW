import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { RetainerAgreement } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RetainerService {
  constructor(private api: ApiService) {}

  getRetainers(filters?: { case_id?: number; client_id?: number; status?: string }): Observable<{ success: boolean; data: RetainerAgreement[] }> {
    return this.api.get<{ success: boolean; data: RetainerAgreement[] }>('cases/retainers', filters);
  }

  getRetainerById(id: number): Observable<{ success: boolean; data: RetainerAgreement }> {
    return this.api.get<{ success: boolean; data: RetainerAgreement }>(`cases/retainers/${id}`);
  }

  createRetainer(data: Partial<RetainerAgreement>): Observable<{ success: boolean; message: string; data: RetainerAgreement }> {
    return this.api.post<{ success: boolean; message: string; data: RetainerAgreement }>('cases/retainers', data);
  }

  createRevision(id: number, data: Partial<RetainerAgreement>): Observable<{ success: boolean; message: string; data: RetainerAgreement }> {
    return this.api.post<{ success: boolean; message: string; data: RetainerAgreement }>(`cases/retainers/${id}/revision`, data);
  }

  signAgreement(id: number, data: { signature_data: string; signer_name: string; signer_email: string }): Observable<{ success: boolean; message: string; data: RetainerAgreement }> {
    return this.api.post<{ success: boolean; message: string; data: RetainerAgreement }>(`cases/retainers/${id}/sign`, data);
  }

  updateStatus(id: number, status: string): Observable<{ success: boolean; message: string; data: RetainerAgreement }> {
    return this.api.put<{ success: boolean; message: string; data: RetainerAgreement }>(`cases/retainers/${id}/status`, { status });
  }

  deleteRetainer(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`cases/retainers/${id}`);
  }

  getPdfUrl(id: number): string {
    return `${environment.apiUrl}/cases/retainers/${id}/pdf`;
  }
}
