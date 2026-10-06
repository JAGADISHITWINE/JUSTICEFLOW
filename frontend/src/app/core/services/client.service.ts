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

  createClient(client: Partial<Client>): Observable<{ success: boolean; message: string; data: Client }> {
    return this.api.post<{ success: boolean; message: string; data: Client }>('clients', client);
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
}
