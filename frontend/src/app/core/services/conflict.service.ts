import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ConflictCheckRecord } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConflictService {
  constructor(private api: ApiService) {}

  runConflictCheck(data: {
    prospectiveClient: string;
    matterType?: string;
    adverseParties?: string;
    corporateAffiliates?: string;
    opposingCounsel?: string;
    witnesses?: string;
  }): Observable<{ success: boolean; message: string; data: ConflictCheckRecord }> {
    return this.api.post('clients/conflict-check', data);
  }

  getConflictHistory(): Observable<{
    success: boolean;
    stats: { totalChecks: number; cleared: number; potential: number; directConflict: number };
    data: ConflictCheckRecord[];
  }> {
    return this.api.get('clients/conflict-check/history');
  }

  getConflictById(id: number | string): Observable<{ success: boolean; data: ConflictCheckRecord }> {
    return this.api.get(`clients/conflict-check/${id}`);
  }

  getCertificateUrl(id: number | string): string {
    return `${environment.apiUrl}/clients/conflict-check/${id}/certificate-pdf`;
  }
}
