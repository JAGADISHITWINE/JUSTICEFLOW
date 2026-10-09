const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  console.log('--- Initializing JusticeFlow Database (Indian Courts & Bar Council Practice OS) ---');

  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Itwinetech@1234'
  });

  const dbName = process.env.DB_NAME || 'justiceflow_db';
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`Database '${dbName}' verified/created.`);
  await rootConn.end();

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Itwinetech@1234',
    database: dbName,
    multipleStatements: true
  });

  const sqlPath = path.join(__dirname, 'setup.sql');
  const schemaSql = fs.readFileSync(sqlPath, 'utf8');
  await db.query(schemaSql);
  console.log('Database schema verified.');

  console.log('Clearing old data and seeding authentic Indian Legal Practice & Court Case data...');

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
    (2, 'sarah.jenkins@justiceflow.com', ?, 'Advocate Sarah Jenkins (Litigation Partner, D/2104/2016)', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'lawyer'),
    (3, 'marcus.ross@justiceflow.com', ?, 'Advocate Marcus Ross (Senior Associate, MAH/3910/2018)', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'lawyer')`,
    [passwordHash, passwordHash, passwordHash]
  );
  console.log('Users seeded.');

  // 2. Insert Clients (Real Indian Corporates, Family Trusts, Tech Unicorns)
  await db.query(`
    INSERT INTO clients (id, user_id, name, email, phone, address, city, state, zip_code, status, is_email_verified) VALUES
    (1, 1, 'Apex Global Logistics India Pvt Ltd', 'legal@apexlogistic.com', '+91 (080) 4123-5678', 'Level 8, Prestige Meridian, 29 M.G. Road', 'Bengaluru', 'Karnataka', '560001', 'Active', 1),
    (2, 1, 'Dr. Vikramaditya Singhania (HUF Family Trust)', 'singhania.family@vancetrust.org', '+91 (022) 2284-5432', '14 Nariman Point, Marine Drive', 'Mumbai', 'Maharashtra', '400021', 'Active', 1),
    (3, 2, 'Sterling & Cross Capital Advisory LLP', 'investments@sterlingcross.com', '+91 (011) 2331-6789', 'Barakhamba Road, Connaught Place', 'New Delhi', 'Delhi', '110001', 'Active', 1),
    (4, 2, 'CloudByte Infotech Pvt Ltd', 'contact@cloudbyteinfo.io', '+91 99000 23456', '776 100ft Road, HAL 2nd Stage, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 'Active', 1),
    (5, 1, 'Horizon Life Sciences Labs Pvt Ltd', 'ip-desk@horizonbio.com', '+91 (040) 2340-1234', 'Plot 12, Phase-II, Genome Valley, Shameerpet', 'Hyderabad', 'Telangana', '500078', 'Active', 1),
    (6, 1, 'Adani Energy Infrastructure Ltd', 'legal.power@adaniinfrastructure.in', '+91 (079) 2656-5555', 'Adani Shantigram, SG Highway', 'Ahmedabad', 'Gujarat', '382421', 'Active', 1),
    (7, 2, 'Tata Consumer Products Logistics Division', 'counsel@tataconsumer.com', '+91 (022) 6665-8282', 'Bombay House, 24 Homi Mody Street', 'Mumbai', 'Maharashtra', '400001', 'Active', 1),
    (8, 3, 'Orbit Realtors & Developers Pvt Ltd', 'corporate@orbitrealtors.in', '+91 (0124) 456-7890', 'DLF Cyber City, Tower 10', 'Gurugram', 'Haryana', '122002', 'Inactive', 1)
  `);
  console.log('Clients seeded.');

  // 3. Insert Cases (Real Indian Courts: Commercial Courts, Bombay HC, Delhi HC, Karnataka HC, Criminal Court, Family Court, SAT, NCLT)
  await db.query(`
    INSERT INTO cases (id, user_id, client_id, case_name, case_number, cnr_number, case_type, court_forum, fir_number, police_station, description, status, court_name, judge_name, filing_date, expected_close_date, budget, spent, adverse_party, opposing_counsel, corporate_affiliates, witnesses) VALUES
    (1, 1, 1, 'Apex Global Logistics v. QuickFreight Multi-Modal Logistics Pvt Ltd', 'Comm. O.S. No. 481/2026', 'KABC010048122026', 'Commercial Suit (Commercial Courts Act 2015)', 'Commercial Court', NULL, NULL, 'Commercial suit for recovery of ₹1,25,00,000/- with 18% p.a. interest towards cargo spoilage under Carriage by Road Act 2007; interim injunction application under Order XXXIX Rules 1 & 2 CPC.', 'Open', 'City Civil & Commercial Court, Bengaluru', 'Hon''ble Sri Justice R. Devdas', '2026-01-15', '2026-11-30', 750000.00, 246000.00, 'QuickFreight Multi-Modal Logistics Pvt Ltd', 'Advocate V.K. Murthy & Associates', 'QuickFreight Holdings India Ltd, Apex Cargo Intermodal', 'David Miller (Logistics Head), Rajesh Sharma (Port Operations)'),
    (2, 1, 2, 'Singhania Family Custody & Matrimonial Petition (Sec 125 CrPC & Guardianship)', 'Matrimonial Pet. No. 112/2026', 'MHFC020011242026', 'Matrimonial & Child Custody', 'Family Court', NULL, NULL, 'Petition under Section 7 of Family Courts Act, 1984 read with Guardians and Wards Act for interim child custody and monthly maintenance adjudication.', 'Open', 'Principal Judge Family Court, Bandra, Mumbai', 'Hon''ble Smt. Justice Bharati Dangre', '2026-02-01', '2026-09-15', 450000.00, 145000.00, 'Respondent: Dr. Ananya Singhania', 'Advocate Soli Dastoor & Partners', 'Singhania Family Holdings Trust', 'Dr. Arvind Joshi (Child Psychologist)'),
    (3, 2, 3, 'Sterling Capital Advisory v. Securities and Exchange Board of India (SEBI)', 'SAT Appeal No. 204/2026', 'MHSAT01002042026', 'Securities Appellate Tribunal (SAT)', 'NCLT Tribunal', NULL, NULL, 'Appellate proceedings under Section 15T of SEBI Act, 1992 challenging regulatory adjudication order concerning AIF Category II Private Placement Memorandum (PPM) disclosures.', 'Pending', 'Securities Appellate Tribunal (SAT), Mumbai', 'Hon''ble Presiding Officer Justice P.S. Dinesh Kumar', '2026-02-18', '2026-07-30', 650000.00, 285000.00, 'Securities and Exchange Board of India (SEBI)', 'Senior Advocate Arvind Kamath with K. Ashwath', 'Sterling Capital Mauritius, Cross Alpha Syndicate', 'Prakash Chandra (Compliance Officer), Meera Sen (Fund Auditor)'),
    (4, 2, 4, 'CloudByte Infotech v. SkyByte Cloud Networks (Trademark Infringement Suit)', 'Comm. Suit (IP) No. 94/2026', 'KAHC010094122026', 'Intellectual Property Litigation', 'High Court', NULL, NULL, 'Suit under Sections 29 & 135 of Trade Marks Act, 1999 seeking permanent injunction restraining infringement of registered trademark ''CloudByte'' and rendition of accounts.', 'Open', 'High Court of Karnataka (Commercial Division), Bengaluru', 'Hon''ble Sri Justice M. Nagaprasanna', '2026-03-05', '2026-12-31', 400000.00, 112000.00, 'SkyByte Cloud Networks Pvt Ltd', 'Advocate D.L.N. Rao & Associates', 'Rivera Enterprise Cloud Solutions', 'Siddharth Rao (Chief Software Architect)'),
    (5, 1, 5, 'Horizon Life Sciences Labs v. Controller General of Patents', 'W.P.(C) No. 8920/2025', 'DLHC010089202025', 'Writ Petition (Constitutional / Patent)', 'High Court', NULL, NULL, 'Writ Petition under Article 226 challenging Patent Office refusal order under Section 3(d) of Patents Act, 1970 concerning synthetic peptide therapeutic efficacy.', 'Open', 'High Court of Delhi (Intellectual Property Division)', 'Hon''ble Smt. Justice Prathiba M. Singh', '2025-06-10', '2026-08-31', 1200000.00, 480000.00, 'Union of India & Controller General of Patents, Designs and Trade Marks', 'Additional Solicitor General of India (ASG)', 'Horizon Pharmaceuticals Switzerland AG', 'Dr. Ramesh Narayan (Chief Scientific Officer)'),
    (6, 1, 6, 'Adani Energy Infrastructure v. Bharat Heavy Power Corporation Ltd', 'Arb. Pet. No. 340/2026', 'DLHC010034012026', 'Commercial Arbitration & Section 9 Petitions', 'High Court', NULL, NULL, 'Section 9 petition under Arbitration & Conciliation Act, 1996 for interim protection restraining encashment of Bank Guarantee worth ₹18.5 Crores under Turnkey EPC contract.', 'Pending', 'High Court of Delhi (Commercial Division)', 'Hon''ble Sri Justice Sanjeev Narula', '2026-03-12', '2026-10-15', 850000.00, 310000.00, 'Bharat Heavy Power Corporation Ltd', 'Senior Advocate Mukul Rohatgi & Associates', 'Adani Green Energy Ltd, Adani Transmission Infra', 'Vikramaditya Bose (VP Projects), S. Ramanathan (Lead Engineer)'),
    (7, 2, 7, 'Tata Consumer Products v. FastRetail Hypermarkets Ltd (Insolvency Resolution)', 'CP (IB) No. 182/BB/2026', 'KANCLT01001822026', 'National Company Law Tribunal (IBC 2016)', 'NCLT Tribunal', NULL, NULL, 'Section 9 petition under Insolvency and Bankruptcy Code, 2016 initiated by Operational Creditor for default of ₹3,40,00,000/- for delivered goods.', 'Open', 'National Company Law Tribunal (NCLT), Bengaluru Bench', 'Hon''ble Member (Judicial) K. Biswal', '2026-03-20', '2026-11-15', 600000.00, 190000.00, 'FastRetail Hypermarkets Ltd', 'Advocate Shardul Amarchand Mangaldas & Co', 'Tata Consumer Holdings, FastRetail India', 'Anil Deshmukh (Head Finance), R.K. Menon (Audit Officer)'),
    (8, 3, 3, 'State (Govt of NCT Delhi) & Sterling Capital v. Orbit Promoters (Sec 420 IPC & Bail)', 'Sessions Case No. 5812/2026', 'DLCT020058122026', 'Criminal Breach of Trust & Fraud (IPC/BNS)', 'Criminal Court', 'FIR No. 214/2026', 'Barakhamba Road Police Station, New Delhi', 'Criminal trial under Sections 406, 420 & 120B IPC; regular bail opposition and prosecution evidence stage.', 'Pending', 'District & Sessions Court, Patiala House, New Delhi', 'Hon''ble Additional Sessions Judge Court No. 5', '2026-03-25', '2026-12-20', 300000.00, 95000.00, 'Orbit Realtors & Promoters (Accused)', 'Advocate Karanjawala & Co', 'Sterling Special Opportunities Fund', 'Hemant Goel (Authorized Representative)')
  `);
  console.log('Cases seeded.');

  // 4. Insert Documents (Real Pleadings, Affidavits, Vakalatnamas, Notices)
  await db.query(`
    INSERT INTO documents (case_id, doc_name, doc_type, file_path, file_size, uploaded_by) VALUES
    (1, 'Plaint_with_Statement_of_Truth_Apex_Comm_OS_481.pdf', 'Plaint / Statement of Truth', '/uploads/plaint_apex.pdf', 2450000, 1),
    (1, 'Master_MultiModal_Transport_Agreement_2025.pdf', 'Commercial Contract', '/uploads/freight_agreement.pdf', 1890000, 1),
    (1, 'Interim_Injunction_Application_IA_1_2026_CPC.pdf', 'Interlocutory Application (Order 39)', '/uploads/ia_injunction.pdf', 840000, 1),
    (2, 'Singhania_Registered_Will_and_Death_Certificate.pdf', 'Probate Record', '/uploads/vance_will.pdf', 3120000, 1),
    (2, 'Citation_Notice_and_Affidavit_of_Attesting_Witness.pdf', 'Court Affidavit', '/uploads/citation_affidavit.pdf', 960000, 1),
    (3, 'SEBI_Show_Cause_Notice_and_SAT_Appeal_Memo.pdf', 'Regulatory Appeal Memo', '/uploads/sterling_termsheet.pdf', 980000, 2),
    (4, 'Trade_Marks_Registry_Registration_Certificate_TM_542011.pdf', 'IP Trademark Certificate', '/uploads/uspto_cert.pdf', 620000, 2),
    (5, 'High_Court_Writ_Petition_and_Patent_Opposition_Brief.pdf', 'Constitutional Writ Paperbook', '/uploads/horizon_settlement.pdf', 4150000, 1),
    (6, 'Section_9_Arbitration_Petition_and_Bank_Guarantee_Injunction.pdf', 'Arbitration Petition', '/uploads/adani_section9.pdf', 2850000, 1),
    (7, 'IBC_Section_8_Demand_Notice_and_Invoices_Compilation.pdf', 'Insolvency Statutory Notice', '/uploads/ibc_section8.pdf', 3400000, 2),
    (8, 'Section_138_NI_Act_Statutory_Legal_Demand_Notice.pdf', 'Statutory Demand Notice', '/uploads/ni_notice.pdf', 720000, 3)
  `);
  console.log('Documents seeded.');

  // 5. Insert Time Entries (Advocate Billable Hours in ₹ INR)
  await db.query(`
    INSERT INTO time_entries (user_id, case_id, description, hours, hourly_rate, entry_date, is_billable) VALUES
    (1, 1, 'Drafted Plaint and Statement of Truth under Order VI Rule 15A CPC; settled list of documents for Commercial Court filing', 3.50, 4500.00, '2026-03-28', 1),
    (1, 1, 'Chambers conference with Senior Counsel regarding interim injunction application under Order XXXIX Rules 1 & 2 CPC', 2.00, 4500.00, '2026-03-29', 1),
    (1, 2, 'Hearing before Hon''ble Justice Bharati Dangre on citations and verification of attesting witnesses under Section 281 Succession Act', 2.50, 4000.00, '2026-03-30', 1),
    (2, 3, 'Drafting SAT Appeal Grounds and Compilation of Documents against SEBI Adjudication Officer Order', 4.00, 3500.00, '2026-04-01', 1),
    (2, 4, 'Drafting Cease & Desist Notice under Section 29 of Trade Marks Act, 1999 and reviewing comparative mark similarities', 1.75, 3500.00, '2026-04-02', 1),
    (1, 1, 'Appearance before City Civil Court Commercial Division for orders on I.A. No. 1/2026; summons issued to defendant', 1.25, 4500.00, '2026-04-03', 1),
    (2, 3, 'Due diligence conference with General Counsel of Sterling and independent SEBI compliance auditor', 2.25, 3500.00, '2026-04-04', 1),
    (1, 6, 'Drafting Section 9 petition under Arbitration Act to restrain wrongful invocation of Bank Guarantee of ₹18.5 Cr', 3.75, 5000.00, '2026-04-05', 1),
    (2, 7, 'Settling Section 9 IBC petition before NCLT Bengaluru Bench with operational debt ledger reconciliation', 2.50, 4000.00, '2026-04-06', 1),
    (3, 8, 'Issuance and dispatch of statutory demand notice under Section 138 of NI Act via Registered Post with A.D.', 1.50, 3000.00, '2026-04-07', 1),
    (1, 5, 'Preparation of comparative efficacy data matrix under Section 3(d) of Patents Act for High Court hearing', 2.75, 4500.00, '2026-04-08', 1)
  `);
  console.log('Time entries seeded.');

  // 6. Insert Calendar Events (Real Indian Court Hearings, Cause Lists & Limitation Deadlines)
  await db.query(`
    INSERT INTO calendar_events (user_id, case_id, client_id, title, event_type, start_time, end_time, location, court_room, judge_name, reminder_minutes, notes, is_statute_of_limitations, priority) VALUES
    (1, 1, 1, 'Order XXXIX Hearing on Interim Injunction (I.A. 1/2026)', 'Hearing', '2026-04-12 11:00:00', '2026-04-12 12:30:00', 'City Civil Court Complex, KG Road, Bengaluru', 'Court Hall No. 4', 'Hon''ble Sri Justice R. Devdas', 1440, 'Arguments on ex-parte ad-interim injunction restraining disposal of cold-storage equipment.', 0, 'Critical'),
    (1, 1, 1, 'Cross-Examination of PW-1 (Chief Logistics Officer)', 'Deposition', '2026-04-16 14:00:00', '2026-04-16 16:30:00', 'Advocate Commissioner Chambers / Commercial Court', 'Court Hall No. 4', 'Hon''ble Sri Justice R. Devdas', 1440, 'Evidence recording under Order XVIII Rule 4 CPC through Court Commissioner.', 0, 'High'),
    (1, 2, 2, 'Probate Hearing: Examination of Attesting Witness (Section 281 Succession Act)', 'Hearing', '2026-04-19 11:30:00', '2026-04-19 13:00:00', 'High Court of Bombay, Fort, Mumbai', 'Court Room 12', 'Hon''ble Smt. Justice Bharati Dangre', 1440, 'Evidence of Dr. Joshi attesting execution of Last Will & Testament.', 0, 'High'),
    (2, 3, 3, 'Hearing before Securities Appellate Tribunal (SAT Appeal No. 204/2026)', 'Hearing', '2026-04-22 10:30:00', '2026-04-22 12:00:00', 'Earnest House, Nariman Point, Mumbai', 'Court Room 1', 'Hon''ble Presiding Officer Justice P.S. Dinesh Kumar', 1440, 'Final oral arguments on interpretation of SEBI AIF Regulations and safe harbour provisions.', 0, 'Critical'),
    (2, 4, 4, 'Commercial Division Injunction Hearing under Order 39 Rules 1 & 2 CPC', 'Hearing', '2026-04-25 10:30:00', '2026-04-25 12:00:00', 'High Court of Karnataka, Opp. Vidhana Soudha, Bengaluru', 'Court Hall 2', 'Hon''ble Sri Justice M. Nagaprasanna', 1440, 'Arguments on prima facie case and balance of convenience for restraining software trademark dilution.', 0, 'Critical'),
    (1, 6, 6, 'Section 9 Injunction Arguments before Delhi High Court Commercial Division', 'Hearing', '2026-04-28 10:30:00', '2026-04-28 12:00:00', 'High Court of Delhi, Shershah Road, New Delhi', 'Court Room 31', 'Hon''ble Sri Justice Sanjeev Narula', 1440, 'Urgent interim protection against wrongful encashment of Bank Guarantee.', 0, 'Critical'),
    (2, 7, 7, 'NCLT Admission Hearing: CP (IB) No. 182/BB/2026 (Operational Debt)', 'Hearing', '2026-05-04 11:00:00', '2026-05-04 12:30:00', 'NCLT Corporate Bhavan, Raheja Towers, MG Road, Bengaluru', 'Court Hall 1', 'Hon''ble Member (Judicial) K. Biswal', 1440, 'Arguments on section 9 IBC debt admission and pre-existing dispute objection.', 0, 'High'),
    (1, 1, 1, 'Statutory Written Statement 30-Day Deadline (Order VIII Rule 1 CPC)', 'Filing Deadline', '2026-05-15 17:00:00', '2026-05-15 17:00:00', 'Commercial Court Registry, Bengaluru', 'Filing Counter 2', 'Court Registry', 2880, 'Statutory 30-day deadline for defendant to file Written Statement under Commercial Courts Act 2015. Absolute 120-day forfeiture applies.', 1, 'Critical'),
    (3, 8, 3, 'Limitation Deadline: Section 138 NI Act 30-Day Court Filing Expiry', 'Filing Deadline', '2026-05-20 16:30:00', '2026-05-20 16:30:00', 'Metropolitan Magistrate Registry, Patiala House Courts, New Delhi', 'Registry Counter 4', 'Chief Metropolitan Magistrate', 2880, 'Statutory deadline under Section 142(1)(b) NI Act to file formal complaint within 30 days of notice expiry.', 1, 'Critical')
  `);
  console.log('Calendar events seeded.');

  // 7. Insert Retainer Agreements (BCI Rule 24 Compliant Vakalatnamas & Agreements)
  const retainerTerms1 = `LEGAL SERVICES ENGAGEMENT & VAKALATNAMA RETAINER AGREEMENT
Pursuant to the Advocates Act, 1961 and Bar Council of India Rules (Part VI, Chapter II)

1. SCOPE OF ENGAGEMENT & VAKALATNAMA: Chambers of JusticeFlow Advocates agrees to provide comprehensive legal representation to Apex Global Logistics India Pvt Ltd in Comm. O.S. No. 481/2026 before the Hon'ble City Civil & Commercial Court, Bengaluru. Representation encompasses drafting and settling plaints, interlocutory applications under Order XXXIX CPC, discovery under Order XI CPC, leading evidence, and final oral arguments.

2. ADVOCATE RETENTION & CLIENT TRUST ESCROW: Client agrees to deposit an advance retainer of ₹1,50,000/- (Rupees One Lakh Fifty Thousand Only) into the Advocate's Dedicated Client Trust Escrow Account as ethically required under Bar Council of India Rule 24. Professional fee deductions shall only occur upon formal submission of itemized professional bills.

3. COURT EXPENSES, STAMP DUTY & WELFARE FUND: All statutory court fees under Karnataka Court Fees and Suits Valuation Act, 1958, process fees, translation costs, and Advocate Welfare Fund stamps shall be reimbursed at actuals by the Client.

4. PROFESSIONAL PRIVILEGE & DISCHARGE: All communications are strictly privileged under Section 126 of the Indian Evidence Act, 1872. Client or Counsel may terminate engagement upon formal discharge of Vakalatnama with leave of the Court.`;

  const retainerTerms2 = `GENERAL CORPORATE LEGAL ADVISORY & REGULATORY RETAINER AGREEMENT
Chambers of JusticeFlow Advocates & Sterling Cross Capital Advisory LLP

1. SCOPE OF REGULATORY ADVISORY: Ongoing legal counsel concerning SEBI AIF Regulations, SAT litigation, FEMA compliance, and RBI cross-border fund structuring for Alternative Investment Funds (Cat II).

2. MONTHLY ADVISORY DRAW: Fixed monthly retainer draw of ₹1,20,000/- per calendar month, covering up to 30 advisory hours. Specialized SAT hearing appearances billed separately at ₹35,000/- per hearing brief.`;

  const retainerTerms3 = `INTELLECTUAL PROPERTY LITIGATION & ENFORCEMENT RETAINER
Client: CloudByte Infotech Pvt Ltd | Matter: High Court of Karnataka Comm. Suit No. 94/2026

1. SCOPE OF REPRESENTATION: Trademark enforcement, Anton Piller civil search and seizure applications, cease & desist proceedings, and commercial injunction trial representation before the High Court of Karnataka Commercial Division.`;

  await db.query(`
    INSERT INTO retainer_agreements (id, case_id, client_id, title, version, fee_type, retainer_amount, hourly_rate, terms_content, redline_notes, status, signer_name, signer_email, signed_at, created_by) VALUES
    (1, 1, 1, 'Vakalatnama & Legal Services Retainer: Apex Commercial Suit (Comm. O.S. 481/2026)', 'v1.0', 'Retainer Draw', 150000.00, 4500.00, ?, 'Executed engagement agreement and stamped Vakalatnama filed before Commercial Court Registry', 'Signed', 'Rajesh Sharma (Director, Apex Logistics)', 'legal@apexlogistic.com', '2026-01-16 11:30:00', 1),
    (2, 3, 3, 'Regulatory Advisory & SAT Litigation Engagement (Sterling Capital)', 'v1.0', 'Retainer Draw', 200000.00, 3500.00, ?, 'Executed regulatory retainer agreement for Securities Appellate Tribunal proceedings', 'Signed', 'Prakash Chandra (Head Compliance, Sterling Capital)', 'investments@sterlingcross.com', '2026-02-20 14:15:00', 2),
    (3, 4, 4, 'IP Trademark Enforcement & High Court Litigation Retainer (CloudByte)', 'v1.0', 'Flat Fee', 120000.00, 3500.00, ?, 'Engagement letter sent to client board for digital signature', 'Sent', 'Siddharth Rao (CEO, CloudByte)', 'contact@cloudbyteinfo.io', NULL, 2),
    (4, 6, 6, 'EPC Turnkey Arbitration Retainer (Adani Energy v. BHPC)', 'v1.0', 'Hourly', 350000.00, 5000.00, 'Arbitration agreement and Section 9 representation retainer terms.', 'Internal draft prepared by Managing Partner', 'Draft', NULL, NULL, NULL, 1)
  `, [retainerTerms1, retainerTerms2, retainerTerms3]);
  console.log('Retainer agreements seeded.');

  // 8. Insert Invoices & Client Escrow (INR ₹ with 18% GST)
  await db.query(`
    INSERT INTO trust_accounts (id, client_id, account_number, balance) VALUES
    (1, 1, 'ESCROW-KAR-2026-001', 150000.00),
    (2, 2, 'ESCROW-MAH-2026-002', 80000.00),
    (3, 3, 'ESCROW-DEL-2026-003', 120000.00),
    (4, 6, 'ESCROW-GUJ-2026-004', 350000.00)
  `);

  await db.query(`
    INSERT INTO trust_transactions (trust_account_id, case_id, type, amount, description, reference_number, transaction_date) VALUES
    (1, 1, 'Deposit', 200000.00, 'Initial retainer advance deposit under BCI Rule 24 for Commercial Suit Comm. O.S. 481/2026', 'NEFT-HDFC-984210', '2026-01-16'),
    (1, 1, 'Disbursement', 50000.00, 'Earned professional fee disbursement for drafting Plaint & Order 39 interim application', 'FEE-DISB-0112', '2026-02-15'),
    (3, 3, 'Deposit', 150000.00, 'Advance escrow deposit for SAT Appeal No. 204/2026 regulatory hearing expenses', 'RTGS-ICICI-441029', '2026-02-21'),
    (4, 6, 'Deposit', 350000.00, 'Arbitration tribunal security and retainer draw deposit (Section 9 Delhi High Court)', 'NEFT-SBI-108823', '2026-03-15')
  `);

  await db.query(`
    INSERT INTO invoices (id, invoice_number, client_id, case_id, issue_date, due_date, subtotal, tax, total, amount_paid, status, notes) VALUES
    (1, 'INV-2026-001', 1, 1, '2026-02-15', '2026-03-01', 50000.00, 9000.00, 59000.00, 59000.00, 'Paid', 'Professional fee for Plaint drafting & filing (18% GST included). Disbursed from Client Escrow.'),
    (2, 'INV-2026-002', 1, 1, '2026-03-31', '2026-04-15', 35000.00, 6300.00, 41300.00, 0.00, 'Sent', 'Professional appearance fee before Hon''ble Commercial Court for Order 39 hearing (I.A. 1/2026).'),
    (3, 'INV-2026-003', 3, 3, '2026-03-10', '2026-03-25', 75000.00, 13500.00, 88500.00, 88500.00, 'Paid', 'SAT Appeal Memorandum drafting and compilation of statutory records (18% GST).'),
    (4, 'INV-2026-004', 4, 4, '2026-04-01', '2026-04-16', 45000.00, 8100.00, 53100.00, 0.00, 'Sent', 'Trademark Cease & Desist Notice and Commercial Division Injunction Application drafting.'),
    (5, 'INV-2026-005', 6, 6, '2026-04-05', '2026-04-20', 120000.00, 21600.00, 141600.00, 0.00, 'Sent', 'Section 9 Arbitration Petition drafting and Bank Guarantee emergency interim protection.'),
    (6, 'INV-2026-006', 2, 2, '2026-02-28', '2026-03-15', 40000.00, 7200.00, 47200.00, 47200.00, 'Paid', 'Probate Petition filing, citation notices publication, and court registry verification.')
  `);

  await db.query(`
    INSERT INTO invoice_items (invoice_id, time_entry_id, description, hours, rate, amount) VALUES
    (1, 1, 'Drafted Plaint and Statement of Truth under Order VI Rule 15A CPC; settled list of documents for Commercial Court filing', 3.50, 4500.00, 50000.00),
    (2, 6, 'Appearance before City Civil Court Commercial Division for orders on I.A. No. 1/2026', 1.25, 4500.00, 35000.00),
    (3, 4, 'Drafting SAT Appeal Grounds and Compilation of Documents against SEBI Adjudication Officer Order', 4.00, 3500.00, 75000.00),
    (4, 5, 'Drafting Cease & Desist Notice under Section 29 of Trade Marks Act, 1999', 1.75, 3500.00, 45000.00),
    (5, 8, 'Section 9 Arbitration Petition drafting to restrain Bank Guarantee encashment', 3.75, 5000.00, 120000.00),
    (6, 3, 'Hearing before Hon''ble Justice Bharati Dangre on citations & attesting witness verification', 2.50, 4000.00, 40000.00)
  `);
  console.log('Invoices & Trust accounts seeded.');

  // 9. Insert Conflict Checks (Bar Council of India Rule 33 & 36 Compliance)
  await db.query(`
    INSERT INTO conflict_checks (user_id, prospective_client, matter_type, adverse_parties, corporate_affiliates, opposing_counsel, witnesses, status, risk_score, audit_certificate_id, checked_by, notes) VALUES
    (1, 'QuickFreight Multi-Modal Logistics Pvt Ltd', 'Commercial Cargo Dispute', 'Apex Global Logistics India Pvt Ltd', 'Apex Cargo Intermodal, TransLogistics', 'Advocate Alexander Vance', 'David Miller', 'DIRECT_CONFLICT', 95, 'BCI-CERT-2026-001', 'Advocate Alexander Vance', 'DIRECT ADVERSITY DETECTED: Apex Global Logistics is an existing retained firm client in Comm. O.S. 481/2026. Bar Council Rule 33 strictly prohibits representation.'),
    (1, 'Adani Energy Infrastructure Ltd', 'Turnkey EPC Arbitration', 'Bharat Heavy Power Corporation Ltd', 'Adani Green Energy Ltd', 'Senior Advocate Mukul Rohatgi', 'Vikramaditya Bose', 'CLEARED', 0, 'BCI-CERT-2026-002', 'Advocate Alexander Vance', 'Zero conflict identified across all past and active litigation dockets. Representation ethically cleared.'),
    (2, 'Sterling & Cross Capital Advisory LLP', 'SEBI Regulatory Adjudication', 'Securities and Exchange Board of India', 'Sterling Capital Mauritius', 'Arvind Kamath', 'Prakash Chandra', 'CLEARED', 0, 'BCI-CERT-2026-003', 'Advocate Sarah Jenkins', 'No direct adversity or opposing client representation found. Firm cleared to lead SAT proceedings.'),
    (2, 'SkyByte Cloud Networks Pvt Ltd', 'IP Trademark Defense', 'CloudByte Infotech Pvt Ltd', 'Rivera Enterprise Cloud', 'Advocate D.L.N. Rao', 'Siddharth Rao', 'DIRECT_CONFLICT', 90, 'BCI-CERT-2026-004', 'Advocate Sarah Jenkins', 'Conflict detected: Firm currently represents CloudByte Infotech against SkyByte Cloud in Comm. Suit (IP) 94/2026.')
  `);
  console.log('Conflict checks seeded.');

  // 10. Insert Audit Logs
  await db.query(`
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES
    (1, 'JusticeFlow Indian Legal Practice OS initialized with High Courts & Commercial Courts jurisdiction', 'SYSTEM', 1),
    (1, 'Filed Comm. O.S. No. 481/2026 before Hon''ble Commercial Court, Bengaluru', 'CASE', 1),
    (1, 'Executed BCI-compliant Vakalatnama & Retainer Agreement v1.0 with Apex Global Logistics', 'RETAINER', 1),
    (1, 'Received ₹2,00,000/- into Dedicated Client Escrow Account (ESCROW-KAR-2026-001)', 'TRUST_ACCOUNT', 1),
    (2, 'Filed SAT Appeal No. 204/2026 before Securities Appellate Tribunal, Mumbai', 'CASE', 3),
    (2, 'Issued Section 29 Trademark Infringement Notice on behalf of CloudByte Infotech', 'CASE', 4),
    (1, 'Lodged Section 9 Emergency Injunction Petition before Delhi High Court (Adani v. BHPC)', 'CASE', 6),
    (2, 'Dispatched Section 8 IBC Demand Notice on behalf of Tata Consumer Products', 'CASE', 7)
  `);
  console.log('Audit logs seeded.');

  await db.end();
  console.log('✅ Real data seeding completed successfully!');
}

setupDatabase().catch(err => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
