# AuthBridge — System Architecture

**AI-powered prior authorization & claims communication platform for healthcare providers and payers.**

This document is the architecture deliverable for AuthBridge. It covers the high-level system design, the implemented frontend (Next.js) and backend (Spring Boot), the data model, API contracts, the AI copilot design, the authorization lifecycle/workflow, security & compliance posture, deployment topology, the technology stack with justification, UI/UX flows, and a phased MVP → production roadmap.

The repository contains a **fully runnable demo** of the platform (see [README.md](README.md)). The frontend runs standalone on its own in-memory API routes; the Spring Boot backend implements the same contract for the production path.

---

## 1. High-level system architecture

```
                         ┌────────────────────────────────────────────────────────┐
                         │                     Client (Browser)                    │
                         │   Provider Portal   ·   Payer Portal   ·   AI Copilot   │
                         └───────────────┬───────────────────────┬────────────────┘
                                         │  HTTPS (TLS 1.2+)      │
                                         ▼                        ▼
                         ┌────────────────────────────────────────────────────────┐
                         │          Next.js (App Router) — SSR/edge + BFF          │
                         │   React UI · API routes (demo) / proxy to Java (prod)   │
                         └───────────────┬────────────────────────────────────────┘
                                         │  REST /api/v1 (OAuth2 Bearer / JWT)
                                         ▼
        ┌────────────────────────── API Gateway / Ingress (TLS, WAF, rate-limit) ──────────────────────────┐
        │                                                                                                   │
        ▼                                                                                                   ▼
┌──────────────────────────────────────────────────────────┐                              ┌───────────────────────────┐
│            Spring Boot — AuthBridge (modular)             │                              │   Identity Provider       │
│                                                            │   OIDC discovery / JWKS     │   (Keycloak / Auth0 /     │
│  ┌─────────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │◀───────────────────────────▶│    Cognito)               │
│  │  Provider   │ │  Payer   │ │ Workflow │ │  Copilot  │  │                              └───────────────────────────┘
│  │  module     │ │  module  │ │  engine  │ │  service  │  │
│  └─────────────┘ └──────────┘ └──────────┘ └─────┬─────┘  │      ┌───────────────────────────────────────────┐
│  ┌─────────────┐ ┌────────────────────────┐      │        │─────▶│  LLM provider (Claude API)                │
│  │ Notification│ │  Audit / Compliance     │      │        │      │  medical-necessity review, summaries      │
│  │ service     │ │  (append-only log)      │      │        │      └───────────────────────────────────────────┘
│  └──────┬──────┘ └────────────────────────┘      │        │
└─────────┼────────────────────────────────────────┼────────┘
          │                                         │
          ▼                ▼               ▼         ▼
   ┌────────────┐  ┌──────────────┐ ┌───────────┐ ┌────────────────┐
   │ Email/SMS  │  │ PostgreSQL   │ │ Object    │ │ Redis (cache,  │
   │ SES/Twilio │  │ (HA, encrypt)│ │ store S3  │ │ sessions, MQ)  │
   └────────────┘  └──────────────┘ └───────────┘ └────────────────┘
                                                          │
                                                          ▼
                                          ┌────────────────────────────────┐
                                          │ Observability: Prometheus /    │
                                          │ Grafana / OpenTelemetry / ELK  │
                                          └────────────────────────────────┘
```

**Style: modular monolith first.** The backend is one deployable Spring Boot application with strict package boundaries (`provider`, `payer`, `workflow`, `copilot`, `notification`, `audit`). This is the right altitude for an MVP: one codebase, one transaction boundary, simple ops. Each module is designed to be extracted into a microservice when load or team scaling demands it — the workflow engine and copilot service are the most likely first extractions because their scaling profiles differ from the CRUD path.

---

## 2. Frontend architecture & technology recommendation

**Stack: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS.**

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js App Router | SSR for fast first paint on dense dashboards, server components for data fetching, and built-in API routes that act as a **Backend-for-Frontend** (BFF) — token handling and payload shaping stay server-side. |
| Language | TypeScript (strict) | Shared domain types (`lib/types.ts`) mirror the Java DTOs, eliminating contract drift. |
| Styling | Tailwind CSS | Enterprise-grade, accessible, consistent design system without a heavy component runtime. |
| State | Server components + local React state | The data is request-scoped; no global store needed. React Query/SWR is the recommended upgrade for cache + optimistic updates. |
| Realtime | Polling now (8s) → **SSE/WebSocket** in prod for live status & notifications. |

**Implemented structure:**

```
frontend/
├── app/
│   ├── page.tsx                  Landing / marketing
│   ├── login/                    Role selection (OAuth2/OIDC in prod)
│   ├── provider/                 Provider portal (dashboard, requests, new+copilot, detail)
│   ├── payer/                    Payer portal (dashboard, queue, review, reports)
│   └── api/                      BFF: requests, copilot, notifications (in-memory demo store)
├── components/                   AppShell, CopilotPanel, RequestTable, Timeline, Badges, icons…
└── lib/                          types, store (in-memory), copilot rules engine, session, ui helpers
```

The **AI Copilot** is a first-class UI element: a sticky rail on the request-creation screen that re-evaluates the request live (debounced) and shows completeness %, approval-likelihood %, and a prioritized list of actionable issues. Submission is **blocked** while ERROR-severity issues remain.

---

## 3. Java backend architecture (Spring Boot)

**Spring Boot 3.3 · Java 21 · Spring Web · Spring Data JPA · Bean Validation · Actuator.**

```
backend/src/main/java/ai/authbridge/
├── AuthBridgeApplication.java
├── domain/            Entities + enums (AuthorizationRequest aggregate, ClinicalDocument,
│                      TimelineEvent [append-only audit], NotificationEntity)
├── repository/        Spring Data JPA repositories
├── copilot/           CopilotService (rules engine) + CopilotReview (structured output)
├── workflow/          WorkflowService — the single choke-point for status transitions;
│                      enforces the legal state machine + writes the audit event + notifies
├── notification/      NotificationService (in-app now; email/SMS fan-out hooks)
├── service/           AuthorizationRequestService (create/query, copilot preview)
├── web/               REST controllers (+ dto/) under /api/v1
├── config/            CORS / web config (security notes below)
└── bootstrap/         DataSeeder (dev/demo profiles)
```

**Design principles applied:**
- **Single write path for lifecycle** — every status change flows through `WorkflowService.transition()`, which validates `RequestStatus.canTransitionTo()`, appends an immutable `TimelineEvent`, and fires the counterparty notification. No controller mutates status directly.
- **Append-only audit** — `timeline_event` rows are never updated/deleted; they are the compliance audit trail.
- **DTO boundary** — entities never leave the service layer; `RequestDtos.RequestView` is the wire shape, identical to the frontend `AuthRequest` type.
- **Profiles** — `dev`/`demo` run on H2 with seed data and zero infra; `prod` runs on PostgreSQL with `ddl-auto=validate` (Flyway-managed schema).

---

## 4. Database design & ER diagram

```
┌────────────────────────────┐
│      auth_request          │
│────────────────────────────│
│ id (UUID) PK               │        ┌──────────────────────────┐
│ reference_no  UQ           │   1   *│   clinical_document       │
│ status (enum)              │───────▶│──────────────────────────│
│ priority (enum)            │        │ id PK · request_id FK     │
│ provider_org · payer_org   │        │ name · type · size_kb     │
│ submitted_by · reviewer    │        │ storage_key (S3) ·  ts    │
│ patient_name*·dob*·member* │        └──────────────────────────┘
│ service_requested          │
│ place_of_service · units   │        ┌──────────────────────────┐
│ clinical_justification     │   1   *│   timeline_event (audit) │
│ decision_note              │───────▶│──────────────────────────│
│ created_at · updated_at    │        │ id PK · request_id FK     │
└──────────┬─────────────────┘        │ at · actor · role (enum)  │
           │ 1                         │ action · note             │
           │                          │ from_status · to_status   │  ← append-only
   ┌───────┴──────────┐               └──────────────────────────┘
   │ * req_cpt         │
   │ * req_icd10       │ (element collections: code lists)
   └───────────────────┘

┌──────────────────────────┐            * = PHI columns →
│      notification        │              encrypted at rest (column converter / KMS),
│──────────────────────────│              de-identified in non-prod environments.
│ id PK · role (enum)      │
│ request_id · reference_no│            Production additions (not in demo schema):
│ title · body · channel   │             • org, app_user, role_grant   (RBAC + multi-tenant)
│ read · created_at        │             • payer_policy                (medical-necessity rules)
└──────────────────────────┘             • attachment_scan             (AV/DLP status)
```

**Indexing:** `auth_request(status)`, `auth_request(payer_org)`, `notification(role, read)`. **Partitioning** of `timeline_event` by month is recommended at scale. PHI columns use envelope encryption (data key per row, KEK in KMS/Vault).

---

## 5. API design (sample endpoints)

Base path: **`/api/v1`**. JSON. OAuth2 Bearer (JWT) in production. Versioned via URI prefix; breaking changes ship under `/api/v2` with overlap.

| Method | Path | Purpose | Auth (role) |
|---|---|---|---|
| `GET` | `/requests?status=IN_REVIEW` | List requests (RBAC-scoped to caller's org) | PROVIDER / PAYER |
| `POST` | `/requests` | Create draft or submit | PROVIDER |
| `GET` | `/requests/{id}` | Fetch full request + copilot + timeline | PROVIDER / PAYER |
| `PATCH` | `/requests/{id}` | Workflow action: `transition` or `assign` | PAYER / PROVIDER |
| `POST` | `/copilot` | Live pre-submission review (stateless) | PROVIDER |
| `GET` | `/notifications?role=PROVIDER` | List notifications + unread count | authenticated |
| `POST` | `/notifications` | `markAllRead` | authenticated |
| `GET` | `/actuator/health` | Liveness/readiness probes | system |

**Sample — submit a request**
```http
POST /api/v1/requests
{
  "serviceRequested": "MRI lumbar spine without contrast",
  "cptCodes": ["72148"], "icd10Codes": ["M54.16"],
  "priority": "ROUTINE", "requestedUnits": 1,
  "patientName": "Jordan T.", "memberId": "MRD-8841290",
  "providerOrg": "Riverside General Hospital", "payerOrg": "Meridian Health Plan",
  "clinicalJustification": "10 weeks radicular pain, failed PT and NSAIDs…",
  "documents": [{ "name": "notes.pdf", "type": "Clinical Notes", "sizeKb": 412 }],
  "status": "SUBMITTED"
}
→ 201 { "data": { "id": "…", "referenceNo": "PA-2026-01001", "status": "SUBMITTED",
                   "copilot": { "completenessScore": 92, "approvalLikelihood": 84, "issues": [...] }, ... } }
```

**Sample — payer decision**
```http
PATCH /api/v1/requests/{id}
{ "to": "APPROVED", "note": "Auth #MER-77120, valid 90 days",
  "actor": { "name": "P. Sattler · Meridian", "role": "PAYER" } }
→ 200 { "data": { ...status: "APPROVED", timeline: [...appended event...] } }
```

> **GraphQL (optional):** a read-only GraphQL gateway is recommended for the dashboards, where a single query can hydrate stats + recent requests + notifications and avoid over-fetching. Mutations stay on REST to keep the workflow choke-point explicit.

---

## 6. AI Copilot architecture & LLM integration

**Goal:** catch problems *before* submission, predict approval likelihood, and draft narratives/summaries.

```
Request draft (live keystrokes, debounced)
        │
        ▼
┌──────────────────────────────┐     no key / fast path
│  Copilot orchestrator        │────────────────────────▶  Rules engine  (deterministic,
│  (CopilotService)            │                            ships today, 0 deps)
│  • validate codes/format     │
│  • completeness scoring      │     ANTHROPIC_API_KEY set
│  • approval-likelihood model │────────────────────────▶  Claude (claude-opus-4-8)
│  • narrative / summary gen   │        structured tool-call → CopilotReview JSON
└──────────────────────────────┘                            (rules output = fallback + few-shot)
        │
        ▼
CopilotReview { completenessScore, approvalLikelihood, issues[], summary, suggestedNarrative }
```

**Why this design:**
- **Deterministic core, LLM augmentation.** The rules engine (implemented in both `lib/copilot.ts` and `CopilotService.java`) guarantees the platform works offline and gives a stable, explainable baseline. The LLM path layers richer medical-necessity reasoning, policy matching, and narrative generation on top, returning the **same structured shape** via a forced tool-call so the UI is identical.
- **Structured output.** The model is constrained to emit `CopilotReview` JSON (tool/`response_format`), so there's no brittle parsing and the rules output serves as the fallback and a few-shot example.
- **RAG for policy.** In production the copilot retrieves the relevant payer medical-necessity policy (vector store over policy documents) and grounds its issues/likelihood in cited policy clauses.
- **Safety & compliance.** PHI is minimized before egress to any LLM; prompts and completions are logged to the audit store; the copilot is **advisory** — it never auto-approves or auto-denies. A human always decides.

---

## 7. Authorization request lifecycle / workflow

```
            ┌────────┐  submit   ┌────────────┐ pick-up ┌────────────┐
            │ DRAFT  │──────────▶│ SUBMITTED  │────────▶│ IN_REVIEW  │
            └────────┘           └─────┬──────┘         └──────┬─────┘
              ▲                        │  (auto)               │
   resubmit   │                        ▼                       ├──▶ APPROVED ──┐
   (correct)  │                 ┌────────────────┐             ├──▶ DENIED ────┤ resubmit
              │                 │ INFO_REQUESTED │◀────────────┘               │ (appeal)
              └─────────────────┤                │──────▶ RESUBMITTED ─────────┘
                                └────────────────┘            │
                                                              ▼ (re-enters review)
```

The state machine is enforced in code by `RequestStatus.canTransitionTo()` and executed exclusively by `WorkflowService`. Every transition: (1) validates legality, (2) appends an immutable audit event with actor/role/timestamp/note, (3) notifies the counterparty (email for terminal decisions, in-app otherwise). **Escalation & reassignment** are modeled as payer-side actions (`assign` + SLA timers); **collaboration** happens through the shared timeline and the INFO_REQUESTED ↔ RESUBMITTED loop.

---

## 8. Security & compliance architecture (HIPAA-aligned)

| Control | Approach |
|---|---|
| **AuthN** | OAuth2 / OpenID Connect via external IdP (Keycloak/Auth0/Cognito). Backend is a JWT resource server; frontend uses Auth Code + PKCE; tokens in httpOnly cookies. |
| **AuthZ / RBAC** | Roles `PROVIDER`, `PAYER` (+ admin/auditor). Method-level `@PreAuthorize` and org-scoped queries: providers see only their org's requests; payers never see drafts. |
| **Encryption in transit** | TLS 1.2+ everywhere; mTLS between internal services. |
| **Encryption at rest** | PostgreSQL TDE/volume encryption + column-level envelope encryption for PHI (KMS/Vault-managed keys). Object store (documents) SSE-KMS. |
| **Audit logging** | Append-only `timeline_event` per request + structured app audit log shipped to immutable storage. Supports compliance reporting (who/what/when). |
| **PHI minimization** | De-identified data in non-prod; PHI stripped before any LLM call; field-level access logging. |
| **Document safety** | AV scan + DLP on upload; signed, expiring URLs; no public buckets. |
| **Network** | WAF + rate limiting at the gateway; private subnets for data tier; security groups least-privilege. |
| **BAA** | Business Associate Agreements with all subprocessors (cloud, email/SMS, LLM provider). |

---

## 9. Deployment architecture (Docker · Kubernetes · Cloud)

```
                 Internet
                    │  TLS
            ┌───────▼────────┐
            │  Ingress + WAF │  (NGINX/ALB, cert-manager)
            └───┬────────┬───┘
                │        │
        ┌───────▼──┐  ┌──▼───────────────┐
        │ frontend │  │ backend (Spring) │   Kubernetes Deployments
        │ (Next.js)│  │  HPA 3..N pods   │   • liveness/readiness via /actuator/health
        │  3..N    │  └──┬────────┬──────┘   • rolling updates, PodDisruptionBudgets
        └──────────┘     │        │          • secrets via External Secrets / Vault
                         │        │
              ┌──────────▼─┐   ┌──▼──────────┐   ┌───────────┐
              │ PostgreSQL │   │   Redis     │   │ S3/GCS    │  managed, multi-AZ
              │ (HA, PITR) │   │ cache/MQ    │   │ documents │
              └────────────┘   └─────────────┘   └───────────┘
   Observability: Prometheus + Grafana, OpenTelemetry traces, ELK/Loki logs, alerting.
   CI/CD: build → test → scan (SAST/deps) → image → staging → canary → prod.
```

- **Containers:** multi-stage Dockerfiles for both apps (provided). **Local:** `docker compose up` brings up frontend + backend + Postgres.
- **Cloud-agnostic:** runs on EKS/GKE/AKS. HPA on CPU + request latency. Stateless apps; state in managed Postgres/Redis/object store.
- **High availability:** ≥3 replicas per service across zones, multi-AZ database with automated failover and point-in-time recovery.

---

## 10. Recommended technology stack & justification

| Layer | Technology | Justification |
|---|---|---|
| Frontend | **Next.js 14 + React + TS + Tailwind** | SSR performance, BFF for secure token handling, shared types, enterprise UI velocity. |
| Backend | **Spring Boot 3.3 / Java 21** | Mandated Java; mature, secure, huge healthcare-enterprise footprint; virtual threads + records in 21. |
| Data | **PostgreSQL** | ACID, JSONB flexibility, strong encryption & HA story; H2 for frictionless dev. |
| Cache/MQ | **Redis** | Sessions, hot-path caching, lightweight pub/sub for notifications. |
| Object store | **S3/GCS** | Encrypted, durable document storage with signed URLs. |
| AuthN/Z | **Keycloak / Auth0 / Cognito (OIDC)** | Standards-based SSO, MFA, RBAC; no homegrown auth. |
| AI | **Claude (Anthropic API)** | Strong clinical reasoning + structured tool-calling for reliable JSON; rules-engine fallback. |
| Observability | **Prometheus/Grafana + OpenTelemetry + ELK/Loki** | Metrics, traces, logs; Actuator exposes Prometheus metrics out of the box. |
| Infra | **Docker + Kubernetes** | Portable, self-healing, autoscaling; cloud-agnostic. |

---

## 11. UI wireframes & user journeys

**Implemented screens** (all live in the demo):
- **Landing** — value prop, lifecycle strip, dual CTA (provider/payer).
- **Login** — role selection (OIDC in prod).
- **Provider:** Dashboard (KPIs + "needs attention" + recent) · My Requests (filter/search) · **New Request + live Copilot rail** · Request detail (details, justification, documents, copilot, audit timeline, submit/resubmit).
- **Payer:** Reviewer Dashboard (workload KPIs + queue) · Review Queue (filter/search) · **Review & Decision** (approve / request-info / deny with notes) · Reports & Compliance.

**Provider journey:** Login → New Request → copilot flags missing/weak fields live → fix until score is green → Submit → track status → respond to INFO_REQUESTED → see approval + notification.

**Payer journey:** Login → Queue → open request → read copilot review + documents → Start review → Approve/Request-info/Deny with note → provider notified, audit trail updated.

---

## 12. Phased implementation roadmap (MVP → Production)

| Phase | Scope | Outcome |
|---|---|---|
| **Phase 0 — Foundation (this repo)** | Provider & payer portals, request lifecycle, rules-based copilot, in-app notifications, audit timeline, REST API, modular Spring Boot backend, demo data. | **Runnable end-to-end demo.** |
| **Phase 1 — MVP / production hardening** | OAuth2/OIDC + RBAC, PostgreSQL + Flyway, document upload to S3 with AV/DLP, email notifications, CI/CD + container deploy, observability. | First real pilot with one provider + one payer. |
| **Phase 2 — AI uplift** | Claude-backed copilot with policy RAG, approval-likelihood model trained on outcomes, auto-generated summaries & suggested payer responses. | Measurable lift in first-pass approval. |
| **Phase 3 — Scale & interoperability** | Microservice extraction (workflow, copilot), SSE/WebSocket realtime, SMS/push, **FHIR / X12 278** payer connectivity, SLA/escalation engine, multi-tenant orgs. | Multi-payer/provider network. |
| **Phase 4 — Enterprise** | Analytics & compliance reporting suite, payer policy authoring, appeals workflow, HITRUST/SOC 2, regional HA/DR. | Enterprise-grade GA. |

---

*Synthetic data only. This is a demonstration platform; production deployment requires completed HIPAA controls, BAAs, and a formal security assessment.*
