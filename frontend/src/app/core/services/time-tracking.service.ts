import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResult, TimeEntry } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TimeTrackingService {
  constructor(private api: ApiService) {}

  getTimeEntries(params?: {
    case_id?: number;
    user_id?: number;
    start_date?: string;
    end_date?: string;
    is_billable?: boolean;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResult<TimeEntry>> {
    return this.api.get<PaginatedResult<TimeEntry>>('time-entries', params);
  }

  getTimeEntryById(id: number): Observable<{ success: boolean; data: TimeEntry }> {
    return this.api.get<{ success: boolean; data: TimeEntry }>(`time-entries/${id}`);
  }

  logTime(entry: Partial<TimeEntry>): Observable<{ success: boolean; message: string; data: TimeEntry }> {
    return this.api.post<{ success: boolean; message: string; data: TimeEntry }>('time-entries', entry);
  }

  updateTimeEntry(id: number, entry: Partial<TimeEntry>): Observable<{ success: boolean; message: string; data: TimeEntry }> {
    return this.api.put<{ success: boolean; message: string; data: TimeEntry }>(`time-entries/${id}`, entry);
  }

  deleteTimeEntry(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`time-entries/${id}`);
  }

  getSummary(): Observable<{ success: boolean; data: any }> {
    return this.api.get<{ success: boolean; data: any }>('time-entries/stats/summary');
  }
}
