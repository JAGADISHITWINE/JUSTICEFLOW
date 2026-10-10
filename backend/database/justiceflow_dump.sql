-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: justiceflow_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'JusticeFlow Indian Legal Practice OS initialized with High Courts & Commercial Courts jurisdiction','SYSTEM',1,'2026-10-10 03:58:55'),(2,1,'Filed Comm. O.S. No. 481/2026 before Hon\'ble Commercial Court, Bengaluru','CASE',1,'2026-10-10 03:58:55'),(3,1,'Executed BCI-compliant Vakalatnama & Retainer Agreement v1.0 with Apex Global Logistics','RETAINER',1,'2026-10-10 03:58:55'),(4,1,'Received ₹2,00,000/- into Dedicated Client Escrow Account (ESCROW-KAR-2026-001)','TRUST_ACCOUNT',1,'2026-10-10 03:58:55'),(5,2,'Filed SAT Appeal No. 204/2026 before Securities Appellate Tribunal, Mumbai','CASE',3,'2026-10-10 03:58:55'),(6,2,'Issued Section 29 Trademark Infringement Notice on behalf of CloudByte Infotech','CASE',4,'2026-10-10 03:58:55'),(7,1,'Lodged Section 9 Emergency Injunction Petition before Delhi High Court (Adani v. BHPC)','CASE',6,'2026-10-10 03:58:55'),(8,2,'Dispatched Section 8 IBC Demand Notice on behalf of Tata Consumer Products','CASE',7,'2026-10-10 03:58:55'),(9,1,'User logged in (Single active session initialized): Advocate Alexander Vance (Managing Partner, KAR/1420/2012)','AUTH',1,'2026-10-10 04:00:28');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_events`
--

DROP TABLE IF EXISTS `calendar_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `case_id` int DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` enum('Trial','Hearing','Deposition','Filing Deadline','Client Meeting','Discovery Cutoff') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Hearing',
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `court_room` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `judge_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reminder_minutes` int DEFAULT '1440',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_statute_of_limitations` tinyint(1) DEFAULT '0',
  `alert_7d_sent` tinyint(1) DEFAULT '0',
  `alert_48h_sent` tinyint(1) DEFAULT '0',
  `alert_2h_sent` tinyint(1) DEFAULT '0',
  `rule_trigger_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority` enum('Normal','High','Critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Normal',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `case_id` (`case_id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `calendar_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calendar_events_ibfk_2` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calendar_events_ibfk_3` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_events`
--

LOCK TABLES `calendar_events` WRITE;
/*!40000 ALTER TABLE `calendar_events` DISABLE KEYS */;
INSERT INTO `calendar_events` VALUES (1,1,1,1,'Order XXXIX Hearing on Interim Injunction (I.A. 1/2026)','Hearing','2026-04-12 11:00:00','2026-04-12 12:30:00','City Civil Court Complex, KG Road, Bengaluru','Court Hall No. 4','Hon\'ble Sri Justice R. Devdas',1440,'Arguments on ex-parte ad-interim injunction restraining disposal of cold-storage equipment.',0,0,0,0,NULL,'Critical','2026-10-10 03:58:55'),(2,1,1,1,'Cross-Examination of PW-1 (Chief Logistics Officer)','Deposition','2026-04-16 14:00:00','2026-04-16 16:30:00','Advocate Commissioner Chambers / Commercial Court','Court Hall No. 4','Hon\'ble Sri Justice R. Devdas',1440,'Evidence recording under Order XVIII Rule 4 CPC through Court Commissioner.',0,0,0,0,NULL,'High','2026-10-10 03:58:55'),(3,1,2,2,'Probate Hearing: Examination of Attesting Witness (Section 281 Succession Act)','Hearing','2026-04-19 11:30:00','2026-04-19 13:00:00','High Court of Bombay, Fort, Mumbai','Court Room 12','Hon\'ble Smt. Justice Bharati Dangre',1440,'Evidence of Dr. Joshi attesting execution of Last Will & Testament.',0,0,0,0,NULL,'High','2026-10-10 03:58:55'),(4,2,3,3,'Hearing before Securities Appellate Tribunal (SAT Appeal No. 204/2026)','Hearing','2026-04-22 10:30:00','2026-04-22 12:00:00','Earnest House, Nariman Point, Mumbai','Court Room 1','Hon\'ble Presiding Officer Justice P.S. Dinesh Kumar',1440,'Final oral arguments on interpretation of SEBI AIF Regulations and safe harbour provisions.',0,0,0,0,NULL,'Critical','2026-10-10 03:58:55'),(5,2,4,4,'Commercial Division Injunction Hearing under Order 39 Rules 1 & 2 CPC','Hearing','2026-04-25 10:30:00','2026-04-25 12:00:00','High Court of Karnataka, Opp. Vidhana Soudha, Bengaluru','Court Hall 2','Hon\'ble Sri Justice M. Nagaprasanna',1440,'Arguments on prima facie case and balance of convenience for restraining software trademark dilution.',0,0,0,0,NULL,'Critical','2026-10-10 03:58:55'),(6,1,6,6,'Section 9 Injunction Arguments before Delhi High Court Commercial Division','Hearing','2026-04-28 10:30:00','2026-04-28 12:00:00','High Court of Delhi, Shershah Road, New Delhi','Court Room 31','Hon\'ble Sri Justice Sanjeev Narula',1440,'Urgent interim protection against wrongful encashment of Bank Guarantee.',0,0,0,0,NULL,'Critical','2026-10-10 03:58:55'),(7,2,7,7,'NCLT Admission Hearing: CP (IB) No. 182/BB/2026 (Operational Debt)','Hearing','2026-05-04 11:00:00','2026-05-04 12:30:00','NCLT Corporate Bhavan, Raheja Towers, MG Road, Bengaluru','Court Hall 1','Hon\'ble Member (Judicial) K. Biswal',1440,'Arguments on section 9 IBC debt admission and pre-existing dispute objection.',0,0,0,0,NULL,'High','2026-10-10 03:58:55'),(8,1,1,1,'Statutory Written Statement 30-Day Deadline (Order VIII Rule 1 CPC)','Filing Deadline','2026-05-15 17:00:00','2026-05-15 17:00:00','Commercial Court Registry, Bengaluru','Filing Counter 2','Court Registry',2880,'Statutory 30-day deadline for defendant to file Written Statement under Commercial Courts Act 2015. Absolute 120-day forfeiture applies.',1,0,0,0,NULL,'Critical','2026-10-10 03:58:55'),(9,3,8,3,'Limitation Deadline: Section 138 NI Act 30-Day Court Filing Expiry','Filing Deadline','2026-05-20 16:30:00','2026-05-20 16:30:00','Metropolitan Magistrate Registry, Patiala House Courts, New Delhi','Registry Counter 4','Chief Metropolitan Magistrate',2880,'Statutory deadline under Section 142(1)(b) NI Act to file formal complaint within 30 days of notice expiry.',1,0,0,0,NULL,'Critical','2026-10-10 03:58:55');
/*!40000 ALTER TABLE `calendar_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cases`
--

DROP TABLE IF EXISTS `cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `client_id` int NOT NULL,
  `case_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `case_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cnr_number` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `case_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `court_forum` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Commercial Court',
  `team_id` int DEFAULT '1',
  `fir_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `police_station` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Open','Closed','Pending','On Hold') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Open',
  `court_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `judge_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `filing_date` date DEFAULT NULL,
  `expected_close_date` date DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT '0.00',
  `spent` decimal(12,2) DEFAULT '0.00',
  `adverse_party` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opposing_counsel` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `corporate_affiliates` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `witnesses` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `cases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cases_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cases`
--

LOCK TABLES `cases` WRITE;
/*!40000 ALTER TABLE `cases` DISABLE KEYS */;
INSERT INTO `cases` VALUES (1,1,1,'Apex Global Logistics v. QuickFreight Multi-Modal Logistics Pvt Ltd','Comm. O.S. No. 481/2026','KABC010048122026','Commercial Suit (Commercial Courts Act 2015)','Commercial Court',2,NULL,NULL,'Commercial suit for recovery of ₹1,25,00,000/- with 18% p.a. interest towards cargo spoilage under Carriage by Road Act 2007; interim injunction application under Order XXXIX Rules 1 & 2 CPC.','Open','City Civil & Commercial Court, Bengaluru','Hon\'ble Sri Justice R. Devdas','2026-01-15','2026-11-30',750000.00,246000.00,'QuickFreight Multi-Modal Logistics Pvt Ltd','Advocate V.K. Murthy & Associates','QuickFreight Holdings India Ltd, Apex Cargo Intermodal','David Miller (Logistics Head), Rajesh Sharma (Port Operations)','2026-10-10 03:58:55','2026-10-10 04:10:12'),(2,1,2,'Singhania Family Custody & Matrimonial Petition (Sec 125 CrPC & Guardianship)','Matrimonial Pet. No. 112/2026','MHFC020011242026','Matrimonial & Child Custody','Family Court',3,NULL,NULL,'Petition under Section 7 of Family Courts Act, 1984 read with Guardians and Wards Act for interim child custody and monthly maintenance adjudication.','Open','Principal Judge Family Court, Bandra, Mumbai','Hon\'ble Smt. Justice Bharati Dangre','2026-02-01','2026-09-15',450000.00,145000.00,'Respondent: Dr. Ananya Singhania','Advocate Soli Dastoor & Partners','Singhania Family Holdings Trust','Dr. Arvind Joshi (Child Psychologist)','2026-10-10 03:58:55','2026-10-10 04:10:12'),(3,2,3,'Sterling Capital Advisory v. Securities and Exchange Board of India (SEBI)','SAT Appeal No. 204/2026','MHSAT01002042026','Securities Appellate Tribunal (SAT)','NCLT Tribunal',4,NULL,NULL,'Appellate proceedings under Section 15T of SEBI Act, 1992 challenging regulatory adjudication order concerning AIF Category II Private Placement Memorandum (PPM) disclosures.','Pending','Securities Appellate Tribunal (SAT), Mumbai','Hon\'ble Presiding Officer Justice P.S. Dinesh Kumar','2026-02-18','2026-07-30',650000.00,285000.00,'Securities and Exchange Board of India (SEBI)','Senior Advocate Arvind Kamath with K. Ashwath','Sterling Capital Mauritius, Cross Alpha Syndicate','Prakash Chandra (Compliance Officer), Meera Sen (Fund Auditor)','2026-10-10 03:58:55','2026-10-10 04:10:12'),(4,2,4,'CloudByte Infotech v. SkyByte Cloud Networks (Trademark Infringement Suit)','Comm. Suit (IP) No. 94/2026','KAHC010094122026','Intellectual Property Litigation','High Court',5,NULL,NULL,'Suit under Sections 29 & 135 of Trade Marks Act, 1999 seeking permanent injunction restraining infringement of registered trademark \'CloudByte\' and rendition of accounts.','Open','High Court of Karnataka (Commercial Division), Bengaluru','Hon\'ble Sri Justice M. Nagaprasanna','2026-03-05','2026-12-31',400000.00,112000.00,'SkyByte Cloud Networks Pvt Ltd','Advocate D.L.N. Rao & Associates','Rivera Enterprise Cloud Solutions','Siddharth Rao (Chief Software Architect)','2026-10-10 03:58:55','2026-10-10 04:10:12'),(5,1,5,'Horizon Life Sciences Labs v. Controller General of Patents','W.P.(C) No. 8920/2025','DLHC010089202025','Writ Petition (Constitutional / Patent)','High Court',1,NULL,NULL,'Writ Petition under Article 226 challenging Patent Office refusal order under Section 3(d) of Patents Act, 1970 concerning synthetic peptide therapeutic efficacy.','Open','High Court of Delhi (Intellectual Property Division)','Hon\'ble Smt. Justice Prathiba M. Singh','2025-06-10','2026-08-31',1200000.00,480000.00,'Union of India & Controller General of Patents, Designs and Trade Marks','Additional Solicitor General of India (ASG)','Horizon Pharmaceuticals Switzerland AG','Dr. Ramesh Narayan (Chief Scientific Officer)','2026-10-10 03:58:55','2026-10-10 03:58:55'),(6,1,6,'Adani Energy Infrastructure v. Bharat Heavy Power Corporation Ltd','Arb. Pet. No. 340/2026','DLHC010034012026','Commercial Arbitration & Section 9 Petitions','High Court',2,NULL,NULL,'Section 9 petition under Arbitration & Conciliation Act, 1996 for interim protection restraining encashment of Bank Guarantee worth ₹18.5 Crores under Turnkey EPC contract.','Pending','High Court of Delhi (Commercial Division)','Hon\'ble Sri Justice Sanjeev Narula','2026-03-12','2026-10-15',850000.00,310000.00,'Bharat Heavy Power Corporation Ltd','Senior Advocate Mukul Rohatgi & Associates','Adani Green Energy Ltd, Adani Transmission Infra','Vikramaditya Bose (VP Projects), S. Ramanathan (Lead Engineer)','2026-10-10 03:58:55','2026-10-10 04:10:12'),(7,2,7,'Tata Consumer Products v. FastRetail Hypermarkets Ltd (Insolvency Resolution)','CP (IB) No. 182/BB/2026','KANCLT01001822026','National Company Law Tribunal (IBC 2016)','NCLT Tribunal',3,NULL,NULL,'Section 9 petition under Insolvency and Bankruptcy Code, 2016 initiated by Operational Creditor for default of ₹3,40,00,000/- for delivered goods.','Open','National Company Law Tribunal (NCLT), Bengaluru Bench','Hon\'ble Member (Judicial) K. Biswal','2026-03-20','2026-11-15',600000.00,190000.00,'FastRetail Hypermarkets Ltd','Advocate Shardul Amarchand Mangaldas & Co','Tata Consumer Holdings, FastRetail India','Anil Deshmukh (Head Finance), R.K. Menon (Audit Officer)','2026-10-10 03:58:55','2026-10-10 04:10:12'),(8,3,3,'State (Govt of NCT Delhi) & Sterling Capital v. Orbit Promoters (Sec 420 IPC & Bail)','Sessions Case No. 5812/2026','DLCT020058122026','Criminal Breach of Trust & Fraud (IPC/BNS)','Criminal Court',4,'FIR No. 214/2026','Barakhamba Road Police Station, New Delhi','Criminal trial under Sections 406, 420 & 120B IPC; regular bail opposition and prosecution evidence stage.','Pending','District & Sessions Court, Patiala House, New Delhi','Hon\'ble Additional Sessions Judge Court No. 5','2026-03-25','2026-12-20',300000.00,95000.00,'Orbit Realtors & Promoters (Accused)','Advocate Karanjawala & Co','Sterling Special Opportunities Fund','Hemant Goel (Authorized Representative)','2026-10-10 03:58:55','2026-10-10 04:10:12');
/*!40000 ALTER TABLE `cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `is_email_verified` tinyint(1) DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `portal_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,1,'Apex Global Logistics India Pvt Ltd','legal@apexlogistic.com','+91 (080) 4123-5678','Level 8, Prestige Meridian, 29 M.G. Road','Bengaluru','Karnataka','560001','Active',1,NULL,NULL,'2026-10-10 03:58:55','2026-10-10 03:58:55'),(2,1,'Dr. Vikramaditya Singhania (HUF Family Trust)','singhania.family@vancetrust.org','+91 (022) 2284-5432','14 Nariman Point, Marine Drive','Mumbai','Maharashtra','400021','Active',1,NULL,NULL,'2026-10-10 03:58:55','2026-10-10 03:58:55'),(3,2,'Sterling & Cross Capital Advisory LLP','investments@sterlingcross.com','+91 (011) 2331-6789','Barakhamba Road, Connaught Place','New Delhi','Delhi','110001','Active',1,NULL,NULL,'2026-10-10 03:58:55','2026-10-10 03:58:55'),(4,2,'CloudByte Infotech Pvt Ltd','contact@cloudbyteinfo.io','+91 99000 23456','776 100ft Road, HAL 2nd Stage, Indiranagar','Bengaluru','Karnataka','560038','Active',1,NULL,NULL,'2026-10-10 03:58:55','2026-10-10 03:58:55'),(5,1,'Horizon Life Sciences Labs Pvt Ltd','ip-desk@horizonbio.com','+91 (040) 2340-1234','Plot 12, Phase-II, Genome Valley, Shameerpet','Hyderabad','Telangana','500078','Active',1,NULL,NULL,'2026-10-10 03:58:55','2026-10-10 03:58:55'),(6,1,'Adani Energy Infrastructure Ltd','legal.power@adaniinfrastructure.in','+91 (079) 2656-5555','Adani Shantigram, SG Highway','Ahmedabad','Gujarat','382421','Active',1,NULL,NULL,'2026-10-10 03:58:55','2026-10-10 03:58:55'),(7,2,'Tata Consumer Products Logistics Division','counsel@tataconsumer.com','+91 (022) 6665-8282','Bombay House, 24 Homi Mody Street','Mumbai','Maharashtra','400001','Active',1,NULL,NULL,'2026-10-10 03:58:55','2026-10-10 03:58:55'),(8,3,'Orbit Realtors & Developers Pvt Ltd','corporate@orbitrealtors.in','+91 (0124) 456-7890','DLF Cyber City, Tower 10','Gurugram','Haryana','122002','Inactive',1,NULL,NULL,'2026-10-10 03:58:55','2026-10-10 03:58:55');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conflict_checks`
--

DROP TABLE IF EXISTS `conflict_checks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conflict_checks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `prospective_client` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `adverse_parties` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `corporate_affiliates` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `opposing_counsel` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `witnesses` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('CLEARED','POTENTIAL_CONFLICT','DIRECT_CONFLICT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'CLEARED',
  `risk_score` int DEFAULT '0',
  `findings_json` json DEFAULT NULL,
  `audit_certificate_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `checked_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `checked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `audit_certificate_id` (`audit_certificate_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `conflict_checks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conflict_checks`
--

LOCK TABLES `conflict_checks` WRITE;
/*!40000 ALTER TABLE `conflict_checks` DISABLE KEYS */;
INSERT INTO `conflict_checks` VALUES (1,1,'QuickFreight Multi-Modal Logistics Pvt Ltd','Commercial Cargo Dispute','Apex Global Logistics India Pvt Ltd','Apex Cargo Intermodal, TransLogistics','Advocate Alexander Vance','David Miller','DIRECT_CONFLICT',95,NULL,'BCI-CERT-2026-001','Advocate Alexander Vance','2026-10-10 03:58:55','DIRECT ADVERSITY DETECTED: Apex Global Logistics is an existing retained firm client in Comm. O.S. 481/2026. Bar Council Rule 33 strictly prohibits representation.'),(2,1,'Adani Energy Infrastructure Ltd','Turnkey EPC Arbitration','Bharat Heavy Power Corporation Ltd','Adani Green Energy Ltd','Senior Advocate Mukul Rohatgi','Vikramaditya Bose','CLEARED',0,NULL,'BCI-CERT-2026-002','Advocate Alexander Vance','2026-10-10 03:58:55','Zero conflict identified across all past and active litigation dockets. Representation ethically cleared.'),(3,2,'Sterling & Cross Capital Advisory LLP','SEBI Regulatory Adjudication','Securities and Exchange Board of India','Sterling Capital Mauritius','Arvind Kamath','Prakash Chandra','CLEARED',0,NULL,'BCI-CERT-2026-003','Advocate Sarah Jenkins','2026-10-10 03:58:55','No direct adversity or opposing client representation found. Firm cleared to lead SAT proceedings.'),(4,2,'SkyByte Cloud Networks Pvt Ltd','IP Trademark Defense','CloudByte Infotech Pvt Ltd','Rivera Enterprise Cloud','Advocate D.L.N. Rao','Siddharth Rao','DIRECT_CONFLICT',90,NULL,'BCI-CERT-2026-004','Advocate Sarah Jenkins','2026-10-10 03:58:55','Conflict detected: Firm currently represents CloudByte Infotech against SkyByte Cloud in Comm. Suit (IP) 94/2026.');
/*!40000 ALTER TABLE `conflict_checks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_id` int NOT NULL,
  `doc_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `doc_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `case_id` (`case_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,1,'Plaint_with_Statement_of_Truth_Apex_Comm_OS_481.pdf','Plaint / Statement of Truth','/uploads/plaint_apex.pdf',2450000,1,'2026-10-10 03:58:55'),(2,1,'Master_MultiModal_Transport_Agreement_2025.pdf','Commercial Contract','/uploads/freight_agreement.pdf',1890000,1,'2026-10-10 03:58:55'),(3,1,'Interim_Injunction_Application_IA_1_2026_CPC.pdf','Interlocutory Application (Order 39)','/uploads/ia_injunction.pdf',840000,1,'2026-10-10 03:58:55'),(4,2,'Singhania_Registered_Will_and_Death_Certificate.pdf','Probate Record','/uploads/vance_will.pdf',3120000,1,'2026-10-10 03:58:55'),(5,2,'Citation_Notice_and_Affidavit_of_Attesting_Witness.pdf','Court Affidavit','/uploads/citation_affidavit.pdf',960000,1,'2026-10-10 03:58:55'),(6,3,'SEBI_Show_Cause_Notice_and_SAT_Appeal_Memo.pdf','Regulatory Appeal Memo','/uploads/sterling_termsheet.pdf',980000,2,'2026-10-10 03:58:55'),(7,4,'Trade_Marks_Registry_Registration_Certificate_TM_542011.pdf','IP Trademark Certificate','/uploads/uspto_cert.pdf',620000,2,'2026-10-10 03:58:55'),(8,5,'High_Court_Writ_Petition_and_Patent_Opposition_Brief.pdf','Constitutional Writ Paperbook','/uploads/horizon_settlement.pdf',4150000,1,'2026-10-10 03:58:55'),(9,6,'Section_9_Arbitration_Petition_and_Bank_Guarantee_Injunction.pdf','Arbitration Petition','/uploads/adani_section9.pdf',2850000,1,'2026-10-10 03:58:55'),(10,7,'IBC_Section_8_Demand_Notice_and_Invoices_Compilation.pdf','Insolvency Statutory Notice','/uploads/ibc_section8.pdf',3400000,2,'2026-10-10 03:58:55'),(11,8,'Section_138_NI_Act_Statutory_Legal_Demand_Notice.pdf','Statutory Demand Notice','/uploads/ni_notice.pdf',720000,3,'2026-10-10 03:58:55');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `time_entry_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hours` decimal(5,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `amount` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `time_entry_id` (`time_entry_id`),
  CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoice_items_ibfk_2` FOREIGN KEY (`time_entry_id`) REFERENCES `time_entries` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
INSERT INTO `invoice_items` VALUES (1,1,1,'Drafted Plaint and Statement of Truth under Order VI Rule 15A CPC; settled list of documents for Commercial Court filing',3.50,4500.00,50000.00,'2026-10-10 03:58:55'),(2,2,6,'Appearance before City Civil Court Commercial Division for orders on I.A. No. 1/2026',1.25,4500.00,35000.00,'2026-10-10 03:58:55'),(3,3,4,'Drafting SAT Appeal Grounds and Compilation of Documents against SEBI Adjudication Officer Order',4.00,3500.00,75000.00,'2026-10-10 03:58:55'),(4,4,5,'Drafting Cease & Desist Notice under Section 29 of Trade Marks Act, 1999',1.75,3500.00,45000.00,'2026-10-10 03:58:55'),(5,5,8,'Section 9 Arbitration Petition drafting to restrain Bank Guarantee encashment',3.75,5000.00,120000.00,'2026-10-10 03:58:55'),(6,6,3,'Hearing before Hon\'ble Justice Bharati Dangre on citations & attesting witness verification',2.50,4000.00,40000.00,'2026-10-10 03:58:55');
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` int NOT NULL,
  `case_id` int NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `tax` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `amount_paid` decimal(12,2) DEFAULT '0.00',
  `status` enum('Draft','Sent','Paid','Overdue') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payment_link` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_payment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `client_id` (`client_id`),
  KEY `case_id` (`case_id`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'INV-2026-001',1,1,'2026-02-15','2026-03-01',50000.00,9000.00,59000.00,59000.00,'Paid','Professional fee for Plaint drafting & filing (18% GST included). Disbursed from Client Escrow.',NULL,NULL,'2026-10-10 03:58:55'),(2,'INV-2026-002',1,1,'2026-03-31','2026-04-15',35000.00,6300.00,41300.00,0.00,'Sent','Professional appearance fee before Hon\'ble Commercial Court for Order 39 hearing (I.A. 1/2026).',NULL,NULL,'2026-10-10 03:58:55'),(3,'INV-2026-003',3,3,'2026-03-10','2026-03-25',75000.00,13500.00,88500.00,88500.00,'Paid','SAT Appeal Memorandum drafting and compilation of statutory records (18% GST).',NULL,NULL,'2026-10-10 03:58:55'),(4,'INV-2026-004',4,4,'2026-04-01','2026-04-16',45000.00,8100.00,53100.00,0.00,'Sent','Trademark Cease & Desist Notice and Commercial Division Injunction Application drafting.',NULL,NULL,'2026-10-10 03:58:55'),(5,'INV-2026-005',6,6,'2026-04-05','2026-04-20',120000.00,21600.00,141600.00,0.00,'Sent','Section 9 Arbitration Petition drafting and Bank Guarantee emergency interim protection.',NULL,NULL,'2026-10-10 03:58:55'),(6,'INV-2026-006',2,2,'2026-02-28','2026-03-15',40000.00,7200.00,47200.00,47200.00,'Paid','Probate Petition filing, citation notices publication, and court registry verification.',NULL,NULL,'2026-10-10 03:58:55');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `retainer_agreements`
--

DROP TABLE IF EXISTS `retainer_agreements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `retainer_agreements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_id` int DEFAULT NULL,
  `client_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'v1.0',
  `previous_version_id` int DEFAULT NULL,
  `fee_type` enum('Hourly','Flat Fee','Contingency','Retainer Draw') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Retainer Draw',
  `retainer_amount` decimal(10,2) DEFAULT '0.00',
  `hourly_rate` decimal(10,2) DEFAULT '0.00',
  `terms_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `redline_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Draft','Sent','Signed','Declined','Superseded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `signature_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `signer_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signer_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signer_ip` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signed_at` timestamp NULL DEFAULT NULL,
  `biometric_timestamp` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `retainer_agreements_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `retainer_agreements`
--

LOCK TABLES `retainer_agreements` WRITE;
/*!40000 ALTER TABLE `retainer_agreements` DISABLE KEYS */;
INSERT INTO `retainer_agreements` VALUES (1,1,1,'Vakalatnama & Legal Services Retainer: Apex Commercial Suit (Comm. O.S. 481/2026)','v1.0',NULL,'Retainer Draw',150000.00,4500.00,'LEGAL SERVICES ENGAGEMENT & VAKALATNAMA RETAINER AGREEMENT\nPursuant to the Advocates Act, 1961 and Bar Council of India Rules (Part VI, Chapter II)\n\n1. SCOPE OF ENGAGEMENT & VAKALATNAMA: Chambers of JusticeFlow Advocates agrees to provide comprehensive legal representation to Apex Global Logistics India Pvt Ltd in Comm. O.S. No. 481/2026 before the Hon\'ble City Civil & Commercial Court, Bengaluru. Representation encompasses drafting and settling plaints, interlocutory applications under Order XXXIX CPC, discovery under Order XI CPC, leading evidence, and final oral arguments.\n\n2. ADVOCATE RETENTION & CLIENT TRUST ESCROW: Client agrees to deposit an advance retainer of ₹1,50,000/- (Rupees One Lakh Fifty Thousand Only) into the Advocate\'s Dedicated Client Trust Escrow Account as ethically required under Bar Council of India Rule 24. Professional fee deductions shall only occur upon formal submission of itemized professional bills.\n\n3. COURT EXPENSES, STAMP DUTY & WELFARE FUND: All statutory court fees under Karnataka Court Fees and Suits Valuation Act, 1958, process fees, translation costs, and Advocate Welfare Fund stamps shall be reimbursed at actuals by the Client.\n\n4. PROFESSIONAL PRIVILEGE & DISCHARGE: All communications are strictly privileged under Section 126 of the Indian Evidence Act, 1872. Client or Counsel may terminate engagement upon formal discharge of Vakalatnama with leave of the Court.','Executed engagement agreement and stamped Vakalatnama filed before Commercial Court Registry','Signed',NULL,'Rajesh Sharma (Director, Apex Logistics)','legal@apexlogistic.com',NULL,'2026-01-16 06:00:00',NULL,1,'2026-10-10 03:58:55','2026-10-10 03:58:55'),(2,3,3,'Regulatory Advisory & SAT Litigation Engagement (Sterling Capital)','v1.0',NULL,'Retainer Draw',200000.00,3500.00,'GENERAL CORPORATE LEGAL ADVISORY & REGULATORY RETAINER AGREEMENT\nChambers of JusticeFlow Advocates & Sterling Cross Capital Advisory LLP\n\n1. SCOPE OF REGULATORY ADVISORY: Ongoing legal counsel concerning SEBI AIF Regulations, SAT litigation, FEMA compliance, and RBI cross-border fund structuring for Alternative Investment Funds (Cat II).\n\n2. MONTHLY ADVISORY DRAW: Fixed monthly retainer draw of ₹1,20,000/- per calendar month, covering up to 30 advisory hours. Specialized SAT hearing appearances billed separately at ₹35,000/- per hearing brief.','Executed regulatory retainer agreement for Securities Appellate Tribunal proceedings','Signed',NULL,'Prakash Chandra (Head Compliance, Sterling Capital)','investments@sterlingcross.com',NULL,'2026-02-20 08:45:00',NULL,2,'2026-10-10 03:58:55','2026-10-10 03:58:55'),(3,4,4,'IP Trademark Enforcement & High Court Litigation Retainer (CloudByte)','v1.0',NULL,'Flat Fee',120000.00,3500.00,'INTELLECTUAL PROPERTY LITIGATION & ENFORCEMENT RETAINER\nClient: CloudByte Infotech Pvt Ltd | Matter: High Court of Karnataka Comm. Suit No. 94/2026\n\n1. SCOPE OF REPRESENTATION: Trademark enforcement, Anton Piller civil search and seizure applications, cease & desist proceedings, and commercial injunction trial representation before the High Court of Karnataka Commercial Division.','Engagement letter sent to client board for digital signature','Sent',NULL,'Siddharth Rao (CEO, CloudByte)','contact@cloudbyteinfo.io',NULL,NULL,NULL,2,'2026-10-10 03:58:55','2026-10-10 03:58:55'),(4,6,6,'EPC Turnkey Arbitration Retainer (Adani Energy v. BHPC)','v1.0',NULL,'Hourly',350000.00,5000.00,'Arbitration agreement and Section 9 representation retainer terms.','Internal draft prepared by Managing Partner','Draft',NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-10-10 03:58:55','2026-10-10 03:58:55');
/*!40000 ALTER TABLE `retainer_agreements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '#2563EB',
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'bi-briefcase',
  `description` text COLLATE utf8mb4_unicode_ci,
  `lead_counsel` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'Commercial & Corporate Litigation','COMM-LIT','#2563EB','bi-building','High Court & Commercial Court dispute resolution, contract enforcement, and insolvency proceedings.','Alexander Vance, Esq.','2026-10-10 04:09:47'),(2,'Criminal Defense & Trial Advocacy','CRIM-DEF','#DC2626','bi-shield-shaded','Sessions Court & Special Courts trial litigation, bail hearings, and white-collar defense.','Vikramaditya Rao, Senior Advocate','2026-10-10 04:09:47'),(3,'Intellectual Property & Technology','IP-TECH','#7C3AED','bi-cpu','Patent, trademark, copyright litigation, and IT Act compliance proceedings.','Sarah Jenkins, Partner','2026-10-10 04:09:47'),(4,'Arbitration & ADR Chamber','ADR-ARB','#D97706','bi-chat-square-quote','Domestic and international commercial arbitration and mediation hearings.','Ananya Sharma, Advocate','2026-10-10 04:09:47'),(5,'Constitutional & Writ Practice','CONST-WRIT','#059669','bi-bank','High Court & Supreme Court writ petitions, PILs, and administrative law.','Rajeshwar Sengupta, Advocate','2026-10-10 04:09:47');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `time_entries`
--

DROP TABLE IF EXISTS `time_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `time_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `case_id` int NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hours` decimal(5,2) NOT NULL,
  `hourly_rate` decimal(10,2) DEFAULT '3500.00',
  `entry_date` date NOT NULL,
  `is_billable` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `case_id` (`case_id`),
  CONSTRAINT `time_entries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `time_entries_ibfk_2` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `time_entries`
--

LOCK TABLES `time_entries` WRITE;
/*!40000 ALTER TABLE `time_entries` DISABLE KEYS */;
INSERT INTO `time_entries` VALUES (1,1,1,'Drafted Plaint and Statement of Truth under Order VI Rule 15A CPC; settled list of documents for Commercial Court filing',3.50,4500.00,'2026-03-28',1,'2026-10-10 03:58:55'),(2,1,1,'Chambers conference with Senior Counsel regarding interim injunction application under Order XXXIX Rules 1 & 2 CPC',2.00,4500.00,'2026-03-29',1,'2026-10-10 03:58:55'),(3,1,2,'Hearing before Hon\'ble Justice Bharati Dangre on citations and verification of attesting witnesses under Section 281 Succession Act',2.50,4000.00,'2026-03-30',1,'2026-10-10 03:58:55'),(4,2,3,'Drafting SAT Appeal Grounds and Compilation of Documents against SEBI Adjudication Officer Order',4.00,3500.00,'2026-04-01',1,'2026-10-10 03:58:55'),(5,2,4,'Drafting Cease & Desist Notice under Section 29 of Trade Marks Act, 1999 and reviewing comparative mark similarities',1.75,3500.00,'2026-04-02',1,'2026-10-10 03:58:55'),(6,1,1,'Appearance before City Civil Court Commercial Division for orders on I.A. No. 1/2026; summons issued to defendant',1.25,4500.00,'2026-04-03',1,'2026-10-10 03:58:55'),(7,2,3,'Due diligence conference with General Counsel of Sterling and independent SEBI compliance auditor',2.25,3500.00,'2026-04-04',1,'2026-10-10 03:58:55'),(8,1,6,'Drafting Section 9 petition under Arbitration Act to restrain wrongful invocation of Bank Guarantee of ₹18.5 Cr',3.75,5000.00,'2026-04-05',1,'2026-10-10 03:58:55'),(9,2,7,'Settling Section 9 IBC petition before NCLT Bengaluru Bench with operational debt ledger reconciliation',2.50,4000.00,'2026-04-06',1,'2026-10-10 03:58:55'),(10,3,8,'Issuance and dispatch of statutory demand notice under Section 138 of NI Act via Registered Post with A.D.',1.50,3000.00,'2026-04-07',1,'2026-10-10 03:58:55'),(11,1,5,'Preparation of comparative efficacy data matrix under Section 3(d) of Patents Act for High Court hearing',2.75,4500.00,'2026-04-08',1,'2026-10-10 03:58:55');
/*!40000 ALTER TABLE `time_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trust_accounts`
--

DROP TABLE IF EXISTS `trust_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trust_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `account_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_number` (`account_number`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `trust_accounts_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trust_accounts`
--

LOCK TABLES `trust_accounts` WRITE;
/*!40000 ALTER TABLE `trust_accounts` DISABLE KEYS */;
INSERT INTO `trust_accounts` VALUES (1,1,'ESCROW-KAR-2026-001',150000.00,'2026-10-10 03:58:55'),(2,2,'ESCROW-MAH-2026-002',80000.00,'2026-10-10 03:58:55'),(3,3,'ESCROW-DEL-2026-003',120000.00,'2026-10-10 03:58:55'),(4,6,'ESCROW-GUJ-2026-004',350000.00,'2026-10-10 03:58:55');
/*!40000 ALTER TABLE `trust_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trust_transactions`
--

DROP TABLE IF EXISTS `trust_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trust_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trust_account_id` int NOT NULL,
  `case_id` int DEFAULT NULL,
  `type` enum('Deposit','Disbursement','Refund') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `trust_account_id` (`trust_account_id`),
  KEY `case_id` (`case_id`),
  CONSTRAINT `trust_transactions_ibfk_1` FOREIGN KEY (`trust_account_id`) REFERENCES `trust_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trust_transactions_ibfk_2` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trust_transactions`
--

LOCK TABLES `trust_transactions` WRITE;
/*!40000 ALTER TABLE `trust_transactions` DISABLE KEYS */;
INSERT INTO `trust_transactions` VALUES (1,1,1,'Deposit',200000.00,'Initial retainer advance deposit under BCI Rule 24 for Commercial Suit Comm. O.S. 481/2026','NEFT-HDFC-984210','2026-01-16','2026-10-10 03:58:55'),(2,1,1,'Disbursement',50000.00,'Earned professional fee disbursement for drafting Plaint & Order 39 interim application','FEE-DISB-0112','2026-02-15','2026-10-10 03:58:55'),(3,3,3,'Deposit',150000.00,'Advance escrow deposit for SAT Appeal No. 204/2026 regulatory hearing expenses','RTGS-ICICI-441029','2026-02-21','2026-10-10 03:58:55'),(4,4,6,'Deposit',350000.00,'Arbitration tribunal security and retainer draw deposit (Section 9 Delhi High Court)','NEFT-SBI-108823','2026-03-15','2026-10-10 03:58:55');
/*!40000 ALTER TABLE `trust_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','lawyer','assistant') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'lawyer',
  `is_active_session` tinyint(1) DEFAULT '0',
  `active_session_token` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `session_started_at` timestamp NULL DEFAULT NULL,
  `last_activity` timestamp NULL DEFAULT NULL,
  `is_email_verified` tinyint(1) DEFAULT '1',
  `reset_otp` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_otp_expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@justiceflow.com','$2a$10$uy8uU/bX.n34SnJFx06SqesRAweZZukuj2QtUQjHMkz5HaSUopHtK','Advocate Alexander Vance (Managing Partner, KAR/1420/2012)','https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150','admin',1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBqdXN0aWNlZmxvdy5jb20iLCJuYW1lIjoiQWR2b2NhdGUgQWxleGFuZGVyIFZhbmNlIChNYW5hZ2luZyBQYXJ0bmVyLCBLQVIvMTQyMC8yMDEyKSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc5MTYwNDgyOCwiZXhwIjoxNzk0MTk2ODI4fQ.i6QR6EZ_REZYRiYzF37OrX7QJ0FdhcUaidEBmgN6jIo','2026-10-10 04:00:28','2026-10-10 04:12:14',1,NULL,NULL,'2026-10-10 03:58:55'),(2,'sarah.jenkins@justiceflow.com','$2a$10$uy8uU/bX.n34SnJFx06SqesRAweZZukuj2QtUQjHMkz5HaSUopHtK','Advocate Sarah Jenkins (Litigation Partner, D/2104/2016)','https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150','lawyer',0,NULL,NULL,NULL,1,NULL,NULL,'2026-10-10 03:58:55'),(3,'marcus.ross@justiceflow.com','$2a$10$uy8uU/bX.n34SnJFx06SqesRAweZZukuj2QtUQjHMkz5HaSUopHtK','Advocate Marcus Ross (Senior Associate, MAH/3910/2018)','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150','lawyer',0,NULL,NULL,NULL,1,NULL,NULL,'2026-10-10 03:58:55');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-10  9:42:32
