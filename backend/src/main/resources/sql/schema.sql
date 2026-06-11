-- Healthcare Connector Platform Database Schema
CREATE DATABASE IF NOT EXISTS healthcare_db;
USE healthcare_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    role ENUM("Provider", "Payer") NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_date DATETIME,
    updated_date DATETIME
);

-- Authorization Requests Table
CREATE TABLE IF NOT EXISTS authorization_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(255),
    patient_name VARCHAR(255),
    insurance_id VARCHAR(255),
    insurance_provider VARCHAR(255),
    diagnosis VARCHAR(255),
    procedure_name VARCHAR(255),
    clinical_notes TEXT,
    estimated_cost DOUBLE,
    status ENUM("DRAFT", "SUBMITTED", "UNDER_REVIEW", "MORE_INFO_REQUIRED", "APPROVED", "REJECTED"),
    provider_id BIGINT,
    payer_id BIGINT,
    created_date DATETIME,
    updated_date DATETIME,
    FOREIGN KEY (provider_id) REFERENCES users(id),
    FOREIGN KEY (payer_id) REFERENCES users(id)
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT,
    name VARCHAR(255),
    type VARCHAR(255),
    size BIGINT,
    url VARCHAR(255),
    upload_date DATETIME,
    FOREIGN KEY (request_id) REFERENCES authorization_requests(request_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT,
    sender_id BIGINT,
    sender_role ENUM("Provider", "Payer"),
    receiver_id BIGINT,
    receiver_role ENUM("Provider", "Payer"),
    message TEXT,
    attachment_url VARCHAR(255),
    created_date DATETIME,
    FOREIGN KEY (request_id) REFERENCES authorization_requests(request_id)
);

-- Chat Attachments Table
CREATE TABLE IF NOT EXISTS chat_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT,
    name VARCHAR(255),
    type VARCHAR(255),
    size BIGINT,
    url VARCHAR(255),
    FOREIGN KEY (message_id) REFERENCES messages(message_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(255),
    description TEXT,
    read_flag BOOLEAN DEFAULT FALSE,
    created_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(255),
    module_name VARCHAR(255),
    timestamp DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Status History Table
CREATE TABLE IF NOT EXISTS status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by BIGINT,
    changed_date DATETIME,
    FOREIGN KEY (request_id) REFERENCES authorization_requests(request_id)
);

-- Seed Data
-- Passwords are 'password' BCrypt encoded
INSERT INTO users (username, password, full_name, email, role, active, created_date) VALUES 
('admin', '$2a$10$XFMfHlWuzZ1.n5W.M.Gqau.Fp2R8.hB6Jz1J7rV7lG6p8vG6f1.1G', 'Admin Provider', 'admin@hospital.com', 'Provider', 1, NOW()),
('payer', '$2a$10$XFMfHlWuzZ1.n5W.M.Gqau.Fp2R8.hB6Jz1J7rV7lG6p8vG6f1.1G', 'Insurance Payer', 'payer@insurance.com', 'Payer', 1, NOW());
