import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CalendarEvent, RuleDeadlinePreview } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  constructor(private api: ApiService) {}

  getEvents(filters?: {
    case_id?: number;
    event_type?: string;
    start_date?: string;
    end_date?: string;
    is_sol?: boolean;
  }): Observable<{ success: boolean; data: CalendarEvent[] }> {
    return this.api.get<{ success: boolean; data: CalendarEvent[] }>('calendar/events', filters);
  }

  getEventById(id: number): Observable<{ success: boolean; data: CalendarEvent }> {
    return this.api.get<{ success: boolean; data: CalendarEvent }>(`calendar/events/${id}`);
  }

  createEvent(event: Partial<CalendarEvent>): Observable<{ success: boolean; message: string; data: CalendarEvent }> {
    return this.api.post<{ success: boolean; message: string; data: CalendarEvent }>('calendar/events', event);
  }

  updateEvent(id: number, event: Partial<CalendarEvent>): Observable<{ success: boolean; message: string; data: CalendarEvent }> {
    return this.api.put<{ success: boolean; message: string; data: CalendarEvent }>(`calendar/events/${id}`, event);
  }

  deleteEvent(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`calendar/events/${id}`);
  }

  calculateDeadlines(payload: {
    ruleKey: string;
    triggerDate: string;
    caseId?: number;
    clientId?: number;
  }): Observable<{
    success: boolean;
    ruleName: string;
    description: string;
    triggerDate: string;
    calculatedCount: number;
    deadlines: RuleDeadlinePreview[];
  }> {
    return this.api.post('calendar/calculate-deadlines', payload);
  }

  applyDeadlines(payload: {
    deadlines: RuleDeadlinePreview[];
    caseId?: number;
    clientId?: number;
  }): Observable<{ success: boolean; message: string; data: CalendarEvent[] }> {
    return this.api.post('calendar/apply-deadlines', payload);
  }

  getUpcomingAlerts(): Observable<{ success: boolean; count: number; data: CalendarEvent[] }> {
    return this.api.get<{ success: boolean; count: number; data: CalendarEvent[] }>('calendar/alerts/upcoming');
  }

  sendCourtReminder(id: number, data: { channel?: string; alertTier?: string }): Observable<{ success: boolean; message: string; details: any }> {
    return this.api.post(`calendar/alerts/${id}/send`, data);
  }

  getIcsExportUrl(): string {
    return `${environment.apiUrl}/calendar/export.ics`;
  }

  getSingleEventIcsUrl(id: number): string {
    return `${environment.apiUrl}/calendar/events/${id}/ics`;
  }
}
