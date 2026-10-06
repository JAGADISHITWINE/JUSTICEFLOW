# ⚖️ JusticeFlow — Complete User Guidance & System Manual

Welcome to **JusticeFlow**, an enterprise-grade Legal Practice Management Operating System designed specifically for modern advocates, law firms, corporate legal teams, and clients. 

This comprehensive guide explains the purpose of the platform, the role-based workflows, and a detailed walkthrough of **every single page** in the application.

---

## 📑 Table of Contents
1. [Application Overview & Architecture](#-1-application-overview--architecture)
2. [User Roles & Demo Login Credentials](#-2-user-roles--demo-login-credentials)
3. [Page-by-Page Feature Guide](#-3-page-by-page-feature-guide)
   - [Page 1: Staff Authentication (`/login`)](#page-1-staff-authentication-login)
   - [Page 2: Executive Command Center (`/dashboard`)](#page-2-executive-command-center-dashboard)
   - [Page 3: Client Directory & CRM (`/clients`)](#page-3-client-directory--crm-clients)
   - [Page 4: Legal Matters & Case Management (`/cases`)](#page-4-legal-matters--case-management-cases)
   - [Page 5: 360° Case Dossier & Detail View (`/cases/:id`)](#page-5-360-case-dossier--detail-view-casesid)
   - [Page 6: Firm Documents Repository (`/documents`)](#page-6-firm-documents-repository-documents)
   - [Page 7: Time Tracking & Billable Slips (`/time-tracking`)](#page-7-time-tracking--billable-slips-time-tracking)
   - [Page 8: Invoices, Billing & Trust/Escrow Accounting (`/invoices`)](#page-8-invoices-billing--trustescrow-accounting-invoices)
   - [Page 9: Court Calendar & Statutory Deadline Calculator (`/calendar`)](#page-9-court-calendar--statutory-deadline-calculator-calendar)
   - [Page 10: Ethical Conflict of Interest Checker (`/conflicts`)](#page-10-ethical-conflict-of-interest-checker-conflicts)
   - [Page 11: Digital Retainer Agreements & E-Signatures (`/retainers`)](#page-11-digital-retainer-agreements--e-signatures-retainers)
   - [Page 12: AI Legal Assistant & Co-Counsel (`/ai-assistant`)](#page-12-ai-legal-assistant--co-counsel-ai-assistant)
   - [Page 13: Client Self-Service Portal (`/portal/login` & `/portal/dashboard`)](#page-13-client-self-service-portal-portallogin--portaldashboard)
4. [End-to-End Real World Workflows](#-4-end-to-end-real-world-workflows)
5. [System Startup & Environment Guide](#-5-system-startup--environment-guide)

---

## 🏛️ 1. Application Overview & Architecture

JusticeFlow bridges the entire legal lifecycle into a unified, secure platform:
- **Frontend**: High-performance Angular standalone architecture with responsive desktop and mobile views.
- **Backend**: Microservices mesh orchestrated by an API Gateway (port `5000`):
  - **Auth Service** (Port `3001`): JWT session tokens, bcrypt encryption, role access.
  - **Client Service** (Port `3002`): Client CRM, Conflict Scanner, Client Portal.
  - **Case Service** (Port `3003`): Matters, cause lists, retainer contracts.
  - **Documents Service** (Port `3004`): Pleadings storage, multipart uploads, AI legal assistant.
  - **Time Tracking Service** (Port `3005`): Billable timer, time slips, budget synchronization.
  - **Billing & Calendar Services**: Invoicing, IOLTA escrow tracking, .ics calendar feeds.
- **Database**: MySQL relational database (`justiceflow_db`) with transactional integrity.

---

## 🔑 2. User Roles & Demo Login Credentials

JusticeFlow provides two distinct entry portals:

### A. Advocate & Firm Staff Portal (`http://localhost:4200/login`)
Designed for legal practitioners, associates, and office managers:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Partner Admin** | `admin@justiceflow.com` | `password123` | Full firm-wide oversight, financial KPIs, retainer approval, staff management. |
| **Associate Lawyer** | `sarah.jenkins@justiceflow.com` | `password123` | Case litigation, document drafts, hearing docket, time entry logging. |
| **Paralegal / Clerk** | `marcus.ross@justiceflow.com` | `password123` | Registry filings, hearing scheduling, client records, document upload. |

> **Tip:** The `/login` page features **1-Click Autofill Buttons** to quickly test any role.

### B. Client Self-Service Portal (`http://localhost:4200/portal/login`)
A secure, confidential portal isolated from internal law firm administrative tools:
- **Demo Client Email**: `m.rivera@techventure.io` (or `client@apexlogistics.com`)
- **Password**: `password123`
- Allows clients to view their case timelines, download court pleadings, and review invoices.

---

## 🖥️ 3. Page-by-Page Feature Guide

---

### Page 1: Staff Authentication (`/login`)
- **Route**: `http://localhost:4200/login`
- **Component**: [`LoginComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/login/login.component.ts)
- **Primary Function**:
  - Authenticates legal staff using email and bcrypt-hashed passwords.
  - Issues signed JSON Web Tokens (JWT) stored securely for API authorization.
  - Includes **One-Click Quick Login** pills for Partner, Associate, and Paralegal roles.
  - Role-based routing automatically redirects staff to the main command dashboard.

---

### Page 2: Executive Command Center (`/dashboard`)
- **Route**: `http://localhost:4200/dashboard`
- **Component**: [`DashboardComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/dashboard/dashboard.component.ts)
- **Primary Function**:
  - **Executive KPI Cards**: Real-time totals for **Active Matters**, **Retained Clients**, **Billable Hours Logged**, and **Gross Realized Revenue**.
  - **Active Legal Matters Table**: High-level overview of critical cases with practice areas, court jurisdictions, and interactive **Budget Consumption Meters** (Green < 70%, Yellow 70-90%, Red > 90%).
  - **Upcoming Court Hearings Docket**: Visual calendar countdown showing upcoming trial dates, forum halls, and judges.
  - **Quick Action Bar**: One-click shortcuts to *Create New Client*, *Open New Matter*, or *Log Billable Hours*.
  - **Live Microservices Health Pills**: Real-time ping indicators showing the operational status of all backend microservices.

---

### Page 3: Client Directory & CRM (`/clients`)
- **Route**: `http://localhost:4200/clients`
- **Components**: [`ClientsComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/clients/clients.component.ts), [`ClientFormComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/clients/client-form.component.ts)
- **Primary Function**:
  - **Central Client Registry**: Comprehensive directory of corporate clients, private individuals, partnerships, and institutions.
  - **Contact & Legal Metadata**: Tracks company names, points of contact, phone numbers, registered addresses, and GSTIN/tax numbers.
  - **Case Cross-Referencing**: Displays the count and links of all active lawsuits tied to each client.
  - **Live Search & Filter**: Real-time search across client names, cities, phone numbers, or emails.
  - **Add/Edit Client Modal**: Clean modal form with immediate field validation and instant database sync.

---

### Page 4: Legal Matters & Case Management (`/cases`)
- **Route**: `http://localhost:4200/cases`
- **Components**: [`CasesComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/cases/cases.component.ts), [`CaseFormComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/cases/case-form.component.ts)
- **Primary Function**:
  - **Master Litigation Docket**: Tracks all lawsuits, arbitrations, writ petitions, and advisory transactions.
  - **Court & Registry Information**: Captures Case Title, CNR Number / Suit Number, Court Forum (e.g., Supreme Court, High Court, City Civil Commercial Court, NCLT), Presiding Judge, Opposing Party, and Opposing Counsel.
  - **Lifecycle Status Filtering**: Filter cases instantly by `Open`, `In Progress`, `On Hold`, or `Closed`.
  - **Financial Budget Tracking**: Displays approved legal budget versus actual billable time logged to date.
  - **Add New Matter Modal**: Quickly registers a new case, links it to an existing client, and sets target budgets.

---

### Page 5: 360° Case Dossier & Detail View (`/cases/:id`)
- **Route**: `http://localhost:4200/cases/1` (e.g. for matter ID #1)
- **Component**: [`CaseDetailComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/cases/case-detail.component.ts)
- **Primary Function**:
  - **Unified Case Command Hub**: Deep-dive single-pane view for an active lawsuit.
  - **Summary Header**: Displays suit number, court name, bench, filing date, and client contact badge.
  - **Tab 1: Legal Pleadings & Documents**: All petitions, plaints, affidavits, orders, and evidence filed in this specific case. Includes direct download and instant document upload.
  - **Tab 2: Billable Hours & Time Slips**: Itemized list of time slips recorded for this case, advocate names, hourly rates, and total fee tally.
  - **Tab 3: Facts, Strategy & Legal Grounds**: Full legal synopsis, statutory provisions invoked, procedural timeline, and notes.
  - **Direct Retainer & Conflict Link**: Instant access to executed retainer contracts and conflict check reports for this matter.

---

### Page 6: Firm Documents Repository (`/documents`)
- **Route**: `http://localhost:4200/documents`
- **Component**: [`DocumentsComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/documents/documents.component.ts)
- **Primary Function**:
  - **Firm-wide Digital Filing Cabinet**: Centralized storage for all PDF and DOCX files across all matters.
  - **Category Classification**: Filter documents by *Pleadings / Plaint*, *Written Statement*, *Vakalatnama*, *Affidavit*, *Court Order / Judgment*, or *Evidence Exhibit*.
  - **Multipart Upload**: Drag-and-drop or browse files to store them directly into the backend storage system with automatic file size and mime-type validation.
  - **Instant Download**: Stream and download any legal pleading with one click.
  - **Case Association**: Shows which case docket number each file belongs to with direct jump links.

---

### Page 7: Time Tracking & Billable Slips (`/time-tracking`)
- **Route**: `http://localhost:4200/time-tracking`
- **Components**: [`TimeTrackingComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/time-tracking/time-tracking.component.ts), [`TimeTrackingListComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/time-tracking/time-tracking-list.component.ts)
- **Primary Function**:
  - **Revenue Engine**: Captures advocate time spent on legal drafting, court appearances, client conferences, and research.
  - **Live Stopwatch & Manual Entry**: Start/stop active timers or manually log elapsed hours (e.g., 1.5 hrs).
  - **Automated Case Budget Recalculation**: *When time is recorded, the backend automatically updates the accumulated spent amount on the corresponding case in real time.*
  - **Financial Metrics**: Tally of billable hours logged, revenue realization, and billable vs. non-billable splits.
  - **Filter & Export**: Filter by date range, specific lawyer, client, or case matter.

---

### Page 8: Invoices, Billing & Trust/Escrow Accounting (`/invoices`)
- **Route**: `http://localhost:4200/invoices`
- **Component**: [`InvoicesComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/invoices/invoices.component.ts)
- **Primary Function**:
  - **Invoice Generation from Time Slips**: Select unbilled hours for any client and automatically convert them into an itemized, numbered legal invoice.
  - **Invoice Lifecycle Management**: Track invoices across `Draft`, `Issued`, `Paid`, and `Overdue` states.
  - **Trust Account (IOLTA / Escrow) Management**: Dedicated ledger for client advance retainers and court security deposits.
  - **Trust Balance & Deposits**: Record client funds deposited into escrow accounts and withdraw funds to settle approved invoices with full Bar Council compliance.
  - **Printable Legal Bill**: Render clean, print-ready formal invoices with tax breakdown, firm header, and payment instructions.

---

### Page 9: Court Calendar & Statutory Deadline Calculator (`/calendar`)
- **Route**: `http://localhost:4200/calendar`
- **Component**: [`CalendarComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/calendar/calendar.component.ts)
- **Primary Function**:
  - **Master Court Docket**: Month, Week, and Agenda views of all scheduled hearings, appearances, and client conferences.
  - **Statutory Rule Deadline Calculator**: Automatically computes procedural filing deadlines (e.g., 30-day Written Statement window under Order VIII CPC, limitation countdowns).
  - **Court Room & Judge Allocation**: Displays specific Court Hall numbers, Bench composition, and Presiding Judge.
  - **Priority Urgency Tags**: Color-coded badges for `Critical`, `High`, and `Normal` priority hearings.
  - **2-Way Calendar Sync**: Generates an `.ics` subscription feed to sync firm court dates with Google Calendar, Apple Calendar, and Microsoft Outlook.

---

### Page 10: Ethical Conflict of Interest Checker (`/conflicts`)
- **Route**: `http://localhost:4200/conflicts`
- **Component**: [`ConflictsComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/conflicts/conflicts.component.ts)
- **Primary Function**:
  - **Ethical Clearance Scanner**: Checks prospective clients, opposing parties, affiliates, and witnesses against the entire historical database of active and past matters.
  - **Bar Council & Professional Ethics Compliance**: Prevents representing conflicting interests or violating privileged attorney-client relationships.
  - **Risk Rating**: Flags matches as `Clear (No Conflict)`, `Potential Conflict (Requires Review)`, or `Direct Conflict (Representation Barred)`.
  - **Audit Certification**: Automatically generates certified conflict check audit reports saved with lawyer ID, date, and search parameters.

---

### Page 11: Digital Retainer Agreements & E-Signatures (`/retainers`)
- **Route**: `http://localhost:4200/retainers`
- **Component**: [`RetainersComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/retainers/retainers.component.ts)
- **Primary Function**:
  - **Engagement Contract Lifecycle**: Prepares formal client engagement agreements, fee schedules, and Vakalatnama letters.
  - **Fee Structure Presets**: Supports Hourly Rate, Fixed Retainer, Lump-sum stage billing, and Court Appearance fees.
  - **Biometric E-Signature Canvas**: Interactive touchscreen/mouse signature pad allowing clients and partners to execute agreements digitally.
  - **Agreement Status**: Monitors agreements through `Draft`, `Pending Client Signature`, and `Signed & Executed`.
  - **Audit Trail & PDF Export**: Produces standardized execution summaries with timestamps.

---

### Page 12: AI Legal Assistant & Co-Counsel (`/ai-assistant`)
- **Route**: `http://localhost:4200/ai-assistant`
- **Component**: [`AiAssistantComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/ai-assistant/ai-assistant.component.ts)
- **Primary Function**:
  - **Autonomous Legal Co-Counsel**: Built-in intelligent engine specialized in statutory interpretation, civil/criminal procedure, and contract analysis.
  - **BNS ↔ IPC Statutory Concordance**: Instant converter between newly enacted Indian criminal codes (Bharatiya Nyaya Sanhita - BNS) and legacy Indian Penal Code (IPC) sections.
  - **Time Slip Polishing**: Automatically refines rough time descriptions into polished, formal litigation narrative slips (e.g., *“Drafted Statement of Truth under Order VI Rule 15A CPC”*).
  - **Contract & Clause Extraction**: Analyzes uploaded agreements to highlight Indemnity, Non-Compete, Governing Law, and Arbitration clauses.
  - **Document Summarizer**: Summarizes complex multi-page judgments and plaints into concise briefing notes.
  - **Zero-Cost Engine Flexibility**: Operates out-of-the-box with offline heuristic legal algorithms, with optional toggle for free-tier Google Gemini or local Ollama.

---

### Page 13: Client Self-Service Portal (`/portal/login` & `/portal/dashboard`)
- **Routes**: `http://localhost:4200/portal/login` and `http://localhost:4200/portal/dashboard`
- **Components**: [`PortalLoginComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/portal/portal-login.component.ts), [`PortalDashboardComponent`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/portal/portal-dashboard.component.ts)
- **Primary Function**:
  - **Bank-Grade Client Gateway**: Dedicated 256-bit encrypted access portal designed specifically for clients.
  - **Live Case Timeline**: Clients view their active lawsuits, current procedural stage, and upcoming hearing dates without needing to call the office.
  - **Document Exchange**: Clients can securely download stamped court orders and upload confidential evidence or identity documents directly to their counsel.
  - **Financial Transparency**: View issued invoices, track paid amounts, and verify remaining trust retainer balances.
  - **Direct Advocate Inquiries**: Submit questions directly into the matter file for prompt advocate review.

---

## 🔄 4. End-to-End Real World Workflows

### Workflow 1: Onboarding a New Client & Opening a Matter
1. Navigate to [Clients](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/clients/clients.component.ts) (`/clients`) ➔ Click **New Client** ➔ Fill in client details.
2. Navigate to [Conflicts](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/conflicts/conflicts.component.ts) (`/conflicts`) ➔ Enter prospective party name and adverse party ➔ Run **Conflict Check** to certify ethical clearance.
3. Navigate to [Retainers](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/retainers/retainers.component.ts) (`/retainers`) ➔ Draft engagement letter ➔ Capture client digital signature.
4. Navigate to [Cases](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/cases/cases.component.ts) (`/cases`) ➔ Click **New Matter** ➔ Assign suit number, court, judge, and initial budget.

### Workflow 2: Managing Litigation & Court Hearings
1. Open the matter in [Case Detail](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/cases/case-detail.component.ts) (`/cases/:id`).
2. Upload the plaint and vakalatnama in **Tab 1 (Documents)**.
3. Switch to [Calendar](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/calendar/calendar.component.ts) (`/calendar`) ➔ Use **Rule Deadline Calculator** to compute the filing due date ➔ Add hearing event to docket.
4. Export or subscribe to the 2-way `.ics` calendar link to receive notifications on mobile devices.

### Workflow 3: Capturing Billable Work & Invoicing
1. Navigate to [Time Tracking](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/time-tracking/time-tracking.component.ts) (`/time-tracking`) ➔ Start the timer or manually log hours for the case.
2. The case's spent budget meter updates automatically.
3. At the end of the billing cycle, go to [Invoices](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/invoices/invoices.component.ts) (`/invoices`) ➔ Click **Generate Invoice from Time** ➔ Review line items.
4. Process payment from the client's Trust/Escrow deposit or issue the bill for direct payment.

---

## 🚀 5. System Startup & Environment Guide

### Quick Start: Running the Entire System
1. **Database Setup (MySQL)**:
   ```bash
   cd /var/www/html/JUSTICEFLOW/JUSTICEFLOW/backend
   npm run db:setup
   ```
2. **Start All Backend Microservices**:
   ```bash
   cd /var/www/html/JUSTICEFLOW/JUSTICEFLOW/backend
   npm run start
   ```
   *Launches API Gateway on `http://localhost:5000` and all microservices (3001–3005).*

3. **Start Frontend Web Application**:
   ```bash
   cd /var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend
   npm start
   ```
   *Opens the portal at `http://localhost:4200`.*

---

*JusticeFlow — Engineered for Precision, Ethics, and Seamless Legal Practice Management.*
