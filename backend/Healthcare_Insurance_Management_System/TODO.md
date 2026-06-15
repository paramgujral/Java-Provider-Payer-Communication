# TODO - Healthcare Insurance Claim Management System

## Backend
- [ ] Update pom.xml to Java 21
- [ ] Create/extend application.yml with PostgreSQL (health_insurance_db / postgres / postgres)
- [ ] Fix compose.yaml with required DB settings
- [ ] Implement common backend layers (DTO, Mapper, Repository, Service/Impl, Controller)
- [ ] Implement validation + global exception handling
- [ ] Implement CRUD APIs:
  - [ ] Patient
  - [ ] Disease
  - [ ] InsuranceCompany
  - [ ] InsurancePolicy
  - [ ] Claim
- [ ] Implement file upload APIs (/documents/upload etc.)
- [ ] Implement Claim workflow endpoints + AI validation service
- [ ] Persist AIValidation + ClaimReview
- [ ] Implement audit log records for workflow events
- [ ] Implement dashboard APIs (optimized queries)

## Frontend
- [ ] Generate Angular app (standalone components)
- [ ] Add Angular Material, Reactive Forms, HttpClient, Chart.js
- [ ] Implement modules/pages per spec
- [ ] Implement services integrating real backend APIs
- [ ] Implement Material tables + charts

## Integration
- [ ] Verify docker compose up -d
- [ ] Verify mvn spring-boot:run
- [ ] Verify ng serve
- [ ] Smoke test end-to-end workflow (create/upload/submit/review)

