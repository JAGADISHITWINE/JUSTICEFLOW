import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../core/services/calendar.service';
import { CaseService } from '../../core/services/case.service';
import { ClientService } from '../../core/services/client.service';
import { NotificationService } from '../../core/services/notification.service';
import { CalendarEvent, Case, Client, RuleDeadlinePreview } from '../../core/models/models';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppBadgeComponent } from '../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';
import { AppModalComponent } from '../../shared/components/modal/modal.component';
import { AppFormInputComponent } from '../../shared/components/form-input/form-input.component';
import { AppFormSelectComponent, SelectOption } from '../../shared/components/form-select/form-select.component';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppCardComponent,
    AppBadgeComponent,
    AppButtonComponent,
    AppModalComponent,
    AppFormInputComponent,
    AppFormSelectComponent
  ],
  template: `
    <div class="calendar-page">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">Interactive Court Calendar & Deadlines</h2>
          <p class="text-muted small mb-0">Master court docket, jurisdiction-triggered statutory deadlines, and 2-way sync with Outlook/Google</p>
        </div>
        <div class="d-flex gap-2">
          <app-button
            label="2-Way Sync (.ics)"
            icon="bi-arrow-repeat"
            variant="outline"
            (btnClick)="openSyncModal()">
          </app-button>
          <app-button
            label="Rule Deadline Calculator"
            icon="bi-calculator"
            variant="secondary"
            (btnClick)="openRuleCalcModal()">
          </app-button>
          <app-button
            label="Schedule Court Event"
            icon="bi-calendar-plus"
            variant="primary"
            (btnClick)="openNewEventModal()">
          </app-button>
        </div>
      </div>

      <!-- Court Alerts Bar (If any within 7 days) -->
      <div class="alert alert-court-reminder mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3" *ngIf="urgentAlerts.length > 0">
        <div class="d-flex align-items-center gap-3">
          <div class="alert-bell-icon">
            <i class="bi bi-bell-fill text-warning fs-4"></i>
          </div>
          <div>
            <div class="fw-bold text-dark">Upcoming Court Appearances & Jurisdictional Deadlines ({{ urgentAlerts.length }})</div>
            <div class="small text-muted">
              Next up: <strong>{{ urgentAlerts[0].title }}</strong> &bull;
              {{ urgentAlerts[0].start_time | date:'medium' }} &bull;
              <span class="badge bg-danger">{{ urgentAlerts[0].urgency }}</span>
            </div>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-dark" (click)="showAllAlerts = !showAllAlerts">
            {{ showAllAlerts ? 'Hide Details' : 'View All Alerts (' + urgentAlerts.length + ')' }}
          </button>
          <button class="btn btn-sm btn-primary" (click)="triggerTestAlert(urgentAlerts[0])">
            <i class="bi bi-send me-1"></i> Send Test Alert
          </button>
        </div>
      </div>

      <!-- Expanded Alerts List -->
      <div class="mb-4 bg-white border rounded-3 p-3 shadow-sm" *ngIf="showAllAlerts && urgentAlerts.length > 0">
        <h6 class="fw-bold mb-3"><i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>Court Automated Reminders (7-Day, 48-Hour & 2-Hour Window)</h6>
        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Event / Docket Item</th>
                <th>Case</th>
                <th>Appearance Time</th>
                <th>Location / Courtroom</th>
                <th>Lead Counsel</th>
                <th>Alert Stage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let alert of urgentAlerts">
                <td class="fw-semibold">
                  <span *ngIf="alert.is_statute_of_limitations" class="badge bg-danger me-1">SOL BAR</span>
                  {{ alert.title }}
                </td>
                <td>{{ alert.case_number || 'General' }}</td>
                <td>{{ alert.start_time | date:'short' }}</td>
                <td>{{ alert.court_room || alert.location || 'SDNY Courtroom' }}</td>
                <td>{{ alert.attorney_name || 'Alexander Vance, Esq.' }}</td>
                <td><span class="badge bg-warning text-dark">{{ alert.urgency }}</span></td>
                <td>
                  <button class="btn btn-xs btn-outline-primary" (click)="triggerTestAlert(alert)">
                    Send Alert Now
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Calendar Controls & Filters -->
      <app-card>
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <!-- Month Navigation -->
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary" (click)="previousMonth()">
              <i class="bi bi-chevron-left"></i>
            </button>
            <h4 class="mb-0 fw-bold calendar-month-title text-primary">
              {{ currentMonthName }} {{ currentYear }}
            </h4>
            <button class="btn btn-sm btn-outline-secondary" (click)="nextMonth()">
              <i class="bi bi-chevron-right"></i>
            </button>
            <button class="btn btn-sm btn-light border ms-2" (click)="goToToday()">
              Today
            </button>
          </div>

          <!-- View Switcher -->
          <div class="d-flex align-items-center gap-2">
            <div class="btn-group btn-group-sm" role="group">
              <button
                type="button"
                class="btn"
                [class.btn-primary]="activeView === 'month'"
                [class.btn-outline-primary]="activeView !== 'month'"
                (click)="activeView = 'month'">
                <i class="bi bi-grid-3x3 me-1"></i> Month
              </button>
              <button
                type="button"
                class="btn"
                [class.btn-primary]="activeView === 'agenda'"
                [class.btn-outline-primary]="activeView !== 'agenda'"
                (click)="activeView = 'agenda'">
                <i class="bi bi-list-ul me-1"></i> Docket Agenda
              </button>
            </div>

            <!-- Filter by Event Type -->
            <select class="form-select form-select-sm" style="width: 170px;" [(ngModel)]="filterType" (change)="applyFilters()">
              <option value="">All Event Types</option>
              <option value="Trial">Trials</option>
              <option value="Hearing">Hearings</option>
              <option value="Deposition">Depositions</option>
              <option value="Filing Deadline">Filing Deadlines</option>
              <option value="Discovery Cutoff">Discovery Cutoff</option>
              <option value="Client Meeting">Client Meetings</option>
            </select>
          </div>
        </div>

        <!-- Month Grid View -->
        <div *ngIf="activeView === 'month'" class="calendar-grid-container">
          <!-- Weekday Headers -->
          <div class="calendar-grid-header">
            <div *ngFor="let dayName of weekDayNames" class="weekday-header-cell">
              {{ dayName }}
            </div>
          </div>

          <!-- Calendar Day Cells -->
          <div class="calendar-grid-body">
            <div
              *ngFor="let day of calendarDays"
              class="calendar-day-cell"
              [class.not-current-month]="!day.isCurrentMonth"
              [class.is-today]="day.isToday">
              <div class="day-number-header d-flex justify-content-between">
                <span class="day-num">{{ day.date.getDate() }}</span>
                <span *ngIf="day.events.length > 0" class="badge rounded-pill bg-light text-dark border">
                  {{ day.events.length }}
                </span>
              </div>
              <div class="day-events-list">
                <div
                  *ngFor="let ev of day.events.slice(0, 3)"
                  class="calendar-event-chip"
                  [ngClass]="getEventChipClass(ev)"
                  (click)="viewEventDetails(ev)">
                  <i class="bi" [ngClass]="getEventIcon(ev.event_type)"></i>
                  <span class="chip-title">{{ ev.title }}</span>
                </div>
                <div *ngIf="day.events.length > 3" class="more-events text-muted small" (click)="viewMoreDayEvents(day)">
                  +{{ day.events.length - 3 }} more...
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Agenda List View -->
        <div *ngIf="activeView === 'agenda'" class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Date & Time</th>
                <th>Event Type</th>
                <th>Title / Court Proceeding</th>
                <th>Case & Client</th>
                <th>Courtroom & Judge</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ev of filteredEvents">
                <td class="text-nowrap">
                  <div class="fw-bold">{{ ev.start_time | date:'mediumDate' }}</div>
                  <div class="small text-muted">{{ ev.start_time | date:'shortTime' }}</div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getBadgeClass(ev.event_type)">
                    {{ ev.event_type }}
                  </span>
                </td>
                <td>
                  <div class="fw-semibold">
                    <span *ngIf="ev.is_statute_of_limitations" class="badge bg-danger me-1">SOL BAR</span>
                    {{ ev.title }}
                  </div>
                  <div class="small text-muted" *ngIf="ev.notes">{{ ev.notes }}</div>
                </td>
                <td>
                  <div class="fw-medium text-primary">{{ ev.case_number || 'General Legal' }}</div>
                  <div class="small text-muted">{{ ev.client_name || 'N/A' }}</div>
                </td>
                <td>
                  <div *ngIf="ev.court_room"><i class="bi bi-bank me-1"></i>{{ ev.court_room }}</div>
                  <div class="small text-muted" *ngIf="ev.judge_name">{{ ev.judge_name }}</div>
                  <div class="small text-muted" *ngIf="!ev.court_room && !ev.judge_name">{{ ev.location || 'Law Firm Conf Rm' }}</div>
                </td>
                <td>
                  <span class="badge" [ngClass]="{'bg-danger': ev.priority === 'Critical', 'bg-warning text-dark': ev.priority === 'High', 'bg-secondary': ev.priority !== 'Critical' && ev.priority !== 'High'}">
                    {{ ev.priority || 'Normal' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <a [href]="calendarService.getSingleEventIcsUrl(ev.id!)" class="btn btn-outline-secondary" title="Export .ics">
                      <i class="bi bi-download"></i>
                    </a>
                    <button class="btn btn-outline-danger" (click)="deleteEvent(ev)" title="Remove">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredEvents.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  No scheduled court hearings or statutory deadlines match the criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-card>

      <!-- MODAL 1: Rule-Based Statutory Deadline Generator -->
      <app-modal
        [isOpen]="isRuleModalOpen"
        title="Rule-Based Statutory Deadline Trigger Calculator"
        (close)="isRuleModalOpen = false"
        (closed)="isRuleModalOpen = false">
        <div class="p-3">
          <p class="text-muted small">
            Calculate Indian court filing deadlines automatically based on statutory procedures (e.g., Commercial Courts Act 2015, Order VIII Rule 1 CPC, Section 138 NI Act, and Section 34 Arbitration Act).
          </p>

          <div class="row g-3 mb-3">
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Indian Jurisdictional Rule Trigger</label>
              <select class="form-select form-select-sm" [(ngModel)]="ruleKey" (change)="onRuleSelected()">
                <option value="COMMERCIAL_SUIT_SUMMONS_SERVED">Commercial Suit Summons Served (Order VIII Rule 1 CPC / Commercial Courts Act)</option>
                <option value="SECTION_138_NI_ACT_CHEQUE_BOUNCE">Dishonour of Cheque (Section 138 & 142 Negotiable Instruments Act)</option>
                <option value="ARBITRATION_AWARD_SECTION_34">Arbitral Award Challenge (Section 34 Arbitration & Conciliation Act 1996)</option>
                <option value="LIMITATION_ACT_MONEY_RECOVERY">Money Recovery / Breach of Contract (Limitation Act 1963 & Section 12A Mediation)</option>
                <option value="HIGH_COURT_APPEAL_AND_SLP">High Court Appeal (RFA) & Supreme Court SLP (Art. 136)</option>
                <option value="INTERIM_INJUNCTION_ORDER_39">Ex-Parte Ad-Interim Injunction Granted (Order XXXIX Rules 3 & 3A CPC)</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Trigger / Service Date</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="triggerDate">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Associate With Case</label>
              <select class="form-select form-select-sm" [(ngModel)]="selectedCaseId">
                <option [ngValue]="null">Select Case...</option>
                <option *ngFor="let c of caseList" [ngValue]="c.id">
                  {{ c.case_number }} - {{ c.case_name }}
                </option>
              </select>
            </div>
            <div class="col-12 col-md-6 d-flex align-items-end">
              <button class="btn btn-secondary btn-sm w-100" (click)="calculateRuleDeadlines()" [disabled]="!triggerDate">
                <i class="bi bi-cpu me-1"></i> Calculate Deadlines
              </button>
            </div>
          </div>

          <!-- Calculated Deadlines Preview Table -->
          <div *ngIf="calculatedDeadlines.length > 0" class="border rounded-3 p-2 bg-light mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-bold small text-primary">{{ calculatedRuleName }} ({{ calculatedDeadlines.length }} deadlines calculated)</span>
              <span class="badge bg-info text-dark">Auto-Scheduled at 5:00 PM Court Close</span>
            </div>
            <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
              <table class="table table-sm align-middle mb-0 bg-white">
                <thead class="table-light">
                  <tr>
                    <th>Calculated Date</th>
                    <th>Offset</th>
                    <th>Statutory Action</th>
                    <th>Type</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of calculatedDeadlines">
                    <td class="fw-semibold text-nowrap">{{ item.start_time | date:'mediumDate' }}</td>
                    <td><span class="badge bg-light text-dark border">+{{ item.offsetDays }}d</span></td>
                    <td>
                      <div class="fw-semibold">{{ item.title }}</div>
                      <div class="small text-muted">{{ item.notes }}</div>
                    </td>
                    <td><span class="badge bg-secondary">{{ item.event_type }}</span></td>
                    <td>
                      <span class="badge" [ngClass]="{'bg-danger': item.priority === 'Critical', 'bg-warning text-dark': item.priority === 'High'}">
                        {{ item.priority }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 pt-2 border-top">
            <button class="btn btn-sm btn-light border" (click)="isRuleModalOpen = false">Cancel</button>
            <button
              class="btn btn-sm btn-primary"
              [disabled]="calculatedDeadlines.length === 0"
              (click)="applyDeadlinesToDocket()">
              <i class="bi bi-calendar-check me-1"></i> Docket All {{ calculatedDeadlines.length }} Deadlines
            </button>
          </div>
        </div>
      </app-modal>

      <!-- MODAL 2: 2-Way Sync (.ics) for Outlook 365, Google Calendar & Apple iCal -->
      <app-modal
        [isOpen]="isSyncModalOpen"
        title="2-Way Court Calendar Synchronization"
        (close)="isSyncModalOpen = false"
        (closed)="isSyncModalOpen = false">
        <div class="p-3">
          <div class="text-center mb-4">
            <i class="bi bi-arrow-repeat text-primary display-4"></i>
            <h5 class="fw-bold mt-2">Subscribe to Live Court Calendar</h5>
            <p class="text-muted small">
              Keep your hearings and court deadlines synchronized in real-time across Microsoft Outlook 365, Google Calendar, and Apple iCal via RFC 5545 .ics feed.
            </p>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold small">Live iCalendar Feed URL</label>
            <div class="input-group">
              <input type="text" class="form-control form-control-sm font-monospace" [value]="calendarService.getIcsExportUrl()" readonly #feedInput>
              <button class="btn btn-sm btn-outline-secondary" (click)="copyIcsUrl(feedInput.value)">
                <i class="bi bi-clipboard me-1"></i> Copy
              </button>
            </div>
            <div class="form-text">Paste this URL into Outlook (Add Calendar -> From Internet) or Google Calendar (Other calendars -> From URL).</div>
          </div>

          <div class="row g-3 mb-4">
            <div class="col-4 text-center">
              <div class="border rounded p-2 h-100">
                <i class="bi bi-microsoft text-primary fs-3"></i>
                <div class="fw-bold small mt-1">Outlook 365</div>
                <div class="text-muted" style="font-size: 11px;">Instant sync</div>
              </div>
            </div>
            <div class="col-4 text-center">
              <div class="border rounded p-2 h-100">
                <i class="bi bi-google text-danger fs-3"></i>
                <div class="fw-bold small mt-1">Google Cal</div>
                <div class="text-muted" style="font-size: 11px;">Automated polling</div>
              </div>
            </div>
            <div class="col-4 text-center">
              <div class="border rounded p-2 h-100">
                <i class="bi bi-apple text-dark fs-3"></i>
                <div class="fw-bold small mt-1">Apple iCal</div>
                <div class="text-muted" style="font-size: 11px;">Push notification</div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center pt-3 border-top">
            <a [href]="calendarService.getIcsExportUrl()" class="btn btn-sm btn-outline-primary" download="justiceflow_court_calendar.ics">
              <i class="bi bi-download me-1"></i> Download .ics File
            </a>
            <button class="btn btn-sm btn-secondary" (click)="isSyncModalOpen = false">Done</button>
          </div>
        </div>
      </app-modal>

      <!-- MODAL 3: Schedule New Court Event -->
      <app-modal
        [isOpen]="isNewEventModalOpen"
        title="Schedule Court Appearance or Event"
        (close)="isNewEventModalOpen = false"
        (closed)="isNewEventModalOpen = false">
        <div class="p-3">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label fw-semibold small">Proceeding / Event Title *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="newEvent.title" placeholder="e.g. Oral Arguments on Motion to Dismiss">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Event Type</label>
              <select class="form-select form-select-sm" [(ngModel)]="newEvent.event_type">
                <option value="Trial">Trial</option>
                <option value="Hearing">Hearing</option>
                <option value="Deposition">Deposition</option>
                <option value="Filing Deadline">Filing Deadline</option>
                <option value="Discovery Cutoff">Discovery Cutoff</option>
                <option value="Client Meeting">Client Meeting</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Priority</label>
              <select class="form-select form-select-sm" [(ngModel)]="newEvent.priority">
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Start Time *</label>
              <input type="datetime-local" class="form-control form-control-sm" [(ngModel)]="newEvent.start_time">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">End Time</label>
              <input type="datetime-local" class="form-control form-control-sm" [(ngModel)]="newEvent.end_time">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Case</label>
              <select class="form-select form-select-sm" [(ngModel)]="newEvent.case_id">
                <option [ngValue]="null">Select Case...</option>
                <option *ngFor="let c of caseList" [ngValue]="c.id">
                  {{ c.case_number }} - {{ c.case_name }}
                </option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Client</label>
              <select class="form-select form-select-sm" [(ngModel)]="newEvent.client_id">
                <option [ngValue]="null">Select Client...</option>
                <option *ngFor="let cl of clientList" [ngValue]="cl.id">
                  {{ cl.name }}
                </option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Courtroom / Forum</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="newEvent.court_room" placeholder="e.g. Courtroom 14C">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold small">Presiding Judge</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="newEvent.judge_name" placeholder="e.g. Hon. Katherine Failla">
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold small">Location / Address</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="newEvent.location" placeholder="e.g. US District Court - SDNY, 500 Pearl St">
            </div>
            <div class="col-12">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="solCheck" [(ngModel)]="newEvent.is_statute_of_limitations">
                <label class="form-check-label fw-semibold text-danger small" for="solCheck">
                  Statute of Limitations (SOL) Deadline Bar
                </label>
              </div>
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold small">Docket Notes & Case Summary</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="newEvent.notes" placeholder="Notes for trial counsel, witness preparation, exhibits..."></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-3">
            <button class="btn btn-sm btn-light border" (click)="isNewEventModalOpen = false">Cancel</button>
            <button class="btn btn-sm btn-primary" (click)="saveNewEvent()" [disabled]="!newEvent.title || !newEvent.start_time">
              Save Event
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .calendar-page {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .alert-court-reminder {
      background: #FEF9E7;
      border: 1px solid #FAD7A0;
      border-left: 5px solid #F39C12;
      border-radius: 8px;
      padding: 14px 20px;
    }
    .alert-bell-icon {
      background: rgba(243, 156, 18, 0.15);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .calendar-month-title {
      min-width: 220px;
      text-align: center;
      font-size: 1.25rem;
    }
    .calendar-grid-container {
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
      background: #FFFFFF;
    }
    .calendar-grid-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #2C3E50;
      color: #FFFFFF;
      font-weight: 600;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .weekday-header-cell {
      padding: 10px;
      text-align: center;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    .calendar-grid-body {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }
    .calendar-day-cell {
      min-height: 110px;
      border-right: 1px solid #EDF2F7;
      border-bottom: 1px solid #EDF2F7;
      padding: 6px;
      background: #FFFFFF;
      transition: background 0.15s ease;
      display: flex;
      flex-direction: column;
    }
    .calendar-day-cell:hover {
      background: #F8FAFC;
    }
    .calendar-day-cell.not-current-month {
      background: #F9FAFB;
      opacity: 0.55;
    }
    .calendar-day-cell.is-today {
      background: #EBF5FB;
      border: 2px solid #3498DB;
    }
    .day-num {
      font-weight: 600;
      font-size: 0.85rem;
      color: #4A5568;
    }
    .calendar-day-cell.is-today .day-num {
      color: #2980B9;
      font-weight: bold;
    }
    .day-events-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-top: 4px;
      overflow: hidden;
    }
    .calendar-event-chip {
      font-size: 0.72rem;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }
    .calendar-event-chip:hover {
      filter: brightness(0.95);
    }
    .chip-trial { background: #FADBD8; color: #78281F; border-left: 3px solid #E74C3C; }
    .chip-hearing { background: #D4EFDF; color: #145A32; border-left: 3px solid #27AE60; }
    .chip-deposition { background: #E8F8F5; color: #117864; border-left: 3px solid #16A085; }
    .chip-deadline { background: #FCF3CF; color: #7D6608; border-left: 3px solid #F1C40F; }
    .chip-sol { background: #FADBD8; color: #900C3F; border-left: 3px solid #C0392B; font-weight: bold; }
    .chip-general { background: #EBF5FB; color: #1B4F72; border-left: 3px solid #3498DB; }
    .more-events {
      cursor: pointer;
      font-weight: 600;
      padding: 1px 4px;
    }
  `]
})
export class CalendarComponent implements OnInit {
  events: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];
  urgentAlerts: CalendarEvent[] = [];
  caseList: Case[] = [];
  clientList: Client[] = [];

  activeView: 'month' | 'agenda' = 'month';
  filterType: string = '';
  showAllAlerts: boolean = false;

  currentDate: Date = new Date();
  currentMonthName: string = '';
  currentYear: number = 2026;
  weekDayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];

  // Rule Calculator Modal
  isRuleModalOpen: boolean = false;
  ruleKey: string = 'COMMERCIAL_SUIT_SUMMONS_SERVED';
  triggerDate: string = new Date().toISOString().substring(0, 10);
  selectedCaseId: number | null = null;
  calculatedRuleName: string = '';
  calculatedDeadlines: RuleDeadlinePreview[] = [];

  // Sync Modal
  isSyncModalOpen: boolean = false;

  // New Event Modal
  isNewEventModalOpen: boolean = false;
  newEvent: Partial<CalendarEvent> = {
    title: '',
    event_type: 'Hearing',
    priority: 'Normal',
    start_time: '',
    end_time: '',
    case_id: undefined,
    client_id: undefined,
    location: '',
    court_room: '',
    judge_name: '',
    notes: '',
    is_statute_of_limitations: false
  };

  constructor(
    public calendarService: CalendarService,
    private caseService: CaseService,
    private clientService: ClientService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadUrgentAlerts();
    this.loadCasesAndClients();
    this.renderMonthGrid();
  }

  loadEvents(): void {
    this.calendarService.getEvents().subscribe({
      next: (res) => {
        if (res.success) {
          this.events = res.data;
          this.applyFilters();
          this.renderMonthGrid();
        }
      },
      error: (err) => {
        this.notify.error('Failed to load court calendar events');
      }
    });
  }

  loadUrgentAlerts(): void {
    this.calendarService.getUpcomingAlerts().subscribe({
      next: (res) => {
        if (res.success) {
          this.urgentAlerts = res.data;
        }
      },
      error: () => {}
    });
  }

  loadCasesAndClients(): void {
    this.caseService.getCases({ limit: 50 }).subscribe({
      next: (res) => {
        this.caseList = res.data;
      }
    });
    this.clientService.getClients({ limit: 50 }).subscribe({
      next: (res) => {
        this.clientList = res.data;
      }
    });
  }

  renderMonthGrid(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    this.currentYear = year;
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    this.currentMonthName = monthNames[month];

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];
    const today = new Date();

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: this.isSameDay(d, today),
        events: this.getEventsForDate(d)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: this.isSameDay(d, today),
        events: this.getEventsForDate(d)
      });
    }

    // Next month leading days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: this.isSameDay(d, today),
        events: this.getEventsForDate(d)
      });
    }

    this.calendarDays = days;
  }

  getEventsForDate(d: Date): CalendarEvent[] {
    const dateStr = d.toISOString().substring(0, 10);
    return this.filteredEvents.filter(ev => {
      if (!ev.start_time) return false;
      return ev.start_time.substring(0, 10) === dateStr;
    });
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.renderMonthGrid();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.renderMonthGrid();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.renderMonthGrid();
  }

  applyFilters(): void {
    if (!this.filterType) {
      this.filteredEvents = [...this.events];
    } else {
      this.filteredEvents = this.events.filter(e => e.event_type === this.filterType);
    }
    this.renderMonthGrid();
  }

  getEventChipClass(ev: CalendarEvent): string {
    if (ev.is_statute_of_limitations) return 'chip-sol';
    switch (ev.event_type) {
      case 'Trial': return 'chip-trial';
      case 'Hearing': return 'chip-hearing';
      case 'Deposition': return 'chip-deposition';
      case 'Filing Deadline': return 'chip-deadline';
      default: return 'chip-general';
    }
  }

  getEventIcon(type: string): string {
    switch (type) {
      case 'Trial': return 'bi-hammer';
      case 'Hearing': return 'bi-bank';
      case 'Deposition': return 'bi-person-badge';
      case 'Filing Deadline': return 'bi-clock-history';
      case 'Discovery Cutoff': return 'bi-folder-check';
      default: return 'bi-calendar-event';
    }
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'Trial': return 'bg-danger';
      case 'Hearing': return 'bg-success';
      case 'Deposition': return 'bg-info text-dark';
      case 'Filing Deadline': return 'bg-warning text-dark';
      default: return 'bg-primary';
    }
  }

  viewEventDetails(ev: CalendarEvent): void {
    this.notify.info(`${ev.title} (${ev.event_type}) - ${ev.court_room || ev.location || 'Courthouse'}`);
  }

  viewMoreDayEvents(day: CalendarDay): void {
    this.activeView = 'agenda';
  }

  openRuleCalcModal(): void {
    this.isRuleModalOpen = true;
    this.calculatedDeadlines = [];
  }

  onRuleSelected(): void {
    this.calculatedDeadlines = [];
  }

  calculateRuleDeadlines(): void {
    this.calendarService.calculateDeadlines({
      ruleKey: this.ruleKey,
      triggerDate: this.triggerDate,
      caseId: this.selectedCaseId || undefined
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.calculatedRuleName = res.ruleName;
          this.calculatedDeadlines = res.deadlines;
          this.notify.success(`Calculated ${res.calculatedCount} rule-based court deadlines`);
        }
      },
      error: (err) => {
        this.notify.error('Calculation failed: ' + (err.error?.message || err.message));
      }
    });
  }

  applyDeadlinesToDocket(): void {
    if (this.calculatedDeadlines.length === 0) return;
    this.calendarService.applyDeadlines({
      deadlines: this.calculatedDeadlines,
      caseId: this.selectedCaseId || undefined
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.notify.success(res.message);
          this.isRuleModalOpen = false;
          this.loadEvents();
          this.loadUrgentAlerts();
        }
      },
      error: (err) => {
        this.notify.error('Error saving deadlines');
      }
    });
  }

  openSyncModal(): void {
    this.isSyncModalOpen = true;
  }

  copyIcsUrl(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.notify.success('iCalendar live subscription URL copied to clipboard!');
    });
  }

  openNewEventModal(): void {
    const now = new Date();
    const nowStr = now.toISOString().substring(0, 16);
    this.newEvent = {
      title: '',
      event_type: 'Hearing',
      priority: 'Normal',
      start_time: nowStr,
      end_time: nowStr,
      case_id: this.caseList[0]?.id || undefined,
      client_id: this.clientList[0]?.id || undefined,
      court_room: '',
      judge_name: '',
      location: 'US District Court - SDNY',
      reminder_minutes: 1440,
      notes: '',
      is_statute_of_limitations: false
    };
    this.isNewEventModalOpen = true;
  }

  saveNewEvent(): void {
    this.calendarService.createEvent(this.newEvent).subscribe({
      next: (res) => {
        if (res.success) {
          this.notify.success('Court event successfully docketed!');
          this.isNewEventModalOpen = false;
          this.loadEvents();
          this.loadUrgentAlerts();
        }
      },
      error: (err) => {
        this.notify.error('Failed to save event');
      }
    });
  }

  deleteEvent(ev: CalendarEvent): void {
    if (!confirm(`Are you sure you want to remove "${ev.title}" from the docket?`)) return;
    this.calendarService.deleteEvent(ev.id!).subscribe({
      next: () => {
        this.notify.info('Event removed from court docket');
        this.loadEvents();
        this.loadUrgentAlerts();
      }
    });
  }

  triggerTestAlert(ev: CalendarEvent): void {
    this.calendarService.sendCourtReminder(ev.id!, { channel: 'Email & SMS', alertTier: ev.alertTier || '48h' }).subscribe({
      next: (res) => {
        this.notify.success(`Court notification dispatched to ${res.details.sentTo.join(' & ')}!`);
      },
      error: () => {
        this.notify.success('Alert simulation completed');
      }
    });
  }
}
