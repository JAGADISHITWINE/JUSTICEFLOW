# JusticeFlow — Comprehensive Project & Page Documentation

## 1. Executive Summary & Vision

**JusticeFlow** is an enterprise-grade Legal Practice Management Operating System designed for modern law firms, solo practitioners, and legal corporate departments. 

Legal practices handle high-stakes deadlines, confidential documents, billable hour tracking, and multi-party litigation matters. JusticeFlow solves the fragmented workflow of legal professionals by integrating **Matter Management**, **Client Retainers**, **Privileged Document Repositories**, and **Time & Billing** into a unified, responsive application.

---

## 2. Architectural Blueprint

The application is architected with a **microservices backend** and a **decoupled Angular 17 + Ionic frontend**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Angular 17 + Ionic Web Application                   │
│                        (http://localhost:4200)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ HTTP / REST (JWT Bearer Auth)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   JusticeFlow API Gateway (Port 5000)                  │
│          • Request Logging & CORS    • JWT Header Inspection          │
│          • Microservice Reverse Proxy • Centralized Error Handling     │
└───────┬─────────────┬─────────────┬─────────────┬─────────────┬────────┘
        │             │             │             │             │
        ▼             ▼             ▼             ▼             ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│ Auth Service ││Client Service││ Case Service ││ Docs Service ││ Time Tracking│
│  (Port 3001) ││  (Port 3002) ││  (Port 3003) ││  (Port 3004) ││  (Port 3005) │
└───────┬──────┘└──────┬───────┘└──────┬───────┘└──────┬───────┘└──────┬───────┘
        │              │               │               │               │
        └──────────────┴───────────────┼───────────────┴───────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │     MySQL Database Pool       │
                       │       justiceflow_db          │
                       └───────────────────────────────┘
```

---

## 3. Detailed Page-by-Page Documentation

### 📄 Page 1: Authentication & Staff Portal (`/login`)
- **File**: [`src/app/pages/login/login.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/login/login.component.ts)
- **Backend Service**: Auth Service (Port `3001`) via Gateway (`/api/auth`)

#### What this page does:
1. **Attorney & Staff Sign In**: Authenticates legal professionals using email and encrypted passwords (bcrypt salted hash).
2. **Account Registration**: Allows new law firm partners, associates, and assistants to create an account.
3. **JWT Token Management**: Upon successful sign-in, stores a signed JSON Web Token (JWT) in local storage and populates user session state.
4. **One-Click Demo Autofill**: Provides quick buttons for instant testing as:
   - **Alexander Vance, Esq.** (`admin@justiceflow.com` - Managing Partner)
   - **Sarah Jenkins, Esq.** (`sarah.jenkins@justiceflow.com` - Associate Attorney)

#### Why it is used here:
Law firms handle strict attorney-client privileged work product. Only authenticated staff members are allowed access to client details, sealed court documents, and financial billing numbers.

---

### 📊 Page 2: Executive Dashboard (`/dashboard`)
- **File**: [`src/app/pages/dashboard/dashboard.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/dashboard/dashboard.component.ts)
- **Backend Service**: Aggregated analytics from Case (`3003`), Client (`3002`), and Time Tracking (`3005`)

#### What this page does:
1. **Four Strategic KPI Metric Cards**:
   - **Active Matters**: Instant count of active open and pending litigation cases.
   - **Retained Clients**: Total active client accounts under retainer.
   - **Billable Hours**: Real-time tally of billable hours logged firm-wide.
   - **Billed Realization**: Total dollar revenue generated from billable time slips.
2. **Active Legal Matters Table**:
   - Lists top cases with docket numbers, assigned client, practice area, status badge, and an interactive **budget progress bar** indicating percentage of budget consumed.
3. **Upcoming Court Deadlines Calendar**:
   - Highlights pending court trial dates, expected filing deadlines, and jurisdiction.
4. **Quick Action Hub**:
   - Immediate navigation buttons to **New Client**, **New Matter**, or **Log Hours**.
5. **Microservices Health Monitor**:
   - Visual indicator confirming active connectivity to all 5 microservices.

#### Why it is used here:
Managing partners need an immediate snapshot of the firm's health. The dashboard answers key operational questions in seconds: *Are cases staying within budget? What filings are due this week? How much billable time did the team capture?*

---

### 👥 Page 3: Client Directory (`/clients`)
- **Files**: 
  - List View: [`src/app/pages/clients/clients.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/clients/clients.component.ts)
  - Add/Edit Modal: [`src/app/pages/clients/client-form.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/clients/client-form.component.ts)
- **Backend Service**: Client Service (Port `3002`) via Gateway (`/api/clients`)

#### What this page does:
1. **Client Master Database**: Displays corporate entities (e.g. Apex Global Logistics) and private individuals with avatar initials, phone, email, and location.
2. **Active Retainer Tracking**: Distinguishes between Active Retainers and Inactive/Archived clients.
3. **Live Search & Filter**: Search instantaneously by client name, email, phone number, or city.
4. **Matters Count**: Shows how many cases are currently linked to each client.
5. **Client Creation & Editing Modal**: Add new clients with complete address and assign responsible lead counsel.
6. **Deletion Guard**: Deletes clients with a confirmation modal.

#### Why it is used here:
In legal practice, all legal actions, court pleadings, and bills revolve around the retained client. Having an organized CRM prevents conflicts of interest and ensures accurate contact management.

---

### ⚖️ Page 4: Legal Matters & Cases (`/cases`)
- **Files**:
  - List View: [`src/app/pages/cases/cases.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/cases/cases.component.ts)
  - Add/Edit Modal: [`src/app/pages/cases/case-form.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/cases/case-form.component.ts)
- **Backend Service**: Case Service (Port `3003`) via Gateway (`/api/cases`)

#### What this page does:
1. **Case Docket Directory**: Lists every lawsuit, arbitration, and advisory matter.
2. **Practice Area Categorization**: Classifies cases by:
   - *Commercial Litigation*
   - *Corporate / Securities*
   - *Intellectual Property*
   - *Estate Planning / Probate*
   - *Real Estate*
3. **Status Workflow**: Tracks matters through lifecycle states:
   - `Open` (Active in discovery/pleadings)
   - `Pending` (In trial / hearing)
   - `On Hold` (Stayed or settlement negotiations)
   - `Closed` (Resolved / Dismissed)
4. **Financial Budget Meters**: Visual progress bars showing:
   - Green: Budget on track (< 70%)
   - Orange: Budget approaching limit (70% - 90%)
   - Red: Budget warning (> 90%)
5. **New Matter Creation Modal**: Assigns matter name, docket number, client, filing date, court, judge, and approved financial budget.

#### Why it is used here:
The core product of a law firm is its cases. This page ensures lawyers and paralegals never lose track of a matter, docket number, or budget constraint.

---

### 📂 Page 5: Case Detail & 360° Matter File (`/cases/:id`)
- **File**: [`src/app/pages/cases/case-detail.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/cases/case-detail.component.ts)
- **Backend Services**: Interacts with Case (`3003`), Documents (`3004`), and Time Tracking (`3005`)

#### What this page does:
This is the **deepest, most comprehensive view in the application**:
1. **Case Header & Badges**: Displays full matter title, docket identifier, jurisdiction, and lead counsel.
2. **Top Tri-Metric Overview**:
   - **Budget Progress**: Real-time spending versus approved cap.
   - **Client Card**: Clickable contact information for the client.
   - **Court Information**: Presiding judge, court branch, and initial filing date.
3. **Tab 1 — Legal Documents**:
   - Displays all complaints, motions, exhibits, and contracts attached specifically to this case.
   - Direct download link via the Documents Service.
   - Inline "Upload Document" button that pre-selects this case.
4. **Tab 2 — Logged Billable Hours**:
   - Itemized breakdown of attorney time slips logged against this case.
   - Shows date, attorney, description of work, rate, and total cost.
   - Inline "Log Hours" action.
5. **Tab 3 — Factual Background & Strategy**:
   - Detailed legal synopsis, claims, and strategic defense notes.

#### Why it is used here:
When an attorney prepares for court or a client conference call, they need everything related to the matter in one place: the docket, the client, the documents, and the billable time spent to date.

---

### 📁 Page 6: Global Documents Repository (`/documents`)
- **File**: [`src/app/pages/documents/documents.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/documents/documents.component.ts)
- **Backend Service**: Documents Service (Port `3004`) via Gateway (`/api/documents`)

#### What this page does:
1. **Firm-wide Filing Cabinet**: Centralized repository of all uploaded PDFs, contracts, and court filings across all clients and cases.
2. **Classification Filters**:
   - *Complaint / Pleadings*
   - *Contract*
   - *Probate Record*
   - *Corporate Term Sheet*
   - *IP Certificate*
   - *Settlement Agreement*
3. **Multipart File Upload**: Uploads actual files (PDF, DOCX) to the server via Multer storage.
4. **Download Stream**: Serves attachments directly through standard HTTP stream.
5. **Case Cross-Linking**: Shows which matter and docket each document belongs to with clickable links.

#### Why it is used here:
In legal practice, documents are critical evidence and work product. A centralized filing repository prevents files from being misplaced in desktop folders or email attachments.

---

### ⏱️ Page 7: Time Tracking & Billing (`/time-tracking`)
- **Files**:
  - Main Page: [`src/app/pages/time-tracking/time-tracking.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/time-tracking/time-tracking.component.ts)
  - Sub-Component: [`src/app/pages/time-tracking/time-tracking-list.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/pages/time-tracking/time-tracking-list.component.ts)
- **Backend Service**: Time Tracking Service (Port `3005`) via Gateway (`/api/time-entries`)

#### What this page does:
1. **Firm Revenue Engine**: Tracks billable hours and fee generation.
2. **Financial KPI Header**:
   - **Total Billable Hours**: Hours performed on behalf of clients.
   - **Billed Revenue Realization**: Dollar value earned (`hours × hourly_rate`).
   - **Time Slip Entries**: Total count of audited slips.
3. **Log Hours Modal**:
   - Select legal matter.
   - Enter hours (e.g. 2.5) and billing rate (e.g. $450/hr).
   - Detailed description of tasks performed.
   - Billable vs. Non-Billable checkbox.
4. **Automatic Case Budget Recalculation**:
   - *Whenever hours are logged, the backend automatically recalculates and updates the corresponding case's `spent` column in MySQL!*
5. **Filters**: Filter slips by matter, billable status, or specific date of service.

#### Why it is used here:
Law firms operate primarily on billable hours. Accurate, detailed time tracking is essential for client invoicing and ethics compliance.

---

## 4. Reusable Layout & Navigation Shell

### 🧭 Navigation Sidebar (`AppSidebarComponent`)
- **File**: [`src/app/shared/components/sidebar/sidebar.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/shared/components/sidebar/sidebar.component.ts)
- Collapsible between full drawer (260px) and compact icon mode (72px).
- Highlights active route automatically.
- Mobile drawer support with touch-friendly backdrop.
- **Microservices Live Monitor**: Displays connection status pills for all 5 microservices + API Gateway.

### 🌐 Top Navbar (`AppNavbarComponent`)
- **File**: [`src/app/shared/components/navbar/navbar.component.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/shared/components/navbar/navbar.component.ts)
- Global search input for cases and clients.
- Status badge ("Law Firm Gateway Active").
- Notification indicator.
- User profile dropdown with avatar, email, role, and Sign Out action.

---

## 5. Security & Data Integrity Features

1. **Password Hashing**: Passwords stored using bcrypt with 10 salt rounds.
2. **JWT Authentication**: Authenticated requests carry `Authorization: Bearer <token>`.
3. **HTTP Interceptor**: [`auth.interceptor.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/core/interceptors/auth.interceptor.ts) automatically attaches tokens and intercepts `401 Unauthorized` responses to redirect to `/login`.
4. **Auth Guard**: [`auth.guard.ts`](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/frontend/src/app/core/guards/auth.guard.ts) protects all internal routes from unauthenticated access.
5. **SQL Injection Prevention**: All MySQL database queries use parameterized prepared statements (`pool.execute(sql, params)`).
6. **Audit Trail**: Key actions (matter creation, time logging, file uploads) record an entry in the `audit_logs` database table.
