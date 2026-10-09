export interface Team {
  id: number;
  name: string;
  code: string;
  color?: string;
  icon?: string;
  description?: string;
  lead_counsel?: string;
  case_count?: number;
  created_at?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'lawyer' | 'assistant';
  practice_mode?: 'Solo' | 'Firm';
  designation?: string;
  team_id?: number;
  is_email_verified?: boolean;
  created_at?: string;
}

export interface Client {
  id?: number;
  user_id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  status: 'Active' | 'Inactive';
  is_email_verified?: boolean;
  email_verified_at?: string;
  assigned_lawyer?: string;
  case_count?: number;
  total_budget?: number;
  total_spent?: number;
  cases?: Case[];
  created_at?: string;
  updated_at?: string;
}

export interface Case {
  id?: number;
  user_id?: number;
  client_id: number;
  case_name: string;
  case_number?: string;
  cnr_number?: string;
  case_type?: string;
  court_forum?: string;
  team_id?: number;
  team_name?: string;
  team_code?: string;
  team_color?: string;
  team_icon?: string;
  team_lead?: string;
  fir_number?: string;
  police_station?: string;
  description?: string;
  status: 'Open' | 'Closed' | 'Pending' | 'On Hold';
  court_name?: string;
  judge_name?: string;
  filing_date?: string;
  expected_close_date?: string;
  budget?: number;
  spent?: number;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  lead_lawyer?: string;
  doc_count?: number;
  total_hours?: number;
  calculated_billed?: number;
  documents?: DocumentItem[];
  time_entries?: TimeEntry[];
  created_at?: string;
  updated_at?: string;
}

export interface DocumentItem {
  id?: number;
  case_id: number;
  doc_name: string;
  doc_type?: string;
  file_path?: string;
  file_size?: number;
  uploaded_by?: number;
  uploader_name?: string;
  case_name?: string;
  case_number?: string;
  uploaded_at?: string;
}

export interface TimeEntry {
  id?: number;
  user_id?: number;
  case_id: number;
  description: string;
  hours: number;
  hourly_rate?: number;
  entry_date: string;
  is_billable: boolean;
  total_amount?: number;
  case_name?: string;
  case_number?: string;
  client_name?: string;
  lawyer_name?: string;
  created_at?: string;
}

export interface DashboardData {
  cases: {
    total_cases: number;
    open_cases: number;
    pending_cases: number;
    closed_cases: number;
    on_hold_cases: number;
    total_budget: string | number;
    total_spent: string | number;
  };
  clients: {
    total_clients: number;
    active_clients: number;
  };
  time: {
    total_hours: string | number;
    billable_hours: string | number;
    total_billed_revenue: string | number;
  };
  recentCases: Case[];
  upcomingDeadlines: Case[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  time_entry_id?: number;
  description: string;
  hours?: number;
  rate?: number;
  amount: number;
}

export interface Invoice {
  id?: number;
  invoice_number: string;
  client_id: number;
  case_id: number;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_city?: string;
  client_state?: string;
  client_zip_code?: string;
  case_name?: string;
  case_number?: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax?: number;
  total: number;
  amount_paid?: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  notes?: string;
  payment_link?: string;
  stripe_payment_id?: string;
  items?: InvoiceItem[];
  created_at?: string;
}

export interface TrustAccount {
  id: number;
  client_id: number;
  client_name?: string;
  client_email?: string;
  account_number: string;
  balance: number;
  transaction_count?: number;
  total_deposited?: number;
  total_disbursed?: number;
  created_at?: string;
}

export interface TrustTransaction {
  id?: number;
  trust_account_id: number;
  case_id?: number;
  case_name?: string;
  case_number?: string;
  type: 'Deposit' | 'Disbursement' | 'Refund';
  amount: number;
  description: string;
  reference_number?: string;
  transaction_date: string;
  created_at?: string;
}

export interface BillingSummary {
  invoices: {
    total_invoices: number;
    total_billed: string | number;
    total_collected: string | number;
    outstanding_receivables: string | number;
    paid_invoices_amount: string | number;
    overdue_amount: string | number;
  };
  trust: {
    total_trust_accounts: number;
    total_trust_liability: string | number;
  };
}

export interface CalendarEvent {
  id?: number;
  user_id?: number;
  case_id?: number | null;
  client_id?: number | null;
  title: string;
  event_type: 'Trial' | 'Hearing' | 'Deposition' | 'Filing Deadline' | 'Client Meeting' | 'Discovery Cutoff';
  start_time: string;
  end_time?: string;
  location?: string;
  court_room?: string;
  judge_name?: string;
  reminder_minutes?: number;
  notes?: string;
  is_statute_of_limitations?: boolean | number;
  rule_trigger_name?: string;
  priority?: 'Normal' | 'High' | 'Critical';
  case_number?: string;
  case_title?: string;
  client_name?: string;
  client_email?: string;
  attorney_name?: string;
  hours_until_event?: number;
  urgency?: string;
  alertTier?: string;
  created_at?: string;
}

export interface RuleDeadlinePreview {
  title: string;
  event_type: string;
  priority: string;
  start_time: string;
  end_time: string;
  is_statute_of_limitations: number;
  notes: string;
  rule_trigger_name: string;
  case_id?: number;
  client_id?: number;
  offsetDays: number;
}

export interface ConflictCheckRecord {
  id?: number;
  prospective_client: string;
  matter_type: string;
  adverse_parties: string;
  corporate_affiliates?: string;
  opposing_counsel?: string;
  witnesses?: string;
  status: 'CLEARED' | 'POTENTIAL_CONFLICT' | 'DIRECT_CONFLICT';
  risk_score: number;
  findings: any[];
  audit_certificate_id?: string;
  checked_by?: string;
  certified_by?: string;
  checked_at?: string;
  audit_hash?: string;
}

export interface RetainerAgreement {
  id?: number;
  case_id?: number;
  client_id?: number;
  title: string;
  version: string;
  fee_type: 'Hourly' | 'Flat Fee' | 'Contingency' | 'Retainer Draw';
  retainer_amount: number;
  hourly_rate?: number;
  terms_content: string;
  redline_notes?: string;
  status: 'Draft' | 'Sent' | 'Signed' | 'Declined' | 'Superseded';
  signer_name?: string;
  signer_email?: string;
  signature_image?: string;
  signed_at?: string;
  biometric_timestamp?: string;
  created_at?: string;
}

