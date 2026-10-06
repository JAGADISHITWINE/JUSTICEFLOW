import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Client, PaginatedResult } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  constructor(private api: ApiService) {}

  getClients(params?: { search?: string; status?: string; page?: number; limit?: number }): Observable<PaginatedResult<Client>> {
    return this.api.get<PaginatedResult<Client>>('clients', params);
  }

  getClientById(id: number): Observable<{ success: boolean; data: Client }> {
    return this.api.get<{ success: boolean; data: Client }>(`clients/${id}`);
  }

  createClient(client: Partial<Client>): Observable<{ success: boolean; message: string; data: Client; portal_credentials?: { username: string; password: string; portalUrl: string; emailDispatched?: boolean } }> {
    return this.api.post<{ success: boolean; message: string; data: Client; portal_credentials?: { username: string; password: string; portalUrl: string; emailDispatched?: boolean } }>('clients', client);
  }

  updateClient(id: number, client: Partial<Client>): Observable<{ success: boolean; message: string; data: Client }> {
    return this.api.put<{ success: boolean; message: string; data: Client }>(`clients/${id}`, client);
  }

  deleteClient(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`clients/${id}`);
  }

  getClientStats(): Observable<{ success: boolean; data: { total_clients: number; active_clients: number; inactive_clients: number } }> {
    return this.api.get<{ success: boolean; data: any }>('clients/stats/summary');
  }

  sendClientVerificationOtp(email: string, clientName?: string): Observable<{ success: boolean; message: string; otp: string }> {
    return this.api.post<{ success: boolean; message: string; otp: string }>('clients/send-verification-otp', { email, clientName });
  }

  verifyClientEmail(email: string, otp: string, clientId?: number): Observable<{ success: boolean; verified: boolean; message: string }> {
    return this.api.post<{ success: boolean; verified: boolean; message: string }>('clients/verify-email', { email, otp, clientId });
  }
}

