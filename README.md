# JusticeFlow - Legal Practice & Case Management System

> **JusticeFlow** is a modern, enterprise-grade lawyer and law firm management platform built with a decoupled **Node.js Express Microservices** backend and a responsive **Angular 17 + Ionic** frontend styled with Bootstrap 5, Bootstrap Icons, and a legal practice color scheme.

---

## 🏛️ System Architecture

```text
                                  ┌────────────────────────┐
                                  │   Angular 17 Frontend  │
                                  │   http://localhost:4200│
                                  └───────────┬────────────┘
                                              │ HTTP / JSON
                                              ▼
                                 ┌──────────────────────────┐
                                 │   JusticeFlow API Gateway│
                                 │   http://localhost:5000  │
                                 └────────────┬─────────────┘
                                              │
         ┌───────────────────┬────────────────┼───────────────────┬───────────────────┐
         ▼                   ▼                ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────────┐
│  Auth Service   │ │ Client Service  │ │ Case Service  │ │ Docs Service  │ │  Time Tracking  │
│    Port 3001    │ │    Port 3002    │ │   Port 3003   │ │   Port 3004   │ │    Port 3005    │
└────────┬────────┘ └────────┬────────┘ └───────┬───────┘ └───────┬───────┘ └────────┬────────┘
         │                   │                │                   │                  │
         └───────────────────┴────────────────┼───────────────────┴──────────────────┘
                                              ▼
                                 ┌─────────────────────────┐
                                 │     MySQL Database      │
                                 │    (justiceflow_db)     │
                                 └─────────────────────────┘
```

---

## 🎨 Color Scheme & Design Palette

| Element | Hex Code | Purpose |
|---|---|---|
| **Primary** | `#2C3E50` | Professional dark blue-gray (headers, primary buttons, titles) |
| **Secondary** | `#3498DB` | Action blue (interactive controls, active tabs, links) |
| **Accent** | `#27AE60` | Success green (open statuses, retained clients, approvals) |
| **Warning** | `#E74C3C` | Alert red (deadlines, delete actions, danger notices) |
| **Light Background** | `#ECF0F1` | Background canvas for readable contrast |
| **Dark Text** | `#2C3E50` | High-readability primary body text |
| **Borders** | `#BDC3C7` | Subtle divider and form borders |

---

## 📁 Project Directory Structure

```text
JUSTICEFLOW/
├── backend/
│   ├── api-gateway/
│   │   ├── server.js               # API Gateway (Port 5000)
│   │   └── routes.js               # Microservice reverse-proxy router
│   ├── auth-service/               # Auth Service (Port 3001)
│   │   ├── server.js
│   │   ├── controllers/auth.controller.js
│   │   └── models/user.model.js
│   ├── client-service/             # Client Service (Port 3002)
│   │   ├── server.js
│   │   ├── controllers/client.controller.js
│   │   └── models/client.model.js
│   ├── case-service/               # Case Service (Port 3003)
│   │   ├── server.js
│   │   ├── controllers/case.controller.js
│   │   └── models/case.model.js
│   ├── documents-service/          # Documents Service (Port 3004)
│   │   ├── server.js
│   │   ├── controllers/document.controller.js
│   │   ├── models/document.model.js
│   │   └── uploads/                # Local file storage
│   ├── time-tracking-service/      # Time Tracking Service (Port 3005)
│   │   ├── server.js
│   │   ├── controllers/time-entry.controller.js
│   │   └── models/time-entry.model.js
│   ├── database/
│   │   ├── db.js                   # MySQL Connection Pool
│   │   ├── setup.sql               # Full DDL Schema
│   │   └── seed.js                 # Seeding script with dummy litigation data
│   ├── shared/
│   │   ├── authMiddleware.js       # JWT Verification & RBAC
│   │   └── audit.js                # System audit logger
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/auth.guard.ts
│   │   │   │   ├── interceptors/auth.interceptor.ts
│   │   │   │   ├── models/models.ts
│   │   │   │   └── services/
│   │   │   │       ├── api.service.ts
│   │   │   │       ├── auth.service.ts
│   │   │   │       ├── client.service.ts
│   │   │   │       ├── case.service.ts
│   │   │   │       ├── document.service.ts
│   │   │   │       ├── time-tracking.service.ts
│   │   │   │       └── notification.service.ts
│   │   │   ├── shared/components/
│   │   │   │   ├── navbar/         # AppNavbarComponent
│   │   │   │   ├── sidebar/        # AppSidebarComponent
│   │   │   │   ├── card/           # AppCardComponent
│   │   │   │   ├── table/          # AppTableComponent
│   │   │   │   ├── modal/          # AppModalComponent
│   │   │   │   ├── button/         # AppButtonComponent
│   │   │   │   ├── form-input/     # AppFormInputComponent
│   │   │   │   ├── form-select/    # AppFormSelectComponent
│   │   │   │   ├── badge/          # AppBadgeComponent
│   │   │   │   ├── loader/         # AppLoaderComponent
│   │   │   │   ├── empty-state/    # AppEmptyStateComponent
│   │   │   │   └── alert/          # AppAlertComponent
│   │   │   └── pages/
│   │   │       ├── dashboard/      # DashboardComponent
│   │   │       ├── clients/        # ClientsComponent + ClientFormComponent
│   │   │       ├── cases/          # CasesComponent + CaseFormComponent + CaseDetailComponent
│   │   │       ├── documents/      # DocumentsComponent
│   │   │       ├── time-tracking/  # TimeTrackingComponent + TimeTrackingListComponent
│   │   │       └── login/          # LoginComponent
│   │   ├── styles/
│   │   │   ├── variables.scss
│   │   │   ├── responsive.scss
│   │   │   └── global.scss
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   ├── index.html
│   │   └── main.ts
│   ├── angular.json
│   └── package.json
│
├── API_DOCUMENTATION.md            # Detailed REST API endpoints
├── COMPONENT_DOCUMENTATION.md      # Angular Component API guide
└── package.json                    # Root script orchestrator
```

---

## ⚡ Quick Start & Run Instructions

### 1. Database Setup
Ensure MySQL is running, then run the database setup script to create `justiceflow_db` and seed realistic law firm matters:
```bash
cd backend
npm run db:setup
```

### 2. Start Backend Microservices
Run all 5 microservices + the API Gateway concurrently:
```bash
cd backend
npm run start
```
*Alternatively, start individual microservices:*
- Gateway: `npm run start:gateway` (Port 5000)
- Auth: `npm run start:auth` (Port 3001)
- Client: `npm run start:client` (Port 3002)
- Case: `npm run start:case` (Port 3003)
- Documents: `npm run start:docs` (Port 3004)
- Time Tracking: `npm run start:time` (Port 3005)

### 3. Start Frontend
```bash
cd frontend
npm start
```
Open **[http://localhost:4200](http://localhost:4200)** in your browser.

---

## 🔐 Default Demo Accounts

The login interface includes one-click autofill buttons for convenience:

| Role | Email | Password |
|---|---|---|
| **Partner Admin** | `admin@justiceflow.com` | `password123` |
| **Associate Lawyer** | `sarah.jenkins@justiceflow.com` | `password123` |
| **Paralegal Assistant** | `marcus.ross@justiceflow.com` | `password123` |

---

## 📖 Documentation Links
- [API Documentation](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/API_DOCUMENTATION.md)
- [Component Documentation](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/COMPONENT_DOCUMENTATION.md)
- [Database Schema (SQL)](file:///var/www/html/JUSTICEFLOW/JUSTICEFLOW/backend/database/setup.sql)
