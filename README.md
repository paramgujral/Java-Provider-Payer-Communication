# HealthConnectAI

> **AI-Powered Healthcare Authorization Platform**
> Full-Stack Developer Assessment Project

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen?logo=springboot)
![Angular](https://img.shields.io/badge/Angular-17-red?logo=angular)
![JWT](https://img.shields.io/badge/Auth-JWT-blue)
![H2](https://img.shields.io/badge/DB-H2%20%2F%20MySQL-blue)

---

## Overview

HealthConnectAI is a production-grade healthcare authorization platform that streamlines the prior authorization process between healthcare providers and payers. It features an AI Copilot for real-time request assessment, a 7-state workflow engine, role-based portals, and a full audit trail.

---

# 🏗️ Solution Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                     HealthConnectAI Platform                 │
└──────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │      Angular 17      │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │ REST API
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  Spring Boot 3.3 Backend                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Authentication Layer                                        │
│  • JWT Security                                              │
│  • Role-Based Access (Provider / Payer)                     │
│                                                              │
│  Workflow Engine                                             │
│  • Request Lifecycle                                         │
│  • Status Management                                         │
│  • Audit Tracking                                            │
│                                                              │
│  AI Copilot Engine                                           │
│  • Completeness Scoring                                      │
│  • Approval Probability                                      │
│  • Risk Analysis                                             │
│  • Recommendations                                           │
│                                                              │
│  Notification Engine                                         │
│  • Approval Alerts                                           │
│  • Denial Alerts                                             │
│  • Information Requests                                      │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │     Database      │
                 │  H2 / MySQL       │
                 ├───────────────────┤
                 │ Users             │
                 │ Requests          │
                 │ Notifications     │
                 │ Audit Logs        │
                 └───────────────────┘
---



## Problem Statement

Prior authorization in healthcare is a time-intensive, error-prone process. Providers submit incomplete requests; payers lack tooling to triage efficiently; and patients experience delays. HealthConnectAI solves this with:

- **Guided request creation** — multi-step wizard with real-time AI feedback
- **Intelligent triage** — AI completeness scoring and approval probability help payers prioritize
- **Transparent workflow** — every state transition is tracked and visible to both parties
- **Instant notifications** — providers learn of decisions or info requests immediately

---

## Features

# 🎯 Requirement Coverage

| Assignment Requirement | Implementation |
|-----------------------|----------------|
| Provider Module | Provider Dashboard, Request Creation, Request Tracking |
| Payer Module | Review Queue, Review Workspace, Decision Engine |
| AI Copilot | Completeness Score, Approval Probability, Recommendations |
| Status Tracking | 7-State Workflow Engine, Kanban Board |
| Notifications | Approval, Denial, Info Request Alerts |
| Workflow Transparency | Audit Timeline, Status History |
| Healthcare Alignment | FHIR-inspired Authorization Workflow |


# 🔄 Workflow Lifecycle

```text
DRAFT
  │
  ▼
SUBMITTED
  │
  ▼
IN_REVIEW
  ├────────────► APPROVED
  │
  ├────────────► DENIED
  │
  ▼
INFO_REQUESTED
  │
  ▼
RESUBMITTED
  │
  └────────────► IN_REVIEW

### Authentication
- JWT-based login with role detection (Provider / Payer)
- Stateless sessions — token stored in localStorage
- Route guards enforce role-based access
- Session expiry handled gracefully with redirect

### Provider Portal
| Feature | Description |
|---|---|
| Dashboard | Stats cards, recent requests, unread notifications, status breakdown bar |
| Create Request | 3-step wizard: Patient → Clinical → Review + AI; live AI analysis on step 3 |
| View Requests | Filterable/searchable table; inline Submit and Resubmit CTAs |
| Request Detail | Tabbed view — Details, AI Analysis, Audit Trail |
| Resubmit | Pre-filled form addressing payer's information request |
| Status Board | 7-column Kanban with priority-highlighted cards |
| Notifications | Full notification center with type filtering |

### Payer Portal
| Feature | Description |
|---|---|
| Dashboard | Queue size, processed today, approval rate, today's breakdown |
| Review Queue | Priority-sorted table; AI probability column; wait-day urgency |
| Review Detail | Full workspace — patient/clinical details, AI sidebar, audit trail, decision forms |
| Approve | One-click with optional reviewer notes |
| Deny | Denial reason required (sent to provider) |
| Request Info | Specific information request sent to provider |
| Status Board | 7-column Kanban across all requests |

### AI Copilot (Rule-Based Engine)
- **Completeness Score** (0–100%) — penalises missing clinical notes, documents, physician, facility
- **Approval Probability** (0–100%) — weighted blend of completeness, service type, priority flags, notes length
- **Risk Level** — LOW / MEDIUM / HIGH based on approval probability
- **Missing Field Detection** — lists exactly which fields are absent
- **Warning Engine** — date conflicts, brief notes, urgent without documentation
- **Recommendation Engine** — actionable suggestions tailored to service type and diagnosis codes
- Animated SVG circular gauges with colour transitions

### Workflow Engine

```
DRAFT → SUBMITTED → IN_REVIEW → APPROVED
                              → DENIED
                              → INFO_REQUESTED → RESUBMITTED → IN_REVIEW → ...
```

7 states with enforced transitions — invalid moves return 400 with clear error messages.

### Notification Center
Four notification types delivered on every workflow transition:
- `REQUEST_APPROVED` — green, sent to provider
- `REQUEST_DENIED` — red, includes denial reason
- `INFO_REQUESTED` — amber, includes specific information needed
- `AI_WARNING` — cyan, sent on low completeness score at draft creation

### Audit Timeline
Immutable, append-only audit log for every request:
- Actor name + role captured at time of action
- Full details (reviewer notes, denial reasons) stored
- Filterable by event type
- Events breakdown sidebar

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 3.3 | Framework |
| Spring Security | 6.x | Auth + method security |
| Spring Data JPA | 3.x | ORM layer |
| Hibernate | 6.x | JPA provider |
| H2 | 2.x | Embedded database (dev) |
| MySQL | 8.x | Production database (optional) |
| JJWT | 0.11.5 | JWT generation + validation |
| SpringDoc OpenAPI | 2.5 | Swagger UI |
| Lombok | latest | Boilerplate reduction |
| Maven | 3.x | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Angular | 17 | Framework |
| TypeScript | 5.4 | Language |
| Angular Signals | 17 | Reactive state |
| Angular Router | 17 | Lazy-loaded routing |
| RxJS | 7.8 | Async streams |
| SCSS | — | Styling + CSS variables |
| Angular Standalone Components | 17 | No NgModules |

---

## API Endpoints

### Auth
| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Any | Current user profile |

### Authorization Requests
| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/api/requests` | PROVIDER | Create draft |
| GET | `/api/requests` | PROVIDER | My requests (filterable) |
| GET | `/api/requests/{id}` | Any | Get by ID |
| POST | `/api/requests/{id}/submit` | PROVIDER | Submit for review |
| POST | `/api/requests/{id}/resubmit` | PROVIDER | Resubmit with info |
| GET | `/api/requests/dashboard` | PROVIDER | Provider stats |
| GET | `/api/requests/queue` | PAYER | Review queue |
| POST | `/api/requests/{id}/review/start` | PAYER | Start review |
| POST | `/api/requests/{id}/review/decision` | PAYER | Approve/Deny/Info |
| GET | `/api/requests/payer/dashboard` | PAYER | Payer stats |
| GET | `/api/requests/status/{status}` | Any | Kanban by status |
| GET | `/api/requests/{id}/ai-analysis` | Any | AI assessment |
| GET | `/api/requests/{id}/audit` | Any | Audit trail |

### Notifications
| Method | Path | Description |
|---|---|---|
| GET | `/api/notifications` | All notifications for current user |
| GET | `/api/notifications/unread-count` | Unread badge count |
| PATCH | `/api/notifications/{id}/read` | Mark one as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

---

## Installation & Setup

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- npm 9+

### Quick Start (Recommended)

```bash
git clone <repo-url>
cd healthconnectai
chmod +x start.sh
./start.sh
```

Open **http://localhost:4200**

---

### Manual Setup

#### Backend
```bash
cd healthconnectai/backend
./mvnw spring-boot:run
```

Backend starts on **http://localhost:8080**

- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:healthconnectdb`
  - Username: `sa` / Password: *(empty)*

#### Frontend
```bash
cd healthconnectai/frontend
npm install
npm start
```

Frontend starts on **http://localhost:4200**

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Provider | provider@healthconnect.com | password123 |
| Provider 2 | provider2@healthconnect.com | password123 |
| Payer | payer@healthconnect.com | password123 |
| Payer 2 | payer2@healthconnect.com | password123 |

Demo data seeds 7 authorization requests across all 7 statuses on startup.

---

## Switch to MySQL (Production)

1. Update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/healthconnectdb
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=false
```

2. Create the database:
```sql
CREATE DATABASE healthconnectdb CHARACTER SET utf8mb4;
```

---

## Project Structure

```
healthconnectai/
├── start.sh                          # One-command startup
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/healthconnect/platform/
│       ├── HealthConnectAIApplication.java
│       ├── config/          # Security, Swagger, Jackson
│       ├── controller/      # Auth, Requests, Notifications
│       ├── dto/             # Request/Response DTOs
│       ├── entity/          # User, AuthorizationRequest, Notification, AuditLog
│       ├── enums/           # Role, RequestStatus, NotificationType, AuditAction
│       ├── exception/       # GlobalExceptionHandler, custom exceptions
│       ├── repository/      # JPA repositories
│       ├── security/        # JWT provider, filter, entry point
│       ├── seeder/          # Demo data
│       └── service/         # Business logic + AI engine
└── frontend/
    └── src/app/
        ├── app.routes.ts              # Lazy-loaded routes
        ├── core/
        │   ├── guards/                # auth, role, login guards
        │   ├── interceptors/          # JWT interceptor
        │   ├── models/                # TypeScript interfaces
        │   └── services/              # Auth, Request, Notification
        ├── features/
        │   ├── auth/login/
        │   ├── provider/              # Dashboard, Create, View, Resubmit
        │   ├── payer/                 # Dashboard, Queue, Review Detail
        │   └── shared/                # AI Copilot, Status Board, Notifications,
        │                              # Audit Timeline, Request Detail, Badges
        └── layout/
            └── dashboard-layout/      # Sidebar + header shell
```

---

# 🚀 End-to-End User Journey

## Provider Journey

```text
Login
  ↓
Create Authorization Request
  ↓
AI Copilot Validation
  ↓
Submit Request
  ↓
Track Status
  ↓
Receive Decision

## Payer Journey

Login
  ↓
Review Queue
  ↓
Analyze Request
  ↓
Approve / Deny / Request Information
  ↓
Provider Notification

## AI Analysis

Clinical Notes
Diagnosis
Procedure
Supporting Documents
          │
          ▼
      AI Engine
          │
          ▼
Completeness Score
Approval Probability
Risk Assessment
Recommendations

## Screenshots

> Add screenshots to `/docs/screenshots/` and reference them here.

| Screen | Description |
|---|---|
| Login | Split-panel with demo quick-fill cards |
| Provider Dashboard | Stats + recent requests + notifications |
| Create Request | 3-step wizard with live AI analysis panel |
| View Requests | Filterable table with AI completeness bars |
| Request Detail | Tabbed: Details · AI Analysis · Audit Trail |
| Payer Queue | Priority-sorted table with AI probability |
| Review Detail | Decision workspace with AI sidebar |
| Kanban Board | 7-column status board |
| Notifications | Full notification center with type filters |
| Audit Timeline | Immutable event history with filter chips |

---

## Demo Video

> Record a walkthrough and link it here.

https://github.com/jnikshep13/Feuji_java_full_stack_project/blob/saipranay-submission/screenshots/Feuji_Assignment_Project_Health_Connect_AI_Demo.mp4

Suggested flow:
1. Login as Provider → create a request → watch AI Copilot score animate
2. Submit → switch to Payer → see it in the queue
3. Open review → approve → switch back to Provider → see notification
4. Create another → payer denies with reason → provider resubmits
5. Show Kanban board with all 7 columns populated

---

## License

MIT — built for assessment purposes.
