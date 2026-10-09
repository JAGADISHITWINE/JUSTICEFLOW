# JusticeFlow™ — Advocate & Law Firm Practice Management Guide
**A Comprehensive Operational Manual for Advocates, Senior Partners, and Law Chambers**

---

## 1. Executive Overview

**JusticeFlow™** is an enterprise-grade Legal Practice Management and Litigation Docketing platform engineered specifically for Indian Advocates, Solicitors, Law Chambers, and Corporate Legal Teams.

The platform aligns directly with the procedural requirements of the **Civil Procedure Code (CPC), 1908**, the **Commercial Courts Act, 2015**, the **Arbitration and Conciliation Act, 1996**, the **Insolvency and Bankruptcy Code (IBC), 2016**, and the **Bar Council of India (BCI) Rules on Professional Standards and Client Trust Accounting**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          JUSTICEFLOW SUITE                             │
├─────────────────┬──────────────────────┬───────────────────────────────┤
│ Court Litigation│ Retainer Agreements  │ Client Trust (Escrow)         │
│ & Cause Lists   │ & Digital Signatures │ & 18% GST Tax Invoicing       │
├─────────────────┼──────────────────────┼───────────────────────────────┤
│ Bar Council     │ Offline Confidential │ Real-Time Notification Center │
│ Conflict Checks │ Document Summaries   │ & Day / Night Display Mode    │
└─────────────────┴──────────────────────┴───────────────────────────────┘
```

---

## 2. System Access & Security

### 2.1 Web Address and Master Sign-In
- **Web Application Portal:** `http://localhost:4200`
- **Default Master Advocate Account:**
  - **Email:** `admin@justiceflow.com`
  - **Password:** `password123`
  - **Designation:** Senior Advocate & Managing Partner (Bar Council of Karnataka: `KAR/1988/2005`)

### 2.2 Day / Night Mode Display Switch
Litigators frequently draft pleadings, written submissions, and rejoinders late into the night. JusticeFlow features a dedicated **Day / Night Display Switch** situated on the top right navigation bar:
- **Day Mode (Sun icon):** Ultra-high clarity crisp contrast tailored for daytime office reading and courtroom laptop use.
- **Night Mode (Moon icon):** Deep-slate, low-glare dark palette reducing eye fatigue during nocturnal research and brief preparation.

---

## 3. Interactive Notification Center

The top navigation bar features a live **Notification Center** (bell icon) that keeps the chamber updated on urgent statutory and court milestones.

### 3.1 Unread Notification Counter
- A prominent red badge displays the count of unread court, billing, and trust updates.
- Clicking the bell opens a sleek dropdown flyout without refreshing or redirecting the screen.

### 3.2 Category Filter Tabs
1. **All:** Comprehensive chronological stream of all chamber alerts.
2. **Hearings:** Urgent Cause List listings (e.g., *Listed for Order XXXIX Interim Injunction before Court Hall No. 4*).
3. **Billing & Trust:** Advance retainer deposits, pending GST invoices, and IOLTA escrow reconciliation.
4. **Conflicts:** State Bar Council conflict check approvals and adverse party notices.

### 3.3 Quick Actions
- **Mark all read (`✓✓`):** Clears all active unread badges in one click.
- **Individual Read (`✓`):** Marks a specific notice as read.
- **Remove (`✕`):** Dismisses an alert permanently.
- **Click to Navigate:** Clicking any notice immediately opens the relevant court docket, invoice, or calendar schedule.

---

## 4. Client Onboarding & Bar Council Conflict Checks

Before accepting any brief, advocates are ethically bound under **Bar Council of India Rules (Part VI, Chapter II)** to verify there is no conflict of interest with adverse parties.

### 4.1 Onboarding a New Client
1. Navigate to **Clients** in the left sidebar menu (`/clients`).
2. Click **+ Retain New Client**.
3. Specify Client Type:
   - **Corporate:** Public and Private Limited Companies, Banks, NBFCs.
   - **Individual / HNI:** Private litigants, Managing Directors, Promoters.
4. Enter GSTIN (for corporate tax billing), Registered Address, Primary Contact, and Email.
5. Click **Save Client Profile**.

### 4.2 Automated Conflict of Interest Clearance
- When drafting a new brief or retaining a client, JusticeFlow cross-checks active matters against opposing parties and associated directors.
- In the **Clients** register, verified clients display an emerald badge: `BCI Conflict Cleared`.
- Retainers will warn counsel if an adverse party in an ongoing suit shares corporate directors with the newly retained client.

### 4.3 Client Portal Access Credentials
- Upon onboarding, the system generates secure one-time credentials for the **Client Self-Service Portal** (`/portal`).
- Clients can track hearing dates, view non-confidential orders, review GST invoices, and process retainer deposits online.

---

## 5. Court Case Docket, e-Courts Sync & Forum Management

### 5.1 Official 16-Digit CNR Number & Automated e-Courts Live Sync
Advocates no longer need to enter hearing dates manually every evening. When opening a case, simply enter the official 16-character **CNR Number** (Case Number Record) once:
- **How Live Sync Works:** JUSTICEFLOW connects to official court portals (District Courts, High Courts, and NJDG) via background automated workers.
- **Auto-Populated Details:** The platform automatically extracts the **Next Date of Hearing (NDOH)**, **Court Hall Number**, **Item / Serial Number on the Board**, **Presiding Judge**, and **Stage of Proceedings**.
- **One-Click Live Sync:** In the Cases register or Case Dossier, click **"e-Courts Live Sync"** to instantly update the docket with live judicial records and push hearing chips to your Calendar.

### 5.2 Judicial Forum & Court Category Differentiation
Cases in JUSTICEFLOW are categorized by forum with dedicated color badges and specialized legal fields:

| Judicial Forum | Icon & Badge | Specialized Tracking Fields |
| :--- | :---: | :--- |
| **High Court / Constitutional** | 🏛️ Blue | Writ Petitions (WP), Roster Benches, Serial/Item Numbers |
| **Criminal Court (Sessions / CJM)** | 🔴 Red | FIR / Crime Number, Police Station, Bail Status, Custody Notes |
| **Family Court (Matrimonial)** | 💜 Purple | Maintenance (Sec 125 CrPC), Guardianship, Child Custody |
| **Civil & Commercial Court** | 🟢 Green | Commercial Courts Act 2015, Specific Relief, Injunctions (O. 39) |
| **NCLT / IBC Tribunal** | 🟠 Orange | Insolvency Resolution (Sec 7/9 IBC), Operational Debt Ledgers |
| **Consumer Disputes Forum (DCDRC)** | ⚖️ Cyan | Consumer Protection Act, Defect in Goods / Deficiency in Service |
| **Custom / Specialized Tribunal** | ✍️ Slate | Add any forum (Armed Forces Tribunal, NGT, RERA Appellate) |

### 5.3 Opening a Case Docket
1. Navigate to **Cases** (`/cases`).
2. Click **+ Open New Matter**.
3. Select your **Judicial Forum** (Criminal, Family, High Court, etc.).
4. Enter the **16-Digit CNR Number** (or click the magic wand for sample generation).
5. For Criminal matters, enter **FIR Number** and **Jurisdiction Police Station**.
6. Select the **Retained Client**, **Matter Status**, and **Approved Budget**.
7. Click **Open Matter** — the case is immediately docketed with live e-Courts sync enabled.

---

## 6. Statutory Deadline Calculator & Court Calendar

Missing a statutory limitation under Indian law can lead to severe adverse consequences (such as forfeiture of the right to file a Written Statement under the Commercial Courts Act).

### 6.1 Automated Limitation Calculator
JusticeFlow features a built-in statutory calculator programmed with Indian legal timelines:
- **Commercial Court Written Statement:** Automatically computes the mandatory **30-day deadline** and the outer **120-day forfeiture limitation** under Order VIII Rule 1 CPC (as amended by Commercial Courts Act).
- **Arbitration Section 34 Challenge:** Computes the strict **3-month limitation period** plus the 30-day condonable window under Section 34(3).
- **Section 138 NI Act:** Calculates the **15-day statutory notice demand window** followed by the **30-day complaint filing window** under Section 142.
- **NCLAT Appeals:** Calculates the strict **30-day appeal timeline** under Section 61 IBC.

### 6.2 Court Hearing Calendar & Cause Lists
1. Navigate to **Calendar** (`/calendar`).
2. Toggle between **Month**, **Week**, and **Day** view.
3. Color-coded markers distinguish:
   - **Red:** High Court & Commercial Court Injunction Hearings.
   - **Amber:** Statutory Limitation Deadlines.
   - **Blue:** Senior Advocate Chambers Conferences.
   - **Green:** Client Consultations.
4. Export or synchronize hearings directly with **Google Calendar** and **Microsoft Outlook**.

---

## 7. Retainer Agreements & Digital Signature Pad

### 7.1 BCI Rule 24 Compliant Retainers
Advocates cannot enter into contingency fee arrangements under Indian law. JusticeFlow generates standard **Retainer & Engagement Agreements** with fixed, hourly, or hybrid fee structures strictly adhering to the **Advocates Act, 1961**.

1. Navigate to **Retainers** (`/retainers`).
2. Click **+ Draft New Retainer Agreement**.
3. Select Client and Case matter.
4. Define:
   - **Retainer Advance Amount (₹)**
   - **Hourly Drafting Rate (₹)**
   - **Senior Counsel Appearance Fee per Effective Hearing (₹)**
   - **Billing Cycle (Monthly / Milestone)**
5. Click **Generate Retainer Agreement**.

### 7.2 Version Control & Redline Revisions
- When clients request modifications to engagement terms, click **Revision / Redline**.
- Enter version notes (e.g., *v1.1: Capped Senior Counsel conference rate to 2 hours per sitting*).
- Complete revision history is preserved for audit trails.

### 7.3 Built-in Canvas Digital Signature Pad
- Both the Advocate and the Client can sign agreements directly within JusticeFlow.
- Click **Sign Agreement**.
- Use the smooth touch/mouse signature pad to sign.
- The platform embeds a cryptographic sha-256 hash and ISO timestamp into the signed agreement.

---

## 8. Time Tracking & 18% GST Tax Invoicing

### 8.1 Logging Billable Legal Time
1. Navigate to **Time Tracking** (`/time-tracking`).
2. Use the live **One-Click Stopwatch Timer** while researching, or click **+ Log Billable Hours**.
3. Fill in:
   - **Case & Client**
   - **Activity Category:** Pleadings Drafting, Court Appearance, Client Conference, Senior Counsel Briefing, Due Diligence.
   - **Hours & Billing Rate**
   - **Privileged Narrative:** Detailed summary of legal services rendered.
4. Click **Save Time Slip**.

### 8.2 Generating GST Tax Invoices
1. Navigate to **Invoices** (`/invoices`).
2. Click **Generate from Time Slips**.
3. Select Client and select all approved billable slips.
4. The system automatically computes:
   - **Taxable Legal Service Value**
   - **CGST (9%) + SGST (9%)** for intra-state legal services, OR
   - **IGST (18%)** for inter-state corporate clients.
   - **Reverse Charge Mechanism (RCM)** toggle for eligible corporate entities.
5. Export formal PDF Tax Invoices ready for delivery to corporate accounts departments.

---

## 9. Client Trust (Escrow) Account Accounting

Under **Bar Council of India Standards**, client funds received as advance court fee deposits, arbitrator fees, or interim retainers must **never be commingled** with the advocate's personal or chamber operational funds.

### 9.1 Trust Account Management in JusticeFlow
- Navigate to **Invoices & Trust Accounting** (`/invoices`).
- Switch to the **IOLTA / Client Trust Accounts** tab.
- Each client has a dedicated Trust Account maintained with scheduled banks (e.g., *HDFC Bank Advocate Escrow A/c*).

### 9.2 Trust Deposit & Milestone Withdrawal
1. **Deposit Retainer:** Click **Deposit to Trust**. Enter amount (e.g., ₹2,50,000/-) and transaction reference.
2. **Transfer to Operating Account:** When a GST Tax Invoice is raised and approved, transfer only the earned amount from Trust to General Operating account.
3. **Full Audit Ledger:** Every credit and debit records an immutable timestamp and purpose.

---

## 10. Offline Confidential Legal Document Analysis

Lawyers handle sensitive corporate secrets, patent filings, and personal litigation. JusticeFlow features an **Offline Confidential Document Analyzer** that operates 100% within your local environment.

### 10.1 Key Privacy Guarantees
- **No Third-Party Cloud Transmission:** Documents are processed on your secure server.
- **Attorney-Client Privilege:** Complies with **Section 126 of the Indian Evidence Act, 1872** (Privileged Professional Communications).
- **Instant Legal Summaries:** Generates concise executive briefs, lists key allegations, relief claimed, and statutory references.

### 10.2 Viewing a Document Brief
1. Navigate to **Documents** (`/documents`).
2. Click **AI / Confidential Summary** on any filed petition or affidavit.
3. Review extracted legal issues, citations, and procedural recommendations.

---

## 11. Modal Dialog Navigation & Keyboard Shortcuts

JusticeFlow is engineered for rapid keyboard and mouse navigation:
- **Close Modal Dialogues:**
  - Click the **✕** button in the top right corner of any popup modal.
  - Click anywhere on the dark backdrop outside the modal.
  - Click the **Cancel** button in the modal footer.
  - Press the **`Esc` (Escape)** key on your keyboard from anywhere on the page.
- **Button Styling:**
  - **Primary Actions (Save, Submit, Generate):** High-contrast deep navy / royal blue.
  - **Cancel / Close Actions:** Distinct slate outline with readable hover contrast.
  - **Critical / Delete Actions:** Bold crimson red (`#DC2626`).
  - **Success / Clearances:** Emerald green (`#059669`).

---

## 12. Quick Reference: System Credentials & URLs

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Senior Managing Partner** | `admin@justiceflow.com` | `password123` | Complete Chamber & Financial Control |
| **Associate Advocate** | `associate@justiceflow.com` | `password123` | Dockets, Time Slips, Documents |
| **Client Portal** | `corporate@infosys.com` | `Client@2026` | Self-Service Case Tracking & Invoices |

**Support & Practice Customization:**
Chamber Administrators can customize Court Jurisdictions, GSTIN Numbers, and State Bar Council numbers directly under Firm Settings.
