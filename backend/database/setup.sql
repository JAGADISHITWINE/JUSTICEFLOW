-- JusticeFlow Law Firm Management Database Setup
-- Indian Courts & Legal Practice OS Edition
-- Compatible with MySQL 8.0+

CREATE DATABASE IF NOT EXISTS justiceflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE justiceflow_db;

-- 1. Users Table (Indian Advocates & Law Clerks)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  role ENUM('admin', 'lawyer', 'assistant') DEFAULT 'lawyer',
  is_active_session TINYINT(1) DEFAULT 0,
  active_session_token VARCHAR(500),
  session_started_at TIMESTAMP NULL,
  last_activity TIMESTAMP NULL,
  is_email_verified TINYINT(1) DEFAULT 1,
  reset_otp VARCHAR(10) NULL,
  reset_otp_expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients Table (Indian Corporates, HUFs, Individuals)
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  is_email_verified TINYINT(1) DEFAULT 0,
  email_verified_at TIMESTAMP NULL,
  portal_password VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Cases Table (Indian Courts, High Courts, Commercial Courts, NCLT)
CREATE TABLE IF NOT EXISTS cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  client_id INT NOT NULL,
  case_name VARCHAR(255) NOT NULL,
  case_number VARCHAR(100),
  case_type VARCHAR(100),
  description TEXT,
  status ENUM('Open', 'Closed', 'Pending', 'On Hold') DEFAULT 'Open',
  court_name VARCHAR(255),
  judge_name VARCHAR(255),
  filing_date DATE,
  expected_close_date DATE,
  budget DECIMAL(12,2) DEFAULT 0.00,
  spent DECIMAL(12,2) DEFAULT 0.00,
  adverse_party VARCHAR(255),
  opposing_counsel VARCHAR(255),
  corporate_affiliates TEXT,
  witnesses TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 4. Documents Table (Pleadings, Vakalatnama, Written Statements, Court Affidavits)
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  doc_name VARCHAR(255) NOT NULL,
  doc_type VARCHAR(100),
  file_path VARCHAR(255),
  file_size INT,
  uploaded_by INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Time Entries Table (Advocate Appearances & Conferences)
CREATE TABLE IF NOT EXISTS time_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  case_id INT NOT NULL,
  description TEXT NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  hourly_rate DECIMAL(10,2) DEFAULT 3500.00,
  entry_date DATE NOT NULL,
  is_billable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 6. Audit Logs Table (Firm Ethical Logging & Action Auditing)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Calendar Events Table (Indian Court Hearings, Cause Lists, Statutory Deadlines)
CREATE TABLE IF NOT EXISTS calendar_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  case_id INT DEFAULT NULL,
  client_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  event_type ENUM('Trial','Hearing','Deposition','Filing Deadline','Client Meeting','Discovery Cutoff') DEFAULT 'Hearing',
  start_time DATETIME NOT NULL,
  end_time DATETIME DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  court_room VARCHAR(100) DEFAULT NULL,
  judge_name VARCHAR(100) DEFAULT NULL,
  reminder_minutes INT DEFAULT 1440,
  notes TEXT,
  is_statute_of_limitations TINYINT(1) DEFAULT 0,
  alert_7d_sent TINYINT(1) DEFAULT 0,
  alert_48h_sent TINYINT(1) DEFAULT 0,
  alert_2h_sent TINYINT(1) DEFAULT 0,
  rule_trigger_name VARCHAR(100) DEFAULT NULL,
  priority ENUM('Normal','High','Critical') DEFAULT 'Normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- 8. Retainer Agreements Table (Vakalatnama & Legal Services Retainers)
CREATE TABLE IF NOT EXISTS retainer_agreements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT DEFAULT NULL,
  client_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  version VARCHAR(20) DEFAULT 'v1.0',
  previous_version_id INT DEFAULT NULL,
  fee_type ENUM('Hourly','Flat Fee','Contingency','Retainer Draw') DEFAULT 'Retainer Draw',
  retainer_amount DECIMAL(10,2) DEFAULT 0.00,
  hourly_rate DECIMAL(10,2) DEFAULT 0.00,
  terms_content LONGTEXT NOT NULL,
  redline_notes TEXT,
  status ENUM('Draft','Sent','Signed','Declined','Superseded') DEFAULT 'Draft',
  signature_data LONGTEXT,
  signer_name VARCHAR(255) DEFAULT NULL,
  signer_email VARCHAR(255) DEFAULT NULL,
  signer_ip VARCHAR(100) DEFAULT NULL,
  signed_at TIMESTAMP NULL DEFAULT NULL,
  biometric_timestamp VARCHAR(100) DEFAULT NULL,
  created_by INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 9. Conflict Checks Table (Bar Council of India Rule 33 & 36 Checks)
CREATE TABLE IF NOT EXISTS conflict_checks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  prospective_client VARCHAR(255) NOT NULL,
  matter_type VARCHAR(100) NOT NULL,
  adverse_parties TEXT,
  corporate_affiliates TEXT,
  opposing_counsel VARCHAR(255) DEFAULT NULL,
  witnesses TEXT,
  status ENUM('CLEARED','POTENTIAL_CONFLICT','DIRECT_CONFLICT') DEFAULT 'CLEARED',
  risk_score INT DEFAULT 0,
  findings_json JSON DEFAULT NULL,
  audit_certificate_id VARCHAR(100) UNIQUE,
  checked_by VARCHAR(255) DEFAULT NULL,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Invoices Table (Advocate Professional Fee Invoices with GST)
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  client_id INT NOT NULL,
  case_id INT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0.00,
  status ENUM('Draft','Sent','Paid','Overdue') DEFAULT 'Draft',
  notes TEXT,
  payment_link VARCHAR(255) DEFAULT NULL,
  stripe_payment_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 11. Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  time_entry_id INT DEFAULT NULL,
  description TEXT NOT NULL,
  hours DECIMAL(5,2) DEFAULT 0.00,
  rate DECIMAL(10,2) DEFAULT 0.00,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (time_entry_id) REFERENCES time_entries(id) ON DELETE SET NULL
);

-- 12. Trust Accounts Table (BCI Rule 24 Dedicated Client Trust Escrow)
CREATE TABLE IF NOT EXISTS trust_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  account_number VARCHAR(100) UNIQUE NOT NULL,
  balance DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 13. Trust Transactions Table
CREATE TABLE IF NOT EXISTS trust_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trust_account_id INT NOT NULL,
  case_id INT DEFAULT NULL,
  type ENUM('Deposit','Disbursement','Refund') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  reference_number VARCHAR(100) DEFAULT NULL,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trust_account_id) REFERENCES trust_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
);
