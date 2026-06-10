-- =====================================================================
-- Smart Healthcare Connector - relational schema (H2 / MySQL compatible)
-- For PostgreSQL: replace "BIGINT AUTO_INCREMENT" with "BIGINT GENERATED
-- BY DEFAULT AS IDENTITY", and "TEXT" stays the same.
-- =====================================================================

DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS status_event;
DROP TABLE IF EXISTS copilot_issue;
DROP TABLE IF EXISTS copilot_review;
DROP TABLE IF EXISTS service_line;
DROP TABLE IF EXISTS diagnosis_code;
DROP TABLE IF EXISTS authorization_request;

CREATE TABLE authorization_request (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference            VARCHAR(40)  NOT NULL UNIQUE,
    status               VARCHAR(30)  NOT NULL,
    priority             VARCHAR(20)  NOT NULL DEFAULT 'NORMAL',

    -- Patient (FHIR Patient)
    patient_mrn          VARCHAR(40),
    patient_name         VARCHAR(120) NOT NULL,
    patient_birth_date   VARCHAR(10),
    patient_gender       VARCHAR(10),

    -- Coverage (FHIR Coverage)
    member_id            VARCHAR(40),
    payer_name           VARCHAR(120) NOT NULL,
    plan_name            VARCHAR(120),

    -- Ordering provider (FHIR Practitioner / Organization)
    provider_npi         VARCHAR(20),
    provider_name        VARCHAR(120) NOT NULL,
    provider_org         VARCHAR(120),
    provider_specialty   VARCHAR(80),

    -- Service context
    place_of_service     VARCHAR(60),
    service_start        VARCHAR(10),
    service_end          VARCHAR(10),
    clinical_notes       TEXT,

    -- Cached Copilot summary
    readiness_score      INT,
    predicted_outcome    VARCHAR(30),

    -- Payer decision (FHIR ClaimResponse)
    decision             VARCHAR(20),
    decision_rationale   TEXT,
    authorization_number VARCHAR(40),
    auth_valid_from      VARCHAR(10),
    auth_valid_to        VARCHAR(10),

    created_at           TIMESTAMP    NOT NULL,
    updated_at           TIMESTAMP    NOT NULL
);

CREATE TABLE diagnosis_code (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id    BIGINT NOT NULL,
    sequence_no   INT    NOT NULL,
    icd10_code    VARCHAR(15) NOT NULL,
    description   VARCHAR(255),
    is_principal  BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_diag_request FOREIGN KEY (request_id)
        REFERENCES authorization_request(id) ON DELETE CASCADE
);

CREATE TABLE service_line (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id    BIGINT NOT NULL,
    sequence_no   INT    NOT NULL,
    cpt_code      VARCHAR(15) NOT NULL,
    description   VARCHAR(255),
    units         INT    NOT NULL DEFAULT 1,
    unit_type     VARCHAR(40),
    CONSTRAINT fk_line_request FOREIGN KEY (request_id)
        REFERENCES authorization_request(id) ON DELETE CASCADE
);

CREATE TABLE copilot_review (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id         BIGINT NOT NULL,
    source             VARCHAR(20) NOT NULL,           -- LLM | RULES
    readiness_score    INT    NOT NULL,
    decision           VARCHAR(20) NOT NULL,           -- READY | NEEDS_FIXES
    predicted_outcome  VARCHAR(30),                    -- LIKELY_APPROVE | UNCERTAIN | LIKELY_DENY
    medical_necessity  TEXT,
    summary            TEXT,
    created_at         TIMESTAMP NOT NULL,
    CONSTRAINT fk_review_request FOREIGN KEY (request_id)
        REFERENCES authorization_request(id) ON DELETE CASCADE
);

CREATE TABLE copilot_issue (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id     BIGINT NOT NULL,
    severity      VARCHAR(10) NOT NULL,                -- ERROR | WARNING | INFO
    field         VARCHAR(60),
    problem       TEXT,
    recommendation TEXT,
    auto_fixable  BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_issue_review FOREIGN KEY (review_id)
        REFERENCES copilot_review(id) ON DELETE CASCADE
);

CREATE TABLE status_event (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id  BIGINT NOT NULL,
    status      VARCHAR(30) NOT NULL,
    actor       VARCHAR(40),                           -- PROVIDER | PAYER | COPILOT | SYSTEM
    note        TEXT,
    created_at  TIMESTAMP NOT NULL,
    CONSTRAINT fk_event_request FOREIGN KEY (request_id)
        REFERENCES authorization_request(id) ON DELETE CASCADE
);

CREATE TABLE notification (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id  BIGINT,
    recipient   VARCHAR(20) NOT NULL,                  -- PROVIDER | PAYER
    title       VARCHAR(160) NOT NULL,
    message     TEXT,
    level       VARCHAR(20) DEFAULT 'INFO',            -- INFO | SUCCESS | WARNING | DANGER
    read_flag   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL
);

CREATE INDEX idx_request_status ON authorization_request(status);
CREATE INDEX idx_notification_recipient ON notification(recipient, read_flag);
