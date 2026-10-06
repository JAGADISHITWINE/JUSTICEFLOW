const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  console.log('--- Initializing JusticeFlow Database (Indian Courts & Bar Council Edition) ---');
  
  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  const dbName = process.env.DB_NAME || 'justiceflow_db';
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`Database '${dbName}' verified/created.`);
  await rootConn.end();

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
    multipleStatements: true
  });

  const sqlPath = path.join(__dirname, 'setup.sql');
  const schemaSql = fs.readFileSync(sqlPath, 'utf8');
  await db.query(schemaSql);
  console.log('Tables created or verified.');

  const forceReseed = process.argv.includes('--force');

  const [existingUsers] = await db.query('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0].count === 0 || forceReseed) {
    console.log('Seeding authentic Indian Legal Practice & Court Case data...');
    
    // Disable FK checks during clean seed
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');
    await db.query('TRUNCATE TABLE audit_logs;');
    await db.query('TRUNCATE TABLE trust_transactions;');
    await db.query('TRUNCATE TABLE trust_accounts;');
    await db.query('TRUNCATE TABLE invoice_items;');
    await db.query('TRUNCATE TABLE invoices;');
    await db.query('TRUNCATE TABLE conflict_checks;');
    await db.query('TRUNCATE TABLE retainer_agreements;');
    await db.query('TRUNCATE TABLE calendar_events;');
    await db.query('TRUNCATE TABLE time_entries;');
    await db.query('TRUNCATE TABLE documents;');
    await db.query('TRUNCATE TABLE cases;');
    await db.query('TRUNCATE TABLE clients;');
    await db.query('TRUNCATE TABLE users;');
    await db.query('SET FOREIGN_KEY_CHECKS = 1;');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Insert Users (Indian Advocates enrolled under State Bar Councils)
    await db.query(
      `INSERT INTO users (id, email, password, name, avatar, role) VALUES 
      (1, 'admin@justiceflow.com', ?, 'Advocate Alexander Vance (Managing Partner, KAR/1420/2012)', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 'admin'),
      (2, 'sarah.jenkins@justiceflow.com', ?, 'Advocate Sarah Jenkins (Partner, D/2104/2016)', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'lawyer'),
      (3, 'marcus.ross@justiceflow.com', ?, 'Marcus Ross (Senior Advocate Clerk & Researcher)', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'assistant')`,
      [passwordHash, passwordHash, passwordHash]
    );
    console.log('Users seeded (Password: password123)');

    // 2. Insert Clients (Indian Companies, HUF, Startups)
    await db.query(`
      INSERT INTO clients (id, user_id, name, email, phone, address, city, state, zip_code, status) VALUES
      (1, 1, 'Apex Global Logistics India Pvt Ltd', 'legal@apexlogistic.com', '+91 (080) 4123-5678', 'Level 8, Prestige Meridian, 29 M.G. Road', 'Bengaluru', 'Karnataka', '560001', 'Active'),
      (2, 1, 'Estate of Late K.R. Vance (HUF)', 'evance@estateholdings.org', '+91 (022) 2284-5432', '14 Nariman Point, Marine Drive', 'Mumbai', 'Maharashtra', '400021', 'Active'),
      (3, 2, 'Sterling & Cross Capital Advisory LLP', 'investments@sterlingcross.com', '+91 (011) 2331-6789', 'Barakhamba Road, Connaught Place', 'New Delhi', 'Delhi', '110001', 'Active'),
      (4, 2, 'Marcus Rivera Technologies Pvt Ltd', 'm.rivera@techventure.io', '+91 99000 23456', '776 100ft Road, HAL 2nd Stage, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 'Active'),
      (5, 1, 'Horizon Life Sciences Labs Pvt Ltd', 'ip-desk@horizonbio.com', '+91 (040) 2340-1234', 'Plot 12, Phase-II, Genome Valley, Shameerpet', 'Hyderabad', 'Telangana', '500078', 'Inactive')
    `);
    console.log('Clients seeded.');

    // 3. Insert Cases (Authentic Indian Court proceedings)
    await db.query(`
      INSERT INTO cases (id, user_id, client_id, case_name, case_number, case_type, description, status, court_name, judge_name, filing_date, expected_close_date, budget, spent, adverse_party, opposing_counsel, corporate_affiliates, witnesses) VALUES
      (1, 1, 1, 'Apex Global Logistics v. QuickFreight Multi-Modal Logistics Pvt Ltd', 'Comm. O.S. No. 481/2026', 'Commercial Suit (Commercial Courts Act 2015)', 'Commercial suit for recovery of ₹1,25,00,000/- with 18% p.a. interest towards cargo spoilage under Carriage by Road Act 2007; interim injunction under Order XXXIX Rules 1 & 2 CPC.', 'Open', 'City Civil & Commercial Court, Bengaluru', 'Hon''ble Sri Justice R. Devdas', '2026-01-15', '2026-11-30', 750000.00, 246000.00, 'QuickFreight Multi-Modal Logistics Pvt Ltd', 'Advocate V.K. Murthy & Associates', 'QuickFreight Holdings India Ltd, Apex Cargo Intermodal', 'David Miller (Logistics Head), Rajesh Sharma (Port Operations)'),
      (2, 1, 2, 'Testamentary Petition: Estate of Late K.R. Vance (Probate of Will)', 'Probate Civil Petition No. 112/2026', 'Testamentary & Intestate Succession', 'Petition under Section 276 of Indian Succession Act, 1925 for grant of Probate of registered Last Will & Testament dated 14.10.2018; valuation of ancestral immovable properties across Mumbai & Pune.', 'Open', 'High Court of Bombay (Ordinary Original Civil Jurisdiction)', 'Hon''ble Smt. Justice Bharati Dangre', '2026-02-01', '2026-09-15', 350000.00, 114000.00, 'Contesting Caveator: Suresh Vance & Anr.', 'Advocate Soli Dastoor & Partners', 'Vance Family Holdings Trust, Pune Land Corp', 'Dr. Arvind Joshi (Attesting Physician), R.N. Kulkarni (Notary Public)'),
      (3, 2, 3, 'Sterling Capital Advisory v. Securities and Exchange Board of India (SEBI)', 'SAT Appeal No. 204/2026', 'Securities Appellate Tribunal (SAT)', 'Appellate proceedings under Section 15T of SEBI Act, 1992 challenging regulatory adjudication order concerning AIF Category II Private Placement Memorandum (PPM) disclosures.', 'Pending', 'Securities Appellate Tribunal (SAT), Mumbai', 'Hon''ble Presiding Officer Justice P.S. Dinesh Kumar', '2026-02-18', '2026-06-30', 500000.00, 185000.00, 'Securities and Exchange Board of India (SEBI)', 'Senior Advocate Arvind Kamath with K. Ashwath', 'Sterling Capital Mauritius, Cross Alpha Syndicate', 'Prakash Chandra (Compliance Officer), Meera Sen (Fund Auditor)'),
      (4, 2, 4, 'Marcus Rivera Tech v. CloudByte Infotech (Trademark Infringement Suit)', 'Comm. Suit (IP) No. 94/2026', 'Intellectual Property Litigation', 'Suit under Sections 29 & 135 of Trade Marks Act, 1999 seeking permanent injunction restraining infringement of registered trademark ''CloudByte'' and damages.', 'On Hold', 'High Court of Karnataka (Commercial Division), Bengaluru', 'Hon''ble Sri Justice M. Nagaprasanna', '2026-03-05', '2026-12-31', 400000.00, 82000.00, 'CloudByte Infotech Pvt Ltd', 'Advocate D.L.N. Rao & Associates', 'Rivera Enterprise Cloud Solutions', 'Siddharth Rao (Chief Software Architect)'),
      (5, 1, 5, 'Horizon Life Sciences Labs v. Controller General of Patents', 'W.P.(C) No. 8920/2025', 'Writ Petition (Constitutional / Patent)', 'Writ Petition under Article 226 challenging Patent Office refusal order under Section 3(d) of Patents Act, 1970 concerning synthetic peptide therapeutic efficacy.', 'Closed', 'High Court of Delhi (Intellectual Property Division)', 'Hon''ble Smt. Justice Prathiba M. Singh', '2025-06-10', '2026-02-28', 1200000.00, 1184000.00, 'Union of India & Controller General of Patents, Designs and Trade Marks', 'Additional Solicitor General of India (ASG)', 'Horizon Pharmaceuticals Switzerland AG', 'Dr. Ramesh Narayan (Chief Scientific Officer)')
    `);
    console.log('Cases seeded.');

    // 4. Insert Documents (Indian Legal Pleadings)
    await db.query(`
      INSERT INTO documents (case_id, doc_name, doc_type, file_path, file_size, uploaded_by) VALUES
      (1, 'Plaint_with_Statement_of_Truth_Apex_Comm_OS_481.pdf', 'Plaint / Statement of Truth', '/uploads/plaint_apex.pdf', 2450000, 1),
      (1, 'Master_MultiModal_Transport_Agreement_2025.pdf', 'Commercial Contract', '/uploads/freight_agreement.pdf', 1890000, 1),
      (2, 'Vance_Registered_Will_and_Death_Certificate.pdf', 'Probate Record', '/uploads/vance_will.pdf', 3120000, 1),
      (3, 'SEBI_Show_Cause_Notice_and_SAT_Appeal_Memo.pdf', 'Regulatory Appeal Memo', '/uploads/sterling_termsheet.pdf', 980000, 2),
      (4, 'Trade_Marks_Registry_Registration_Certificate_TM_542011.pdf', 'IP Trademark Certificate', '/uploads/uspto_cert.pdf', 620000, 2),
      (5, 'High_Court_Final_Judgment_and_Decree_WP_8920.pdf', 'Court Judgment / Decree', '/uploads/horizon_settlement.pdf', 4150000, 1)
    `);
    console.log('Documents seeded.');

    // 5. Insert Time Entries (Advocate Fees in ₹ INR)
    await db.query(`
      INSERT INTO time_entries (user_id, case_id, description, hours, hourly_rate, entry_date, is_billable) VALUES
      (1, 1, 'Drafted Plaint and Statement of Truth under Order VI Rule 15A CPC; settled list of documents for Commercial Court filing', 3.50, 4500.00, '2026-03-28', 1),
      (1, 1, 'Chambers conference with Senior Counsel regarding interim injunction application under Order XXXIX Rules 1 & 2 CPC', 2.00, 4500.00, '2026-03-29', 1),
      (1, 2, 'Hearing before Hon''ble Justice Bharati Dangre on citations and verification of attesting witnesses under Section 281 Succession Act', 2.50, 4000.00, '2026-03-30', 1),
      (2, 3, 'Drafting SAT Appeal Grounds and Compilation of Documents against SEBI Adjudication Officer Order', 4.00, 3500.00, '2026-04-01', 1),
      (2, 4, 'Drafting Cease & Desist Notice under Section 29 of Trade Marks Act, 1999 and reviewing comparative mark similarities', 1.75, 3500.00, '2026-04-02', 1),
      (1, 1, 'Appearance before City Civil Court Commercial Division for orders on I.A. No. 1/2026; summons issued to defendant', 1.25, 4500.00, '2026-04-03', 1),
      (2, 3, 'Due diligence conference with General Counsel of Sterling and independent SEBI compliance auditor', 2.25, 3500.00, '2026-04-04', 1)
    `);
    console.log('Time entries seeded.');

    // 6. Insert Calendar Events (Indian Courts, Cause Lists & Procedural Triggers)
    await db.query(`
      INSERT INTO calendar_events (user_id, case_id, client_id, title, event_type, start_time, end_time, location, court_room, judge_name, reminder_minutes, notes, is_statute_of_limitations, priority) VALUES
      (1, 1, 1, 'Order XXXIX Hearing on Interim Injunction (I.A. 1/2026)', 'Hearing', '2026-04-10 11:00:00', '2026-04-10 12:30:00', 'City Civil Court Complex, KG Road, Bengaluru', 'Court Hall No. 4', 'Hon''ble Sri Justice R. Devdas', 1440, 'Arguments on ex-parte ad-interim injunction restraining disposal of cold-storage equipment.', 0, 'Critical'),
      (1, 1, 1, 'Cross-Examination of PW-1 (Chief Logistics Officer)', 'Deposition', '2026-04-15 14:00:00', '2026-04-15 16:30:00', 'Advocate Commissioner Chambers / Commercial Court', 'Court Hall No. 4', 'Hon''ble Sri Justice R. Devdas', 1440, 'Evidence recording under Order XVIII Rule 4 CPC through Court Commissioner.', 0, 'High'),
      (1, 2, 2, 'Probate Hearing: Section 276 Indian Succession Act Examination of Attesting Witness', 'Hearing', '2026-04-18 11:30:00', '2026-04-18 13:00:00', 'High Court of Bombay, Fort, Mumbai', 'Court Room 12', 'Hon''ble Smt. Justice Bharati Dangre', 1440, 'Evidence of Dr. Joshi attesting execution of Last Will & Testament.', 0, 'High'),
      (2, 3, 3, 'Hearing before Securities Appellate Tribunal (SAT Appeal No. 204/2026)', 'Hearing', '2026-04-22 10:30:00', '2026-04-22 12:00:00', 'Earnest House, Nariman Point, Mumbai', 'Court Room 1', 'Hon''ble Presiding Officer Justice P.S. Dinesh Kumar', 1440, 'Final oral arguments on interpretation of SEBI AIF Regulations and safe harbour provisions.', 0, 'Critical'),
      (2, 4, 4, 'Commercial Division Injunction Hearing under Order 39 Rules 1 & 2 CPC', 'Hearing', '2026-04-25 10:30:00', '2026-04-25 12:00:00', 'High Court of Karnataka, Opp. Vidhana Soudha, Bengaluru', 'Court Hall 2', 'Hon''ble Sri Justice M. Nagaprasanna', 1440, 'Arguments on prima facie case and balance of convenience for restraining software trademark dilution.', 0, 'Critical'),
      (1, 1, 1, 'Statutory Written Statement 30-Day Deadline (Order VIII Rule 1 CPC)', 'Filing Deadline', '2026-05-15 17:00:00', '2026-05-15 17:00:00', 'Commercial Court Registry, Bengaluru', 'Filing Counter 2', 'Court Registry', 2880, 'Statutory 30-day deadline for defendant to file Written Statement under Commercial Courts Act 2015. Absolute 120-day forfeiture applies.', 1, 'Critical')
    `);
    console.log('Calendar events seeded.');

    // 7. Insert Retainer Agreements (Vakalatnama & Legal Services Retainer)
    const retainerTerms = `LEGAL SERVICES ENGAGEMENT & VAKALATNAMA RETAINER AGREEMENT
Pursuant to the Advocates Act, 1961 and Bar Council of India Rules (Part VI, Chapter II)

1. SCOPE OF ENGAGEMENT & VAKALATNAMA: Chambers of JusticeFlow Advocates agrees to provide comprehensive legal representation to Apex Global Logistics India Pvt Ltd in Comm. O.S. No. 481/2026 before the Hon'ble City Civil & Commercial Court, Bengaluru. Representation encompasses drafting and settling plaints, interlocutory applications under Order XXXIX CPC, discovery under Order XI CPC, leading evidence, and final oral arguments.

2. ADVOCATE RETENTION & CLIENT TRUST ESCROW: Client agrees to deposit an advance retainer of ₹1,50,000/- (Rupees One Lakh Fifty Thousand Only) into the Advocate's Dedicated Client Trust Escrow Account as ethically required under Bar Council of India Rule 24. Professional fee deductions shall only occur upon formal submission of itemized professional bills.

3. COURT EXPENSES, STAMP DUTY & WELFARE FUND: All statutory court fees under Karnataka Court Fees and Suits Valuation Act, 1958, process fees, translation costs, and Advocate Welfare Fund stamps shall be reimbursed at actuals by the Client.

4. PROFESSIONAL PRIVILEGE & DISCHARGE: All communications are strictly privileged under Section 126 of the Indian Evidence Act, 1872. Client or Counsel may terminate engagement upon formal discharge of Vakalatnama with leave of the Court.`;

    await db.query(`
      INSERT INTO retainer_agreements (id, case_id, client_id, title, version, fee_type, retainer_amount, hourly_rate, terms_content, redline_notes, status, signer_name, signer_email, signed_at, created_by) VALUES
      (1, 1, 1, 'Vakalatnama & Legal Services Retainer: Apex Commercial Suit (Comm. O.S. 481/2026)', 'v1.0', 'Retainer Draw', 150000.00, 4500.00, ?, 'Executed engagement agreement and stamped Vakalatnama filed before Commercial Court Registry', 'Signed', 'Rajesh Sharma (Director, Apex Logistics)', 'legal@apexlogistic.com', '2026-01-16 11:30:00', 1)
    `, [retainerTerms]);
    console.log('Retainer agreement seeded.');

    // 8. Insert Invoices & Client Escrow (INR ₹)
    await db.query(`
      INSERT INTO trust_accounts (id, client_id, account_number, balance) VALUES
      (1, 1, 'ESCROW-KAR-2026-001', 150000.00),
      (2, 2, 'ESCROW-MAH-2026-002', 80000.00),
      (3, 3, 'ESCROW-DEL-2026-003', 120000.00)
    `);

    await db.query(`
      INSERT INTO trust_transactions (trust_account_id, case_id, type, amount, description, reference_number, transaction_date) VALUES
      (1, 1, 'Deposit', 200000.00, 'Initial retainer advance deposit under BCI Rule 24 for Commercial Suit Comm. O.S. 481/2026', 'NEFT-HDFC-984210', '2026-01-16'),
      (1, 1, 'Disbursement', 50000.00, 'Earned professional fee disbursement for drafting Plaint & Order 39 interim application', 'FEE-DISB-0112', '2026-02-15')
    `);

    await db.query(`
      INSERT INTO invoices (id, invoice_number, client_id, case_id, issue_date, due_date, subtotal, tax, total, amount_paid, status, notes) VALUES
      (1, 'INV-2026-001', 1, 1, '2026-02-15', '2026-03-01', 50000.00, 9000.00, 59000.00, 59000.00, 'Paid', 'Professional fee for Plaint drafting & filing (18% GST included). Disbursed from Client Escrow.'),
      (2, 'INV-2026-002', 1, 1, '2026-03-31', '2026-04-15', 35000.00, 6300.00, 41300.00, 0.00, 'Sent', 'Professional appearance fee before Hon''ble Commercial Court for Order 39 hearing (I.A. 1/2026).')
    `);

    await db.query(`
      INSERT INTO invoice_items (invoice_id, time_entry_id, description, hours, rate, amount) VALUES
      (1, 1, 'Drafted Plaint and Statement of Truth under Order VI Rule 15A CPC; settled list of documents for Commercial Court filing', 3.50, 4500.00, 50000.00),
      (2, 6, 'Appearance before City Civil Court Commercial Division for orders on I.A. No. 1/2026', 1.25, 4500.00, 35000.00)
    `);
    console.log('Invoices & Trust accounts seeded.');

    // 9. Insert Audit Logs
    await db.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES
      (1, 'JusticeFlow Indian Legal Practice OS initialized with High Courts & Commercial Courts jurisdiction', 'SYSTEM', 1),
      (1, 'Filed Comm. O.S. No. 481/2026 before Hon''ble Commercial Court, Bengaluru', 'CASE', 1),
      (1, 'Executed BCI-compliant Vakalatnama & Retainer Agreement v1.0', 'RETAINER', 1),
      (1, 'Received ₹2,00,000/- into Dedicated Client Escrow Account (ESCROW-KAR-2026-001)', 'TRUST_ACCOUNT', 1)
    `);
    console.log('Audit logs seeded.');
  } else {
    console.log(`Database already has ${existingUsers[0].count} users. Use 'npm run db:setup -- --force' to reseed.`);
  }

  await db.end();
  console.log('✅ Database setup and verification completed successfully!');
}

setupDatabase().catch(err => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
