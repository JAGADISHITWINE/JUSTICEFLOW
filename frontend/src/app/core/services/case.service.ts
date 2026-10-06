import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Case, DashboardData, PaginatedResult } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  constructor(private api: ApiService) {}

  getCases(params?: {
    search?: string;
    status?: string;
    case_type?: string;
    client_id?: number;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResult<Case>> {
    return this.api.get<PaginatedResult<Case>>('cases', params);
  }

  getCaseById(id: number): Observable<{ success: boolean; data: Case }> {
    return this.api.get<{ success: boolean; data: Case }>(`cases/${id}`);
  }

  createCase(caseData: Partial<Case>): Observable<{ success: boolean; message: string; data: Case }> {
    return this.api.post<{ success: boolean; message: string; data: Case }>('cases', caseData);
  }

  updateCase(id: number, caseData: Partial<Case>): Observable<{ success: boolean; message: string; data: Case }> {
    return this.api.put<{ success: boolean; message: string; data: Case }>(`cases/${id}`, caseData);
  }

  deleteCase(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`cases/${id}`);
  }

  getDashboardStats(): Observable<{ success: boolean; data: DashboardData }> {
    return this.api.get<{ success: boolean; data: DashboardData }>('cases/stats/dashboard');
  }
}
