-- SMART HEALTHCARE CONNECTOR PLATFORM - MASTER DATABASE SCHEMA (MYSQL)
-- ----------------------------------------------------------------------
-- This file contains all DDL, Constraints, Indexes, and an extensive
-- 30+ User / 35 Patient Clinical Test Suite.
--
-- QUICK REFERENCE - SAMPLE USER CREDENTIALS (All passwords: 'password'):
-- ----------------------------------------------------------------------
-- 1. Providers (ROLE_PROVIDER):
--    - Dr. Sarah Jenkins       : provider@connector.com
--    - Dr. Robert Miller      : robert.miller@connector.com
--    - Dr. Karen Davis         : karen.davis@connector.com
--    - (See users table IDs 1, 4-15 for more)
--
-- 2. Payers / Reviewers (ROLE_PAYER):
--    - Aetna Reviewer          : payer@connector.com
--    - Anthem BC Reviewer      : anthem.reviewer@connector.com
--    - BlueShield Reviewer     : blueshield.reviewer@connector.com
--    - (See users table IDs 2, 16-25 for more)
--
-- 3. Patients (ROLE_PATIENT):
--    - Patient John Doe        : john.doe@patient.com
--    - Patient Robert Chen     : robert.chen@patient.com
--    - Patient Emily Rodriguez : emily.r@patient.com
--    - (See users table IDs 3, 26-33 for more)
-- ----------------------------------------------------------------------

-- SECTION 1: CREATE TABLES
-- ----------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS ai_reviews;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS status_history;
DROP TABLE IF EXISTS authorization_requests;
DROP TABLE IF EXISTS coverages;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ROLE_PROVIDER, ROLE_PAYER, ROLE_PATIENT
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Patients Table
CREATE TABLE patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    fhir_id VARCHAR(100) UNIQUE NOT NULL, -- FHIR Logical ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Coverages Table
CREATE TABLE coverages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    subscriber_id VARCHAR(50) NOT NULL,
    beneficiary_id VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL, -- active, inactive
    payer_name VARCHAR(100) NOT NULL,
    plan_details VARCHAR(255),
    fhir_id VARCHAR(100) UNIQUE NOT NULL, -- FHIR Logical ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. AuthorizationRequests Table
CREATE TABLE authorization_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    provider_id BIGINT NOT NULL,
    payer_id BIGINT,
    coverage_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL, -- DRAFT, SUBMITTED, UNDER_REVIEW, INFO_REQUIRED, APPROVED, REJECTED
    diagnosis_code VARCHAR(30) NOT NULL, -- ICD-10
    diagnosis_description VARCHAR(255),
    treatment_code VARCHAR(30) NOT NULL, -- CPT/HCPCS
    treatment_description VARCHAR(255),
    notes TEXT,
    fhir_resource TEXT NOT NULL, -- Full FHIR Claim/PriorAuth JSON
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. StatusHistory Table
CREATE TABLE status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    updated_by BIGINT NOT NULL, -- User ID who changed it
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Messages Table (Bidirectional Conversation)
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Notifications Table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. AI Reviews Table
CREATE TABLE ai_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    status_validation BOOLEAN NOT NULL, -- True = Valid, False = Missing/Invalid details
    issues TEXT, -- JSON Array representation of warnings / issues
    recommendations TEXT, -- JSON Array representation of recommendations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- SECTION 2: FOREIGN KEY CONSTRAINTS
-- ----------------------------------------------------------------------
ALTER TABLE coverages 
    ADD CONSTRAINT fk_coverage_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

ALTER TABLE authorization_requests 
    ADD CONSTRAINT fk_auth_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    ADD CONSTRAINT fk_auth_provider FOREIGN KEY (provider_id) REFERENCES users(id),
    ADD CONSTRAINT fk_auth_payer FOREIGN KEY (payer_id) REFERENCES users(id),
    ADD CONSTRAINT fk_auth_coverage FOREIGN KEY (coverage_id) REFERENCES coverages(id);

ALTER TABLE status_history 
    ADD CONSTRAINT fk_history_request FOREIGN KEY (request_id) REFERENCES authorization_requests(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_history_user FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE messages 
    ADD CONSTRAINT fk_message_request FOREIGN KEY (request_id) REFERENCES authorization_requests(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id);

ALTER TABLE notifications 
    ADD CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE ai_reviews 
    ADD CONSTRAINT fk_aireview_request FOREIGN KEY (request_id) REFERENCES authorization_requests(id) ON DELETE CASCADE;


-- SECTION 3: INDEXES
-- ----------------------------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_fhir_id ON patients(fhir_id);
CREATE INDEX idx_coverages_patient_id ON coverages(patient_id);
CREATE INDEX idx_auth_requests_provider_id ON authorization_requests(provider_id);
CREATE INDEX idx_auth_requests_payer_id ON authorization_requests(payer_id);
CREATE INDEX idx_auth_requests_patient_id ON authorization_requests(patient_id);
CREATE INDEX idx_auth_requests_status ON authorization_requests(status);
CREATE INDEX idx_status_history_request ON status_history(request_id);
CREATE INDEX idx_messages_request_id ON messages(request_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_ai_reviews_request_id ON ai_reviews(request_id);


-- SECTION 4: MASTER SAMPLE INSERTS
-- ----------------------------------------------------------------------

-- 1. Insert 33 Users (Initial 3 + 30 new presets)
-- All default to password 'password'
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Dr. Sarah Jenkins', 'provider@connector.com', 'password', 'ROLE_PROVIDER'),
(2, 'Aetna Insurance Reviewer', 'payer@connector.com', 'password', 'ROLE_PAYER'),
(3, 'Patient John Doe', 'john.doe@patient.com', 'password', 'ROLE_PATIENT'),
(4, 'Dr. Robert Miller', 'robert.miller@connector.com', 'password', 'ROLE_PROVIDER'),
(5, 'Dr. Karen Davis', 'karen.davis@connector.com', 'password', 'ROLE_PROVIDER'),
(6, 'Dr. James Wilson', 'james.wilson@connector.com', 'password', 'ROLE_PROVIDER'),
(7, 'Dr. Patricia Moore', 'patricia.moore@connector.com', 'password', 'ROLE_PROVIDER'),
(8, 'Dr. Charles Taylor', 'charles.taylor@connector.com', 'password', 'ROLE_PROVIDER'),
(9, 'Dr. Linda Anderson', 'linda.anderson@connector.com', 'password', 'ROLE_PROVIDER'),
(10, 'Dr. Elizabeth Thomas', 'elizabeth.thomas@connector.com', 'password', 'ROLE_PROVIDER'),
(11, 'Dr. Michael White', 'michael.white@connector.com', 'password', 'ROLE_PROVIDER'),
(12, 'Dr. David Martin', 'david.martin@connector.com', 'password', 'ROLE_PROVIDER'),
(13, 'Dr. Susan Garcia', 'susan.garcia@connector.com', 'password', 'ROLE_PROVIDER'),
(14, 'Dr. Joseph Martinez', 'joseph.martinez@connector.com', 'password', 'ROLE_PROVIDER'),
(15, 'Dr. Richard Clark', 'richard.clark@connector.com', 'password', 'ROLE_PROVIDER'),
(16, 'Anthem BC Reviewer', 'anthem.reviewer@connector.com', 'password', 'ROLE_PAYER'),
(17, 'BlueShield Reviewer', 'blueshield.reviewer@connector.com', 'password', 'ROLE_PAYER'),
(18, 'Cigna Reviewer', 'cigna.reviewer@connector.com', 'password', 'ROLE_PAYER'),
(19, 'UnitedHealth Reviewer', 'uhc.reviewer@connector.com', 'password', 'ROLE_PAYER'),
(20, 'Humana Reviewer', 'humana.reviewer@connector.com', 'password', 'ROLE_PAYER'),
(21, 'Kaiser Reviewer', 'kaiser.reviewer@connector.com', 'password', 'ROLE_PAYER'),
(22, 'Medicare Reviewer', 'medicare.reviewer@connector.com', 'password', 'ROLE_PAYER'),
(23, 'Centene Reviewer', 'centene.reviewer@connector.com', 'password', 'ROLE_PAYER'),
(24, 'Molina Reviewer', 'molina.reviewer@connector.com', 'password', 'ROLE_PAYER'),
(25, 'WellCare Reviewer', 'wellcare.reviewer@connector.com', 'password', 'ROLE_PAYER'),
(26, 'Patient Robert Chen', 'robert.chen@patient.com', 'password', 'ROLE_PATIENT'),
(27, 'Patient Emily Rodriguez', 'emily.r@patient.com', 'password', 'ROLE_PATIENT'),
(28, 'Patient William Davis', 'william.davis@patient.com', 'password', 'ROLE_PATIENT'),
(29, 'Patient Michael Johnson', 'michael.j@patient.com', 'password', 'ROLE_PATIENT'),
(30, 'Patient Sarah Williams', 'sarah.w@patient.com', 'password', 'ROLE_PATIENT'),
(31, 'Patient David Brown', 'david.b@patient.com', 'password', 'ROLE_PATIENT'),
(32, 'Patient Jessica Taylor', 'jessica.t@patient.com', 'password', 'ROLE_PATIENT'),
(33, 'Patient James Miller', 'james.m@patient.com', 'password', 'ROLE_PATIENT');

-- 2. Insert 35 Patients
INSERT INTO patients (id, first_name, last_name, gender, birth_date, email, phone, fhir_id) VALUES
(1, 'John', 'Doe', 'male', '1980-05-15', 'john.doe@patient.com', '555-0199', 'pat-101'),
(2, 'Jane', 'Smith', 'female', '1992-11-23', 'jane.smith@patient.com', '555-0210', 'pat-102'),
(3, 'Robert', 'Chen', 'male', '1975-08-12', 'robert.chen@patient.com', '555-0321', 'pat-103'),
(4, 'Emily', 'Rodriguez', 'female', '1988-04-30', 'emily.r@patient.com', '555-0456', 'pat-104'),
(5, 'William', 'Davis', 'male', '1962-12-05', 'william.davis@patient.com', '555-0789', 'pat-105'),
(6, 'Michael', 'Johnson', 'male', '1972-03-14', 'michael.j@patient.com', '555-0101', 'pat-106'),
(7, 'Sarah', 'Williams', 'female', '1985-09-22', 'sarah.w@patient.com', '555-0102', 'pat-107'),
(8, 'David', 'Brown', 'male', '1990-11-05', 'david.b@patient.com', '555-0103', 'pat-108'),
(9, 'Jessica', 'Taylor', 'female', '1968-07-19', 'jessica.t@patient.com', '555-0104', 'pat-109'),
(10, 'James', 'Miller', 'male', '1955-05-30', 'james.m@patient.com', '555-0105', 'pat-110'),
(11, 'Ashley', 'Wilson', 'female', '1993-01-25', 'ashley.w@patient.com', '555-0106', 'pat-111'),
(12, 'Joseph', 'Moore', 'male', '1982-10-14', 'joseph.m@patient.com', '555-0107', 'pat-112'),
(13, 'Amanda', 'Anderson', 'female', '1979-04-02', 'amanda.a@patient.com', '555-0108', 'pat-113'),
(14, 'Charles', 'Thomas', 'male', '1948-12-15', 'charles.t@patient.com', '555-0109', 'pat-114'),
(15, 'Elizabeth', 'Jackson', 'female', '1987-06-08', 'elizabeth.j@patient.com', '555-0110', 'pat-115'),
(16, 'Christopher', 'Harris', 'male', '1981-04-18', 'chris.h@patient.com', '555-0216', 'pat-116'),
(17, 'Margaret', 'Clark', 'female', '1959-10-30', 'margaret.c@patient.com', '555-0217', 'pat-117'),
(18, 'Matthew', 'Rodriguez', 'male', '1992-06-25', 'matt.r@patient.com', '555-0218', 'pat-118'),
(19, 'Patricia', 'Lewis', 'female', '1965-02-14', 'patricia.l@patient.com', '555-0219', 'pat-119'),
(20, 'Daniel', 'Lee', 'male', '1977-12-05', 'daniel.l@patient.com', '555-0220', 'pat-120'),
(21, 'Linda', 'Walker', 'female', '1984-08-20', 'linda.w@patient.com', '555-0221', 'pat-121'),
(22, 'Donald', 'Hall', 'male', '1952-11-22', 'donald.h@patient.com', '555-0222', 'pat-122'),
(23, 'Barbara', 'Allen', 'female', '1991-03-02', 'barbara.a@patient.com', '555-0223', 'pat-123'),
(24, 'Mark', 'Young', 'male', '1970-07-07', 'mark.y@patient.com', '555-0224', 'pat-124'),
(25, 'Susan', 'King', 'female', '1988-05-19', 'susan.k@patient.com', '555-0225', 'pat-125'),
(26, 'Paul', 'Wright', 'male', '1963-09-09', 'paul.w@patient.com', '555-0226', 'pat-126'),
(27, 'Betty', 'Lopez', 'female', '1995-01-13', 'betty.l@patient.com', '555-0227', 'pat-127'),
(28, 'Steven', 'Hill', 'male', '1980-04-14', 'steven.h@patient.com', '555-0228', 'pat-128'),
(29, 'Helen', 'Scott', 'female', '1947-11-25', 'helen.s@patient.com', '555-0229', 'pat-129'),
(30, 'Andrew', 'Green', 'male', '1983-08-08', 'andrew.g@patient.com', '555-0230', 'pat-130'),
(31, 'Sandra', 'Adams', 'female', '1976-03-24', 'sandra.a@patient.com', '555-0231', 'pat-131'),
(32, 'Kenneth', 'Baker', 'male', '1958-09-12', 'kenneth.b@patient.com', '555-0232', 'pat-132'),
(33, 'Donna', 'Gonzalez', 'female', '1989-02-28', 'donna.g@patient.com', '555-0233', 'pat-133'),
(34, 'Joshua', 'Nelson', 'male', '1974-06-06', 'joshua.n@patient.com', '555-0234', 'pat-134'),
(35, 'Carol', 'Carter', 'female', '1966-10-10', 'carol.c@patient.com', '555-0235', 'pat-135');

-- 3. Insert 35 Coverages (mapped 1-to-1 to Patients)
INSERT INTO coverages (id, patient_id, subscriber_id, beneficiary_id, status, payer_name, plan_details, fhir_id) VALUES
(1, 1, 'SUB-99201', 'BEN-99201-01', 'active', 'Aetna PPO', 'Gold Plan Benefit with 10% copay', 'cov-201'),
(2, 2, 'SUB-88102', 'BEN-88102-01', 'active', 'BlueCross BlueShield', 'Standard PPO Plan', 'cov-202'),
(3, 3, 'SUB-77303', 'BEN-77303-01', 'active', 'UnitedHealthcare', 'UHC Choice Plus PPO', 'cov-203'),
(4, 4, 'SUB-66404', 'BEN-66404-01', 'active', 'Cigna PPO', 'Cigna Connect Silver', 'cov-204'),
(5, 5, 'SUB-55505', 'BEN-55505-01', 'active', 'Humana Gold', 'Humana Medicare Advantage', 'cov-205'),
(6, 6, 'SUB-10601', 'BEN-10601-01', 'active', 'Anthem Blue Cross', 'Anthem Silver Pathway', 'cov-206'),
(7, 7, 'SUB-10702', 'BEN-10702-01', 'active', 'Kaiser Permanente', 'Kaiser Gold HMO', 'cov-207'),
(8, 8, 'SUB-10803', 'BEN-10803-01', 'active', 'UnitedHealthcare', 'UHC Choice Plus POS', 'cov-208'),
(9, 9, 'SUB-10904', 'BEN-10904-01', 'active', 'Cigna', 'Cigna LocalPlus HMO', 'cov-209'),
(10, 10, 'SUB-11005', 'BEN-11005-01', 'active', 'Humana', 'Humana Choice PPO', 'cov-210'),
(11, 11, 'SUB-11106', 'BEN-11106-01', 'active', 'Blue Shield of CA', 'Blue Shield Platinum PPO', 'cov-211'),
(12, 12, 'SUB-11207', 'BEN-11207-01', 'active', 'Aetna PPO', 'Aetna Bronze HMO', 'cov-212'),
(13, 13, 'SUB-11308', 'BEN-11308-01', 'active', 'UnitedHealthcare', 'UHC Signature Value', 'cov-213'),
(14, 14, 'SUB-11409', 'BEN-11409-01', 'active', 'Humana Gold', 'Humana Gold Plus HMO', 'cov-214'),
(15, 15, 'SUB-11510', 'BEN-11510-01', 'active', 'Anthem Blue Cross', 'Anthem Bronze Pathway', 'cov-215'),
(16, 16, 'SUB-11601', 'BEN-11601-01', 'active', 'Aetna PPO', 'Aetna Select Gold', 'cov-216'),
(17, 17, 'SUB-11702', 'BEN-11702-01', 'active', 'UnitedHealthcare', 'UHC Signature Bronze', 'cov-217'),
(18, 18, 'SUB-11803', 'BEN-11803-01', 'active', 'Cigna', 'Cigna Premium POS', 'cov-218'),
(19, 19, 'SUB-11904', 'BEN-11904-01', 'active', 'Humana', 'Humana Choice POS', 'cov-219'),
(20, 20, 'SUB-12005', 'BEN-12005-01', 'active', 'Kaiser Permanente', 'Kaiser Silver HMO', 'cov-220'),
(21, 21, 'SUB-12106', 'BEN-12106-01', 'active', 'Anthem Blue Cross', 'Anthem Select Gold', 'cov-221'),
(22, 22, 'SUB-12207', 'BEN-12207-01', 'active', 'Blue Shield of CA', 'Blue Shield Silver HMO', 'cov-222'),
(23, 23, 'SUB-12308', 'BEN-12308-01', 'active', 'Cigna', 'Cigna Open Access Plus', 'cov-223'),
(24, 24, 'SUB-12409', 'BEN-12409-01', 'active', 'Aetna PPO', 'Aetna Silver Savings PPO', 'cov-224'),
(25, 25, 'SUB-12510', 'BEN-12510-01', 'active', 'UnitedHealthcare', 'UHC Student Resources', 'cov-225'),
(26, 26, 'SUB-12611', 'BEN-12611-01', 'active', 'Humana Gold', 'Humana Choice POS Advantage', 'cov-226'),
(27, 27, 'SUB-12712', 'BEN-12712-01', 'active', 'Kaiser Permanente', 'Kaiser Silver Deductible HMO', 'cov-227'),
(28, 28, 'SUB-12813', 'BEN-12813-01', 'active', 'Anthem Blue Cross', 'Anthem Pathway PPO', 'cov-228'),
(29, 29, 'SUB-12914', 'BEN-12914-01', 'active', 'Blue Shield of CA', 'Blue Shield Platinum HMO', 'cov-229'),
(30, 30, 'SUB-13015', 'BEN-13015-01', 'active', 'Aetna PPO', 'Aetna Choice POS II', 'cov-230'),
(31, 31, 'SUB-13116', 'BEN-13116-01', 'active', 'UnitedHealthcare', 'UHC Navigate HMO', 'cov-231'),
(32, 32, 'SUB-13217', 'BEN-13217-01', 'active', 'Cigna', 'Cigna SureFit Silver HMO', 'cov-232'),
(33, 33, 'SUB-13318', 'BEN-13318-01', 'active', 'Humana', 'Humana Connect Gold', 'cov-233'),
(34, 34, 'SUB-13419', 'BEN-13419-01', 'active', 'Anthem Blue Cross', 'Anthem Gold Pathway PPO', 'cov-234'),
(35, 35, 'SUB-13520', 'BEN-13520-01', 'active', 'Blue Shield of CA', 'Blue Shield Bronze PPO', 'cov-235');

-- 4. Insert Authorization Requests
INSERT INTO authorization_requests (id, patient_id, provider_id, payer_id, coverage_id, status, diagnosis_code, diagnosis_description, treatment_code, treatment_description, notes, fhir_resource, confidence_score) VALUES
(1, 1, 1, 2, 1, 'SUBMITTED', 'M17.11', 'Unilateral primary osteoarthritis, right knee', '27447', 'Arthroplasty, knee, condyle and plateau', 'Patient exhibits severe pain and decreased range of motion. Failed conservative treatments.', '{"resourceType":"Claim","id":"auth-301","status":"active","use":"preauthorization","patient":{"reference":"Patient/pat-101"},"created":"2026-06-25T13:00:00Z","provider":{"reference":"Organization/prov-1"},"insurance":[{"sequence":1,"focal":true,"coverage":{"reference":"Coverage/cov-201"}}],"diagnosis":[{"sequence":1,"diagnosisCodeableConcept":{"coding":[{"system":"http://hl7.org/fhir/sid/icd-10","code":"M17.11"}]}}],"item":[{"sequence":1,"productOrService":{"coding":[{"system":"http://www.ama-assn.org/go/cpt","code":"27447"}]}}]}', 92.50),
(2, 2, 1, 2, 2, 'APPROVED', 'I25.10', 'Atherosclerotic heart disease of native coronary artery', '93458', 'Combined right and left heart catheterization', 'Patient complains of chest pain. Positive stress test.', '{"resourceType":"Claim","id":"auth-302","status":"active","use":"preauthorization","patient":{"reference":"Patient/pat-102"},"created":"2026-06-24T10:00:00Z","provider":{"reference":"Organization/prov-1"},"insurance":[{"sequence":1,"focal":true,"coverage":{"reference":"Coverage/cov-202"}}],"diagnosis":[{"sequence":1,"diagnosisCodeableConcept":{"coding":[{"system":"http://hl7.org/fhir/sid/icd-10","code":"I25.10"}]}}],"item":[{"sequence":1,"productOrService":{"coding":[{"system":"http://www.ama-assn.org/go/cpt","code":"93458"}]}}]}', 98.00),
(3, 3, 4, 17, 3, 'UNDER_REVIEW', 'M17.11', 'Unilateral primary osteoarthritis, right knee', '27447', 'Arthroplasty, knee, condyle and plateau', 'Patient has severe right knee pain restricting mobility. Failed NSAIDs and PT.', '{"resourceType":"Claim","id":"claim-robert-3","status":"active","use":"preauthorization","patient":{"reference":"Patient/pat-103"},"insurance":[{"sequence":1,"focal":true,"coverage":{"reference":"Coverage/cov-203"}}],"diagnosis":[{"sequence":1,"diagnosisCodeableConcept":{"coding":[{"system":"http://hl7.org/fhir/sid/icd-10","code":"M17.11"}]}}],"item":[{"sequence":1,"productOrService":{"coding":[{"system":"http://www.ama-assn.org/go/cpt","code":"27447"}]}}]}', 88.00),
(4, 4, 4, 18, 4, 'INFO_REQUIRED', 'I25.10', 'Atherosclerotic heart disease of native coronary artery', '93458', 'Combined right and left heart catheterization', 'Patient presents with angina and abnormal stress test. Seeking angiography validation.', '{"resourceType":"Claim","id":"claim-emily-4","status":"active","use":"preauthorization","patient":{"reference":"Patient/pat-104"},"insurance":[{"sequence":1,"focal":true,"coverage":{"reference":"Coverage/cov-204"}}],"diagnosis":[{"sequence":1,"diagnosisCodeableConcept":{"coding":[{"system":"http://hl7.org/fhir/sid/icd-10","code":"I25.10"}]}}],"item":[{"sequence":1,"productOrService":{"coding":[{"system":"http://www.ama-assn.org/go/cpt","code":"93458"}]}}]}', 91.50);

-- 5. Insert Status History Timelines
INSERT INTO status_history (request_id, status, notes, updated_by) VALUES
(1, 'DRAFT', 'Created draft authorization request', 1),
(1, 'SUBMITTED', 'Submitted request for insurance review', 1),
(2, 'DRAFT', 'Created draft request', 1),
(2, 'SUBMITTED', 'Submitted request', 1),
(2, 'UNDER_REVIEW', 'Assigned to review pipeline', 2),
(2, 'APPROVED', 'Approved based on positive stress test and clinical notes', 2),
(3, 'DRAFT', 'Created draft authorization request', 4),
(3, 'SUBMITTED', 'Submitted request for insurance review', 4),
(3, 'UNDER_REVIEW', 'Assigned to Anthem Reviewer for medical review', 17),
(4, 'DRAFT', 'Created draft request', 4),
(4, 'SUBMITTED', 'Submitted request', 4),
(4, 'UNDER_REVIEW', 'Under clinical review at Cigna', 18),
(4, 'INFO_REQUIRED', 'Information requested: Please attach latest stress test reports.', 18);

-- 6. Insert Messages
INSERT INTO messages (request_id, sender_id, message) VALUES
(1, 1, 'Please review this priority authorization for total knee arthroplasty.'),
(4, 18, 'The clinical notes mention an abnormal stress test, but no values or tracings were attached. Please provide the stress test report.'),
(4, 4, 'Will upload the stress test report and consult notes tomorrow morning. Thanks for the quick feedback.');

-- 7. Insert Notifications
INSERT INTO notifications (user_id, message, is_read) VALUES
(2, 'New Prior Authorization Request (ID: 1) submitted for Patient John Doe.', FALSE),
(1, 'Prior Authorization Request (ID: 2) for Patient Jane Smith has been APPROVED.', FALSE);

-- 8. Insert AI Reviews
INSERT INTO ai_reviews (request_id, confidence_score, status_validation, issues, recommendations) VALUES
(1, 92.50, TRUE, '[]', '["Include recent knee X-Ray imaging reports if available to speed up payer review"]'),
(2, 98.00, TRUE, '[]', '["Confirm stress test documentation is attached"]'),
(3, 88.00, TRUE, '[]', '["Ensure X-Ray imaging reports are uploaded"]'),
(4, 91.50, TRUE, '[]', '["Confirm stress test documentation is attached to prevent delay"]');
