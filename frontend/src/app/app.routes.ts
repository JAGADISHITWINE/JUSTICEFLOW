import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { CasesComponent } from './pages/cases/cases.component';
import { CaseDetailComponent } from './pages/cases/case-detail.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { TimeTrackingComponent } from './pages/time-tracking/time-tracking.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { ConflictsComponent } from './pages/conflicts/conflicts.component';
import { RetainersComponent } from './pages/retainers/retainers.component';
import { AiAssistantComponent } from './pages/ai-assistant/ai-assistant.component';
import { clientAuthGuard } from './core/guards/client-auth.guard';
import { PortalLoginComponent } from './pages/portal/portal-login.component';
import { PortalDashboardComponent } from './pages/portal/portal-dashboard.component';

export const routes: Routes = [
  // Attorney & Admin Portal Routes
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientsComponent, canActivate: [authGuard] },
  { path: 'cases', component: CasesComponent, canActivate: [authGuard] },
  { path: 'cases/:id', component: CaseDetailComponent, canActivate: [authGuard] },
  { path: 'documents', component: DocumentsComponent, canActivate: [authGuard] },
  { path: 'time-tracking', component: TimeTrackingComponent, canActivate: [authGuard] },
  { path: 'invoices', component: InvoicesComponent, canActivate: [authGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [authGuard] },
  { path: 'conflicts', component: ConflictsComponent, canActivate: [authGuard] },
  { path: 'retainers', component: RetainersComponent, canActivate: [authGuard] },
  { path: 'ai-assistant', component: AiAssistantComponent, canActivate: [authGuard] },

  // Client Self-Service Portal Routes (Completely separate URLs & distinct login design)
  { path: 'portal/login', component: PortalLoginComponent },
  { path: 'portal/dashboard', component: PortalDashboardComponent, canActivate: [clientAuthGuard] },
  { path: 'portal', redirectTo: 'portal/dashboard', pathMatch: 'full' },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
