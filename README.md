walkthrough the project (Recording) - https://www.loom.com/share/7bd6404a2ce443dc9b1e40760a873dfe

# HealthConnect — Smart Healthcare Connector Platform

A bidirectional Provider ↔ Payer prior-authorization workflow platform built with
**Java Spring Boot** (backend) and **React** (frontend), aligned to FHIR
(Da Vinci Prior Authorization Support / PAS) concepts.

## What it does

1. **Provider & Payer modules** — organizations register as either a Provider or a
   Payer. Providers create authorization requests (modeled on the FHIR `Claim`
   resource); payers respond with determinations (modeled on `ClaimResponse`).
2. **AI Copilot (rule-based)** — every draft request is automatically scored
   (0–100) against completeness rules: CPT/HCPCS code format, ICD-10 format,
   NPI validation, medical necessity notes, service dates, units requested, etc.
   It returns issues + concrete recommendations before submission.
3. **Status tracking & notifications** — every status change (DRAFT →
   SUBMITTED → IN_REVIEW → PENDED/APPROVED/PARTIAL/REJECTED/CANCELLED) is
   recorded in an audit history, and the counterpart organization receives an
   in-app notification.

---

## Project structure

```
healthconnect/
├── backend/                    # Spring Boot 3 (Java 17)
│   ├── pom.xml
│   └── src/main/java/com/healthconnect/
│       ├── HealthConnectApplication.java
│       ├── model/               # JPA entities (User, AuthorizationRequest, etc.)
│       ├── repository/          # Spring Data JPA repositories
│       ├── service/              # Business logic + AI Copilot rules engine
│       ├── controller/           # REST controllers
│       ├── dto/                  # Request/response DTOs
│       └── config/               # Security, JWT, CORS
│   └── src/main/resources/application.properties
└── frontend/                   # React 18
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.js / index.css
        ├── context/AuthContext.js
        ├── services/api.js
        ├── components/ (Layout, StatusPill)
        └── pages/ (Login, Register, Dashboard, NewRequest, RequestDetail)
```

---

## Step-by-step: running the application

### Prerequisites
- Java 17+ and Maven 3.8+
- Node.js 18+ and npm
- (Optional) PostgreSQL — the app ships configured with an in-memory H2
  database so it runs with **zero external setup**.

### 1. Run the backend

```bash
cd healthconnect/backend
mvn spring-boot:run
```

This starts the API on `http://localhost:8080`.
- H2 in-memory database is created automatically (`spring.jpa.hibernate.ddl-auto=update`).
- H2 console (for debugging) is at `http://localhost:8080/h2-console`
  (JDBC URL: `jdbc:h2:mem:healthconnect`, user `sa`, blank password).

To switch to PostgreSQL for production, edit
`backend/src/main/resources/application.properties` — uncomment the Postgres
block and set `spring.jpa.hibernate.ddl-auto=update` (or `validate` once
schema is stable), then provide your DB credentials.

### 2. Run the frontend

```bash
cd healthconnect/frontend
npm install
npm start
```

This starts the React dev server on `http://localhost:3000`, proxying
`/api/*` requests to the backend on port 8080 (configured via the `proxy`
field in `package.json`).

### 3. Try it out

1. Open `http://localhost:3000/register`.
2. Register **two accounts**:
   - One as **Provider**, e.g. organization "Lakeside Medical Group".
   - One as **Payer**, e.g. organization "Northstar Health Plan".
3. Log in as the **Provider**. Click **New Authorization Request**, fill in
   patient/procedure/diagnosis details, and click **Save Draft & Run AI
   Copilot Review**. Review the completeness score, issues, and
   recommendations.
4. Click **Submit to Payer** (use the exact Payer organization name you
   registered, e.g. "Northstar Health Plan", in the "Payer organization"
   field of the form — this is how the platform routes the request).
5. Log out, log in as the **Payer**. You'll see a notification and the new
   request on the dashboard. Open it, choose a status (e.g. APPROVED,
   PENDED, REJECTED), add response notes, and submit the determination.
6. Log back in as the Provider — you'll see a notification and the updated
   status with full history.

---

## How each requirement is implemented

### 1. Provider and Payer modules (bidirectional exchange)
- `User.role` is `PROVIDER` or `PAYER`, tied to an `organizationName`.
- `AuthorizationRequest` stores both `providerOrgName` and `payerOrgName`,
  so each org only sees requests relevant to them
  (`AuthorizationRequestService.getRequestsForUser`).
- Providers create/submit/cancel requests (`POST /api/auth-requests`,
  `POST /api/auth-requests/{fhirId}/submit`,
  `POST /api/auth-requests/{fhirId}/cancel`).
- Payers respond with determinations
  (`PUT /api/auth-requests/{fhirId}/status`).

### 2. AI Copilot (rule-based reviewer)
- `AiCopilotService.review()` runs deterministic checks:
  - CPT (5-digit) / HCPCS (letter+4-digit) format for `procedureCode`
  - ICD-10 format for `diagnosisCode`
  - 10-digit NPI validation
  - Presence/length of clinical notes (medical necessity)
  - Valid, non-past requested service date
  - Sane `unitsRequested`
  - Presence of member ID and patient DOB
- Produces a 0–100 `completenessScore`, a list of `issues`, and matching
  `recommendations`. Runs automatically on creation
  (`POST /api/auth-requests`) and on demand
  (`POST /api/auth-requests/{fhirId}/copilot-review`).

### 3. Status tracking & notifications
- `AuthorizationStatus` enum mirrors FHIR Claim/ClaimResponse lifecycle
  states (DRAFT, SUBMITTED, IN_REVIEW, PENDED, APPROVED, PARTIAL, REJECTED,
  CANCELLED).
- Every transition is appended to `AuthorizationHistory` with who changed it,
  when, previous/new status, and notes — shown in the "Status History" panel.
- `NotificationService` creates a `Notification` for every user in the
  counterpart organization on each transition; the frontend polls
  `GET /api/notifications` every 15s and shows an unread badge.

---

## FHIR alignment notes

`AuthorizationRequest` is a simplified, flattened analog of the FHIR `Claim`
resource used in the Da Vinci PAS Implementation Guide:

| Field                | FHIR equivalent                                  |
|----------------------|---------------------------------------------------|
| `fhirId`             | `Claim.id`                                        |
| `patientName/Dob/MemberId` | `Claim.patient` (Patient reference)         |
| `providerOrgName/Npi`| `Claim.provider` (Organization/Practitioner)     |
| `payerOrgName`        | `Claim.insurer` (Organization reference)         |
| `procedureCode/Description` | `Claim.item.productOrService` (CPT/HCPCS) |
| `diagnosisCode/Description` | `Claim.diagnosis.diagnosisCodeableConcept` (ICD-10) |
| `status`             | `Claim.status` / `ClaimResponse.outcome`         |
| `payerResponseNotes`, `approvedUnits` | `ClaimResponse.item` adjudication |

For a production system, you would expose this data via actual FHIR
`Claim`/`ClaimResponse` JSON resources (e.g. using HAPI FHIR) instead of the
flattened DTOs used here, but the workflow and data model map 1:1.

---

## Security

- BCrypt password hashing, stateless JWT auth (`Authorization: Bearer <token>`).
- `JwtAuthFilter` validates tokens on every `/api/**` request.
- Role checks (`PROVIDER` vs `PAYER`) are enforced in controllers — e.g. only
  providers can create requests, only payers can update status.

## Extending this project

- Swap H2 for PostgreSQL (config already included, commented out).
- Replace the rule-based `AiCopilotService` with a call to an LLM for richer
  natural-language review (the interface/response shape already supports it).
- Add file/document attachments (e.g. clinical PDFs) per request.
- Add email/SMS notification delivery in `NotificationService`.
- Expose real FHIR `Claim`/`ClaimResponse` JSON via HAPI FHIR for true
  interoperability with EHR/payer systems.
