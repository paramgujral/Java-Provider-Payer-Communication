-- =====================================================================
-- Seed data: a few authorization requests in different lifecycle states
-- so the Payer queue and Tracking dashboard are populated on first run.
-- =====================================================================

-- 1) APPROVED request (MRI lumbar, well documented)
INSERT INTO authorization_request
(reference,status,priority,patient_mrn,patient_name,patient_birth_date,patient_gender,
 member_id,payer_name,plan_name,provider_npi,provider_name,provider_org,provider_specialty,
 place_of_service,service_start,service_end,clinical_notes,readiness_score,predicted_outcome,
 decision,decision_rationale,authorization_number,auth_valid_from,auth_valid_to,created_at,updated_at)
VALUES
('PA-2026-0001','APPROVED','NORMAL','MRN-44821','Eleanor Whitfield','1968-03-12','female',
 'BCBS-7781204','Meridian Health Plan','Meridian PPO Gold','1487659302','Dr. Anil Rao','Lakeshore Orthopedics','Orthopedic Surgery',
 'Outpatient Hospital','2026-06-20','2026-06-20',
 'Chronic low back pain 5 months. Completed 8 weeks of physical therapy and NSAIDs without relief. Positive straight-leg raise. MRI requested to evaluate for disc herniation prior to surgical consult.',
 92,'LIKELY_APPROVE','APPROVED','Medical necessity criteria met: documented conservative therapy and neurological findings.',
 'AUTH-9920451','2026-06-15','2026-09-15','2026-06-02 09:12:00','2026-06-03 14:40:00');

-- 2) PENDING_REVIEW request (sleep study) waiting in the payer queue
INSERT INTO authorization_request
(reference,status,priority,patient_mrn,patient_name,patient_birth_date,patient_gender,
 member_id,payer_name,plan_name,provider_npi,provider_name,provider_org,provider_specialty,
 place_of_service,service_start,service_end,clinical_notes,readiness_score,predicted_outcome,
 created_at,updated_at)
VALUES
('PA-2026-0002','PENDING_REVIEW','NORMAL','MRN-50133','Marcus Delgado','1979-11-02','male',
 'AET-3320918','Aetna National','Aetna Choice POS II','1992330145','Dr. Priya Nair','Summit Pulmonary','Pulmonology',
 'Sleep Center','2026-06-25','2026-06-25',
 'Excessive daytime somnolence, witnessed apneas, Epworth score 16, BMI 34. Attended polysomnography requested.',
 84,'UNCERTAIN','2026-06-05 11:05:00','2026-06-05 11:30:00');

-- 3) INFO_REQUESTED request (advanced imaging, thin documentation)
INSERT INTO authorization_request
(reference,status,priority,patient_mrn,patient_name,patient_birth_date,patient_gender,
 member_id,payer_name,plan_name,provider_npi,provider_name,provider_org,provider_specialty,
 place_of_service,service_start,service_end,clinical_notes,readiness_score,predicted_outcome,
 decision,decision_rationale,created_at,updated_at)
VALUES
('PA-2026-0003','INFO_REQUESTED','URGENT','MRN-61290','Sofia Ahmed','1990-07-21','female',
 'UHC-5567102','UnitedHealthcare','UHC Navigate HMO','1773450988','Dr. James Holloway','Riverside Neurology','Neurology',
 'Outpatient Hospital','2026-06-18','2026-06-18',
 'Headaches.',
 48,'LIKELY_DENY','INFO_REQUESTED','Insufficient clinical documentation to establish medical necessity for advanced imaging.',
 '2026-06-06 08:20:00','2026-06-06 16:02:00');

-- Diagnoses
INSERT INTO diagnosis_code (request_id,sequence_no,icd10_code,description,is_principal) VALUES
(1,1,'M54.16','Radiculopathy, lumbar region',TRUE),
(1,2,'M51.26','Other intervertebral disc displacement, lumbar region',FALSE),
(2,1,'G47.33','Obstructive sleep apnea (adult) (pediatric)',TRUE),
(3,1,'R51.9','Headache, unspecified',TRUE);

-- Service lines
INSERT INTO service_line (request_id,sequence_no,cpt_code,description,units,unit_type) VALUES
(1,1,'72148','MRI lumbar spine without contrast',1,'study'),
(2,1,'95810','Polysomnography; sleep staging, 4+ parameters, attended',1,'study'),
(3,1,'70551','MRI brain without contrast',1,'study');

-- Copilot reviews (cached)
INSERT INTO copilot_review (request_id,source,readiness_score,decision,predicted_outcome,medical_necessity,summary,created_at) VALUES
(1,'RULES',92,'READY','LIKELY_APPROVE','Conservative therapy and neuro findings documented; criteria met.','Request is complete and well supported. Safe to submit.','2026-06-02 09:12:00'),
(3,'RULES',48,'NEEDS_FIXES','LIKELY_DENY','Medical necessity not established; documentation is a single word.','Critical gaps detected. High denial risk without additional documentation.','2026-06-06 08:20:00');

INSERT INTO copilot_issue (review_id,severity,field,problem,recommendation,auto_fixable) VALUES
(2,'ERROR','clinicalNotes','Clinical narrative is insufficient ("Headaches.").','Document onset, duration, red-flag symptoms, prior workup and failed conservative treatment.',FALSE),
(2,'WARNING','diagnosis','Non-specific diagnosis R51.9 for advanced imaging.','Add a more specific diagnosis or supporting neurological findings.',FALSE),
(2,'INFO','attachments','No supporting documentation attached.','Attach prior imaging reports or specialist consult notes.',FALSE);

-- Status history
INSERT INTO status_event (request_id,status,actor,note,created_at) VALUES
(1,'DRAFT','PROVIDER','Request created','2026-06-02 09:00:00'),
(1,'SUBMITTED','PROVIDER','Submitted to Meridian Health Plan','2026-06-02 09:15:00'),
(1,'PENDING_REVIEW','PAYER','Received and queued','2026-06-02 10:00:00'),
(1,'APPROVED','PAYER','Approved - AUTH-9920451','2026-06-03 14:40:00'),
(2,'SUBMITTED','PROVIDER','Submitted to Aetna National','2026-06-05 11:10:00'),
(2,'PENDING_REVIEW','PAYER','Received and queued','2026-06-05 11:30:00'),
(3,'SUBMITTED','PROVIDER','Submitted to UnitedHealthcare','2026-06-06 08:25:00'),
(3,'INFO_REQUESTED','PAYER','Additional documentation requested','2026-06-06 16:02:00');

-- Notifications
INSERT INTO notification (request_id,recipient,title,message,level,read_flag,created_at) VALUES
(1,'PROVIDER','Authorization approved','PA-2026-0001 approved. Auth #AUTH-9920451 valid through 2026-09-15.','SUCCESS',FALSE,'2026-06-03 14:40:00'),
(2,'PAYER','New authorization request','PA-2026-0002 from Summit Pulmonary is awaiting review.','INFO',FALSE,'2026-06-05 11:30:00'),
(3,'PROVIDER','Additional information required','PA-2026-0003 needs more documentation to proceed.','WARNING',FALSE,'2026-06-06 16:02:00');
