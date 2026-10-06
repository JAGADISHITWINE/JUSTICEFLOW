# JusticeFlow Legal Practice OS - API Documentation

## Architecture Overview
JusticeFlow uses a microservices architecture coordinated through a centralized API Gateway on **Port 5000**. Downstream services communicate over HTTP and authenticate through JWT Bearer tokens or forwarded gateway headers (`x-user-id`, `x-user-role`, `x-user-email`).

| Service | Port | Base Path | Primary Domain |
|---|---|---|---|
| **API Gateway** | 5000 | `/` | Routing, CORS, Token verification |
| **Auth Service** | 3001 | `/api/auth` | User authentication, JWT tokens, lawyer profiles |
| **Client Service** | 3002 | `/api/clients` | Client directory, retainers, contact details |
| **Case Service** | 3003 | `/api/cases` | Legal matters, court dockets, budgets |
| **Documents Service** | 3004 | `/api/documents` | Legal filings, pleadings, uploads/downloads |
| **Time Tracking Service** | 3005 | `/api/time-entries` | Billable hours, rates, financial realization |

---

## 1. Authentication Service (`:3001` via Gateway `:5000/api/auth`)

### 1.1 Login
- **Endpoint**: `POST /api/auth/login`
- **Auth**: Public
- **Request Body**:
```json
{
  "email": "admin@justiceflow.com",
  "password": "password123"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@justiceflow.com",
      "name": "Alexander Vance, Esq.",
      "avatar": "https://images.unsplash.com/...",
      "role": "admin"
    }
  }
}
```

### 1.2 Register
- **Endpoint**: `POST /api/auth/register`
- **Auth**: Public
- **Request Body**:
```json
{
  "name": "Sarah Jenkins, Esq.",
  "email": "sarah.jenkins@justiceflow.com",
  "password": "password123",
  "role": "lawyer"
}
```
- **Response `201 Created`**: Returns `{ success: true, data: { token, user } }`.

### 1.3 Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Auth**: Bearer Token
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**: Profile details of authenticated attorney.

---

## 2. Client Service (`:3002` via Gateway `:5000/api/clients`)

### 2.1 List Clients (with Search, Status Filter & Pagination)
- **Endpoint**: `GET /api/clients?search=Apex&status=Active&page=1&limit=10`
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Apex Global Logistics LLC",
      "email": "legal@apexlogistic.com",
      "phone": "+1 (555) 234-5678",
      "city": "New York",
      "state": "NY",
      "status": "Active",
      "case_count": 1,
      "total_budget": "75000.00",
      "total_spent": "24600.00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 2.2 Get Client Details
- **Endpoint**: `GET /api/clients/:id`
- **Auth**: Bearer Token
- **Response `200 OK`**: Returns full client record with associated legal matters array.

### 2.3 Create Client
- **Endpoint**: `POST /api/clients`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "name": "Sterling & Cross Capital",
  "email": "investments@sterlingcross.com",
  "phone": "+1 (555) 345-6789",
  "address": "45 Wall Street, Suite 1800",
  "city": "New York",
  "state": "NY",
  "zip_code": "10005",
  "status": "Active"
}
```

### 2.4 Update Client
- **Endpoint**: `PUT /api/clients/:id`
- **Auth**: Bearer Token

### 2.5 Delete Client
- **Endpoint**: `DELETE /api/clients/:id`
- **Auth**: Bearer Token

---

## 3. Case Service (`:3003` via Gateway `:5000/api/cases`)

### 3.1 List Cases (with Filters & Pagination)
- **Endpoint**: `GET /api/cases?search=Patent&status=Open&case_type=Commercial+Litigation&page=1&limit=10`
- **Auth**: Bearer Token

### 3.2 Get Case Detail
- **Endpoint**: `GET /api/cases/:id`
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "case_name": "Apex v. QuickFreight Logistics Breach of Contract",
    "case_number": "NY-2026-CV-0891",
    "case_type": "Commercial Litigation",
    "status": "Open",
    "court_name": "US District Court - SDNY",
    "judge_name": "Hon. Katherine Failla",
    "budget": "75000.00",
    "spent": "24600.00",
    "documents": [...],
    "time_entries": [...]
  }
}
```

### 3.3 Create Case
- **Endpoint**: `POST /api/cases`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "client_id": 1,
  "case_name": "Acme Corp Breach of License",
  "case_type": "Commercial Litigation",
  "court_name": "US District Court - SDNY",
  "judge_name": "Hon. Katherine Failla",
  "filing_date": "2026-04-01",
  "budget": 50000.00,
  "status": "Open"
}
```

### 3.4 Dashboard Analytics Summary
- **Endpoint**: `GET /api/cases/stats/dashboard`
- **Auth**: Bearer Token
- **Response `200 OK`**: Aggregated count of open/pending/closed cases, total firm budget, total spent, client count, billable hours, and upcoming court deadlines.

---

## 4. Documents Service (`:3004` via Gateway `:5000/api/documents`)

### 4.1 List Documents
- **Endpoint**: `GET /api/documents?case_id=1&search=Complaint`
- **Auth**: Bearer Token

### 4.2 Upload Legal Document
- **Endpoint**: `POST /api/documents/upload`
- **Auth**: Bearer Token
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `case_id`: (Integer)
  - `doc_name`: (String)
  - `doc_type`: (String e.g. "Complaint / Pleadings", "Contract")
  - `file`: (Binary Attachment)

### 4.3 Download Document
- **Endpoint**: `GET /api/documents/:id/download`
- **Auth**: Bearer Token
- **Response**: File stream attachment.

### 4.4 Delete Document
- **Endpoint**: `DELETE /api/documents/:id`
- **Auth**: Bearer Token

---

## 5. Time Tracking Service (`:3005` via Gateway `:5000/api/time-entries`)

### 5.1 List Time Slips
- **Endpoint**: `GET /api/time-entries?case_id=1&is_billable=true&page=1`
- **Auth**: Bearer Token

### 5.2 Log Billable Time
- **Endpoint**: `POST /api/time-entries`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "case_id": 1,
  "description": "Drafted notice of deposition and cross-examination questions",
  "hours": 3.5,
  "hourly_rate": 450.00,
  "entry_date": "2026-04-05",
  "is_billable": true
}
```
*Note: Creating or updating a billable entry automatically recalculates and updates the corresponding case's `spent` column!*

### 5.3 Billing Summary KPI
- **Endpoint**: `GET /api/time-entries/stats/summary`
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "total_hours": 17.25,
    "billable_hours": 17.25,
    "total_billed_revenue": 7037.50,
    "total_entries": 7
  }
}
```
