# JusticeFlow - Component Documentation

## Shared Reusable Components

All shared components are implemented as modern Angular Standalone Components with custom styling conforming to the firm's color palette:
- **Primary**: `#2C3E50` (Dark blue-gray)
- **Secondary**: `#3498DB` (Bright action blue)
- **Accent**: `#27AE60` (Approval green)
- **Warning**: `#E74C3C` (Danger red)
- **Light BG**: `#ECF0F1` (Light gray)

---

### 1. `AppNavbarComponent`
- **Selector**: `app-navbar`
- **Location**: `src/app/shared/components/navbar/navbar.component.ts`
- **Inputs**:
  - `[currentUser]`: `User | null` - Current logged-in attorney
- **Outputs**:
  - `(sidebarToggle)`: Emitted when hamburger menu clicked
  - `(globalSearch)`: Emitted with search input query string
- **Usage**:
```html
<app-navbar [currentUser]="currentUser" (sidebarToggle)="toggleSidebar()"></app-navbar>
```

---

### 2. `AppSidebarComponent`
- **Selector**: `app-sidebar`
- **Location**: `src/app/shared/components/sidebar/sidebar.component.ts`
- **Inputs**:
  - `[collapsed]`: `boolean` - Whether sidebar is in collapsed icon-only mode
  - `[mobileOpen]`: `boolean` - Whether drawer is open on mobile
- **Outputs**:
  - `(collapseChange)`: Emits new collapsed state
  - `(navigate)`: Emits on navigation event (to close drawer on mobile)
- **Features**: Firm logo, collapsible menu links with active router state, real-time microservices status pills.

---

### 3. `AppCardComponent`
- **Selector**: `app-card`
- **Location**: `src/app/shared/components/card/card.component.ts`
- **Inputs**:
  - `[title]`: Header title string
  - `[subtitle]`: Subtitle string
  - `[icon]`: Bootstrap icon class (e.g. `bi-folder2-open`)
  - `[noPadding]`: Removes inner body padding (useful for tables)
- **Content Slots**:
  - Default: Card body content
  - `[card-actions]`: Header right action buttons
  - `[card-footer]`: Footer section
- **Usage**:
```html
<app-card title="Active Legal Matters" icon="bi-folder" [noPadding]="true">
  <div card-actions>
    <button class="btn btn-sm btn-primary">Action</button>
  </div>
  <table>...</table>
</app-card>
```

---

### 4. `AppTableComponent`
- **Selector**: `app-table`
- **Location**: `src/app/shared/components/table/table.component.ts`
- **Inputs**:
  - `[columns]`: Array of `{ field, header, sortable, width, cellClass }`
  - `[data]`: Array of table row objects
  - `[loading]`: Boolean flag showing loader overlay
  - `[showPagination]`: Boolean to show/hide pagination
  - `[currentPage]`, `[pageSize]`, `[totalItems]`, `[totalPages]`
- **Outputs**:
  - `(pageChange)`: Emits new page number
  - `(sortChange)`: Emits `{ field, direction: 'asc' | 'desc' }`

---

### 5. `AppModalComponent`
- **Selector**: `app-modal`
- **Location**: `src/app/shared/components/modal/modal.component.ts`
- **Inputs**:
  - `[isOpen]`: `boolean` - Controls modal visibility
  - `[title]`: Modal header title
  - `[icon]`: Header icon
  - `[size]`: `'sm' | 'md' | 'lg' | 'xl'`
  - `[hasFooter]`: `boolean` (default: true)
- **Outputs**:
  - `(close)`: Emitted on backdrop click or close button
- **Content Slots**:
  - Default: Modal body content
  - `[modal-footer]`: Action buttons (Cancel, Save)

---

### 6. `AppButtonComponent`
- **Selector**: `app-button`
- **Location**: `src/app/shared/components/button/button.component.ts`
- **Inputs**:
  - `[label]`: Button text
  - `[variant]`: `'primary' | 'secondary' | 'accent' | 'warning' | 'outline'`
  - `[icon]`: Bootstrap icon class
  - `[loading]`: Boolean flag (displays spinner and disables button)
  - `[disabled]`: Boolean
  - `[type]`: `'button' | 'submit' | 'reset'`
- **Outputs**:
  - `(btnClick)`: Click event emitter

---

### 7. `AppFormInputComponent`
- **Selector**: `app-form-input`
- **Location**: `src/app/shared/components/form-input/form-input.component.ts`
- **Features**: Implements Angular `ControlValueAccessor` (compatible with `[(ngModel)]` and reactive forms), built-in validation messages, icons, hints, and error highlighting.
- **Inputs**: `[label]`, `[type]`, `[placeholder]`, `[icon]`, `[required]`, `[hint]`, `[hasError]`, `[errorMessage]`

---

### 8. `AppFormSelectComponent`
- **Selector**: `app-form-select`
- **Location**: `src/app/shared/components/form-select/form-select.component.ts`
- **Inputs**: `[label]`, `[options]`: Array of `{ label, value }`, `[placeholder]`, `[required]`, `[hint]`, `[hasError]`

---

### 9. `AppBadgeComponent`
- **Selector**: `app-badge`
- **Location**: `src/app/shared/components/badge/badge.component.ts`
- **Inputs**:
  - `[status]`: `'Open' | 'Closed' | 'Pending' | 'On Hold' | 'Active' | 'Inactive'`
  - `[label]`: Optional custom label text
- **Features**: Automatically styles with proper colors, borders, and status dot indicator.

---

### 10. `AppLoaderComponent`
- **Selector**: `app-loader`
- **Location**: `src/app/shared/components/loader/loader.component.ts`
- **Inputs**:
  - `[message]`: Text displayed under spinner
  - `[overlay]`: When true, covers container with semi-transparent frosted backdrop
  - `[size]`: Spinner size in rem

---

### 11. `AppEmptyStateComponent`
- **Selector**: `app-empty-state`
- **Location**: `src/app/shared/components/empty-state/empty-state.component.ts`
- **Inputs**: `[icon]`, `[title]`, `[message]`, `[actionLabel]`, `[actionIcon]`
- **Outputs**: `(action)`: Emitted when action button clicked

---

### 12. `AppAlertComponent`
- **Selector**: `app-alert`
- **Location**: `src/app/shared/components/alert/alert.component.ts`
- **Inputs**: `[type]`: `'success' | 'error' | 'warning' | 'info'`, `[title]`, `[message]`, `[dismissible]`
- **Outputs**: `(dismiss)`: Emitted when dismiss button clicked

---

## Page Components

1. **`LoginComponent`** (`src/app/pages/login/login.component.ts`): Authentication page supporting Login, Registration, JWT storage, and demo auto-fill for Alexander Vance, Esq. (Admin) and Sarah Jenkins, Esq. (Associate).
2. **`DashboardComponent`** (`src/app/pages/dashboard/dashboard.component.ts`): Executive legal practice dashboard with 4 KPI cards, active matters list, upcoming court filings calendar, and live microservices connectivity indicator.
3. **`ClientsComponent`** (`src/app/pages/clients/clients.component.ts`): Client directory with search, status filtering, pagination, and modals for creating, updating, and removing clients.
4. **`ClientFormComponent`** (`src/app/pages/clients/client-form.component.ts`): Modal form for retaining new clients and editing records.
5. **`CasesComponent`** (`src/app/pages/cases/cases.component.ts`): Legal matters listing with practice area filter, docket search, budget progress meters, and actions.
6. **`CaseFormComponent`** (`src/app/pages/cases/case-form.component.ts`): Modal form for creating and updating matters with client selection, budget, filing dates, and court info.
7. **`CaseDetailComponent`** (`src/app/pages/cases/case-detail.component.ts`): Detailed view for a single matter with financial health, court docket, related documents tab (with upload/download), and logged hours tab.
8. **`DocumentsComponent`** (`src/app/pages/documents/documents.component.ts`): Centralized legal filings and contract archive with case association and file download streams.
9. **`TimeTrackingComponent`** (`src/app/pages/time-tracking/time-tracking.component.ts`): Time and billing management with billable hours KPI cards, filtering, and time slip modal.
10. **`TimeTrackingListComponent`** (`src/app/pages/time-tracking/time-tracking-list.component.ts`): Reusable time entry list component for displaying billed slips.
