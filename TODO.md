# TODO - Healthcare Insurance Claim Management System

## Backend (Spring Boot)
- [ ] Review existing entity models (BaseEntity, Patient, Disease, InsuranceCompany, InsurancePolicy, Claim, ClaimDocument, AIValidation, ClaimReview, AuditLog) and align packages.
- [ ] Add missing Spring Boot configuration: application.yml for PostgreSQL + JPA settings.
- [ ] Add Docker compose (backend/compose.yaml) with correct DB credentials and ports.
- [ ] Implement common backend layers for each CRUD aggregate:
  - [ ] Repository layer (Spring Data JPA)
  - [ ] DTO layer
  - [ ] Mapper layer
  - [ ] Service layer + ServiceImpl
  - [ ] REST controllers
  - [ ] Validation (request DTO validation)
  - [ ] Global exception handling
- [ ] Implement Claim workflow endpoints for healthcare and insurance sides.
- [ ] Implement file upload APIs:
  - [ ] POST /documents/upload
  - [ ] GET /documents/{id}
  - [ ] DELETE /documents/{id}
  - [ ] Store uploads locally in backend/Healthcare_Insurance_Management_System/uploads/
- [ ] Implement AI validation:
  - [ ] ClaimValidationService with required checks
  - [ ] Persist results to AIValidation table
- [ ] Implement AuditLog auto-recording for required actions.
- [ ] Implement dashboard APIs with optimized queries:
  - [ ] Healthcare stats (total patients, total claims, pending/approved/rejected)
  - [ ] Insurance stats (received/under review/approved/rejected)

## Frontend (Angular)
- [ ] Generate Angular app (standalone components) with Angular Material + reactive forms.
- [ ] Create modules: dashboard, patient, disease, insurance-policy, claim, shared.
- [ ] Create pages per spec (healthcare + insurance).
- [ ] Implement services with HttpClient integrating real backend APIs (no mock data).
- [ ] Implement professional UI: cards, charts (Chart.js), Material tables with pagination/sorting/search.

## Integration & Verification
- [ ] Ensure docker compose up -d brings up PostgreSQL.
- [ ] Ensure mvn spring-boot:run works and APIs are reachable.
- [ ] Ensure ng serve builds and Angular calls backend APIs successfully.
- [ ] Smoke test CRUD + claim workflow + uploads + dashboard endpoints.

