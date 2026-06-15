# 🏥 HealthConnector Platform

> A full-stack **Prior Authorization Management System** for healthcare, connecting Providers, Payers, and Administrators on a single secure platform — powered by **Spring Boot 3**, **Angular 22**, **MongoDB Atlas**, and **Google Gemini AI**.

---

## 🚀 Live Demo

> **The application is live and ready to use — no local setup required.**

| | |
|---|---|
| 🌐 **Frontend (Vercel)** | **[https://fueji-health-connector-angular-fron.vercel.app](https://fueji-health-connector-angular-fron.vercel.app)** |
| 🔐 **Login Page** | **[https://fueji-health-connector-angular-fron.vercel.app/login](https://fueji-health-connector-angular-fron.vercel.app/login)** |
| ⚙️ **Backend API (Render)** | **[https://fueji-health-connector-springboot-backend.onrender.com](https://fueji-health-connector-springboot-backend.onrender.com)** |
| 📖 **Swagger API Docs** | **[https://fueji-health-connector-springboot-backend.onrender.com/swagger-ui/index.html](https://fueji-health-connector-springboot-backend.onrender.com/swagger-ui/index.html)** |
| 📧 **Email** | **`eswar.crypto.tech@gmail.com`** |
| 🔑 **Password** | **`Admin@123`** |
| 👤 **Role** | `SUPER_ADMIN` — full platform access |

---

<img width="1900" height="971" alt="Screenshot 2026-06-14 202231" src="https://github.com/user-attachments/assets/f660938c-8176-4616-ab15-f2522eaeeabd" />

<img width="1887" height="981" alt="image" src="https://github.com/user-attachments/assets/cb44d75b-b6b1-43a7-a6b6-7b4dc31d0e1b" />

<img width="1899" height="848" alt="image" src="https://github.com/user-attachments/assets/7713e307-6c43-4854-8ef7-65724c00b61d" />

<img width="1909" height="899" alt="image" src="https://github.com/user-attachments/assets/46c494ef-875d-485e-9f80-f2453ffe2970" />

<img width="1890" height="967" alt="image" src="https://github.com/user-attachments/assets/8b4fb6dd-3e56-49e0-98dd-5ba40ccf8774" />

<img width="470" height="817" alt="image" src="https://github.com/user-attachments/assets/fc4be5b8-bc52-4e78-9b3f-b0454130be32" />

<img width="466" height="810" alt="image" src="https://github.com/user-attachments/assets/820b5c8c-e27d-486c-972c-f73891337fe6" />


## 📋 Table of Contents

1. [Overview](#-overview)
2. [System Architecture](#-system-architecture)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [User Roles & Features](#-user-roles--features)
6. [Authentication & Authorization Flow](#-authentication--authorization-flow)
7. [Prior Authorization Lifecycle](#-prior-authorization-lifecycle)
8. [Data Flow](#-data-flow)
9. [Security Implementation](#-security-implementation)
10. [Database Design](#-database-design)
11. [AI Integration](#-ai-integration)
12. [REST API Reference](#-rest-api-reference)
13. [Installation & Setup](#-installation--setup)
14. [Running the Application](#-running-the-application)
15. [Environment Configuration](#-environment-configuration)
16. [Default Credentials](#-default-credentials)

---

## 🌐 Overview

**HealthConnector** is an enterprise-grade healthcare authorization platform that digitizes and automates the prior authorization process between medical providers and insurance payers. It replaces manual, paper-based workflows with a real-time digital system that includes:

- 🤖 **AI-powered clinical review** using Google Gemini to assess authorization requests
- 🔐 **End-to-end encryption** of all patient sensitive data (AES-256/GCM)
- 📊 **Real-time analytics dashboards** for all stakeholders
- 🔔 **Automated notifications** for status changes
- 📜 **Immutable audit logs** for compliance and security
- 🏥 **FHIR-ready** data modeling for interoperability

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                               │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │              Angular 22 SSR Frontend (Port 4200)             │  │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │  │
│   │   │  Admin   │  │ Provider │  │  Payer   │  │  Auth    │   │  │
│   │   │ Module   │  │  Module  │  │  Module  │  │  Module  │   │  │
│   │   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │  │
│   │   ┌──────────────────────────────────────────────────────┐   │  │
│   │   │         Angular HTTP Client + Auth Interceptor        │   │  │
│   │   └──────────────────────────────────────────────────────┘   │  │
│   └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTPS / REST (Bearer JWT)
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Spring Boot 3 API Server (Port 8080)               │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  ┌───────────┐  │
│  │   Security  │  │ Controllers │  │  Services  │  │Repositories│  │
│  │   Filter    │→ │  (REST API) │→ │ (Business  │→ │(MongoDB   │  │
│  │   Chain     │  │             │  │   Logic)   │  │ Spring    │  │
│  │ JWT Filter  │  │ /api/auth   │  │ Auth       │  │  Data)    │  │
│  │ CORS Filter │  │ /api/auth.. │  │ Service    │  └───────────┘  │
│  │ CSP Headers │  │ /api/users  │  │ Gemini AI  │       │         │
│  └─────────────┘  │ /api/analyt.│  │ Notification│      ▼         │
│                   │ /api/audit  │  │ AES Encrypt │  ┌──────────┐  │
│                   └─────────────┘  │ Audit Log   │  │  MongoDB │  │
│                                    └────────────┘   │  Atlas   │  │
│  ┌──────────────────────────────────────────────┐   │  (Cloud) │  │
│  │  GlobalExceptionHandler (@RestControllerAdvice)│  └──────────┘  │
│  └──────────────────────────────────────────────┘                  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
   ┌─────────────────────┐         ┌─────────────────────┐
   │  Google Vertex AI   │         │     SMTP (Gmail)    │
   │  Gemini 2.5 Flash   │         │   Email Notifications│
   └─────────────────────┘         └─────────────────────┘
```

### Architecture Principles

| Principle | Implementation |
|-----------|---------------|
| **Stateless API** | JWT tokens — no server-side sessions |
| **Layered Architecture** | Controller → Service → Repository → Model |
| **Role-Based Access** | `@PreAuthorize` annotations per endpoint |
| **Async Processing** | `@Async` for notifications and audit logs |
| **Optimistic Locking** | `@Version` on MongoDB documents |
| **Encrypted at Rest** | AES-256/GCM on all patient PII fields |

---

## 🛠️ Tech Stack

### 🔧 Backend

| Technology | Version | Purpose |
|---|---|---|
| **Java** | 21 (LTS) | Core language |
| **Spring Boot** | 3.4.3 | Application framework |
| **Spring Security** | 6.x (via Boot) | Authentication & authorization |
| **Spring Data MongoDB** | 4.x (via Boot) | Database ORM |
| **Spring AI — Vertex AI Gemini** | 1.0.0-M6 | AI clinical review |
| **Spring Boot Actuator** | 3.4.3 | Health checks & metrics |
| **Spring Boot Mail** | 3.4.3 | Email notifications |
| **Spring Boot Cache** | 3.4.3 | Caffeine-backed caching |
| **Spring Boot WebFlux** | 3.4.3 | Reactive support |
| **JJWT (jjwt-api)** | 0.12.6 | JWT creation & validation |
| **MapStruct** | 1.6.3 | DTO mapping |
| **Resilience4j** | 2.2.0 | Rate limiting & fault tolerance |
| **Caffeine Cache** | 3.1.8 | In-memory caching |
| **Micrometer Prometheus** | Latest | Metrics export |
| **SpringDoc OpenAPI** | 2.8.8 | Swagger UI / API docs |
| **Logstash Logback Encoder** | 8.0 | Structured JSON logging |
| **Apache Commons Lang3** | 3.17.0 | Utility helpers |
| **Lombok** | Latest | Boilerplate reduction |
| **MongoDB Atlas** | Cloud | Primary database |
| **Gradle** | 8.x | Build tool |
| **BCrypt** | Strength 12 | Password hashing |

### 🎨 Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Angular** | 22.0.0 | SPA framework |
| **Angular SSR** | 22.0.1 | Server-side rendering |
| **TypeScript** | ~6.0.2 | Type-safe JavaScript |
| **Tailwind CSS** | 4.1.12 | Utility-first CSS framework |
| **PostCSS** | 8.5.3 | CSS processing |
| **RxJS** | ~7.8.0 | Reactive programming |
| **Express** | 5.1.0 | SSR Node.js server |
| **Heroicons Angular** | 2.1.1 | SVG icon library |
| **Angular CLI** | 22.0.1 | Build & scaffold tooling |
| **Vitest** | 4.0.8 | Unit testing framework |
| **Prettier** | 3.8.1 | Code formatting |
| **npm** | 11.16.0 | Package manager |

---

## 📁 Project Structure

```
feuji_health_connector-main/
│
├── 📂 healthconnector/                   # Spring Boot Backend
│   ├── build.gradle.kts                  # Gradle build config
│   └── src/main/
│       ├── java/com/healthconnector/app/
│       │   ├── HealthconnectorApplication.java   # Entry point
│       │   ├── 📂 config/                # Spring configuration beans
│       │   │   ├── AsyncConfig.java       # @EnableAsync, ThreadPoolExecutor
│       │   │   ├── MongoConfig.java       # @EnableMongoAuditing
│       │   │   └── SecurityConfig.java    # JWT, CORS, CSP, RBAC
│       │   ├── 📂 constants/             # Enum & string constants
│       │   │   ├── AuthorizationStatus.java
│       │   │   ├── UserRole.java
│       │   │   ├── AuditAction.java
│       │   │   ├── ErrorCodes.java
│       │   │   └── NotificationType.java
│       │   ├── 📂 controller/            # REST API endpoints
│       │   │   ├── AuthController.java
│       │   │   ├── AuthorizationController.java
│       │   │   ├── UserController.java
│       │   │   ├── ProviderController.java
│       │   │   ├── PayerController.java
│       │   │   ├── AnalyticsController.java
│       │   │   ├── AuditController.java
│       │   │   ├── ChatController.java
│       │   │   └── NotificationController.java
│       │   ├── 📂 dto/                   # Request & response DTOs
│       │   │   ├── request/
│       │   │   └── response/
│       │   ├── 📂 exception/             # Custom exceptions & handler
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   ├── ApiErrorResponse.java
│       │   │   ├── BusinessException.java
│       │   │   ├── ForbiddenException.java
│       │   │   ├── ResourceNotFoundException.java
│       │   │   └── AESException.java
│       │   ├── 📂 model/                 # MongoDB document models
│       │   │   ├── User.java
│       │   │   ├── AuthorizationRequest.java
│       │   │   ├── AuditLog.java
│       │   │   ├── ChatThread.java
│       │   │   └── Notification.java
│       │   ├── 📂 repository/            # Spring Data MongoDB repos
│       │   ├── 📂 security/              # JWT filter & utilities
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   ├── JwtTokenProvider.java
│       │   │   └── CustomUserDetailsService.java
│       │   ├── 📂 service/               # Business logic
│       │   │   ├── AuthorizationRequestService.java
│       │   │   ├── AuthService.java
│       │   │   ├── GeminiAIService.java
│       │   │   ├── NotificationService.java
│       │   │   ├── AuditService.java
│       │   │   └── FHIRService.java
│       │   └── 📂 utils/                 # Utility classes
│       │       └── AESUtil.java          # AES-256/GCM encrypt/decrypt
│       └── resources/
│           └── application.properties    # All app configuration
│
└── 📂 fe_health_connector/               # Angular Frontend
    ├── package.json
    ├── angular.json
    └── src/
        ├── app/
        │   ├── 📂 core/                  # Guards, interceptors, services
        │   │   ├── auth.guard.ts
        │   │   ├── role.guard.ts
        │   │   └── auth.interceptor.ts   # Adds Bearer token to requests
        │   ├── 📂 features/              # Feature modules by role
        │   │   ├── 📂 auth/
        │   │   │   └── login/            # Login page with animated slides
        │   │   ├── 📂 admin/
        │   │   │   ├── dashboard/        # Platform-wide stats
        │   │   │   ├── providers/        # Provider CRUD management
        │   │   │   ├── payers/           # Payer CRUD management
        │   │   │   ├── analytics/        # Bar charts, donut, AI metrics
        │   │   │   └── audit-logs/       # Immutable security audit trail
        │   │   ├── 📂 provider/
        │   │   │   ├── dashboard/        # Stats + area chart (12 months)
        │   │   │   ├── authorizations/   # Submit & manage requests
        │   │   │   ├── chat/             # Real-time chat interface
        │   │   │   └── profile/          # Profile & password management
        │   │   └── 📂 payer/
        │   │       ├── dashboard/        # Pending requests + stats
        │   │       ├── review/           # Review queue (approve/reject)
        │   │       ├── analytics/        # Approval rate, provider ranking
        │   │       └── profile/          # Profile & password management
        │   └── 📂 shared/
        │       └── components/layout/    # Sidebar, header, layout module
        └── environments/
            ├── environment.ts            # Dev: http://localhost:8080
            └── environment.prod.ts       # Prod API URL
```

---

## 👥 User Roles & Features

### 🔴 SUPER\_ADMIN

The Super Admin has platform-wide visibility and management capabilities.

| Feature | Description |
|---|---|
| **Dashboard** | Total requests, approvals, rejections, AI-reviewed count; active providers & payers; bar chart for authorization status breakdown; approval rate donut chart; AI copilot performance metrics |
| **Manage Providers** | Create, view, update, activate/deactivate provider accounts; reset passwords; assign organization |
| **Manage Payers** | Create, view, update, activate/deactivate payer accounts; reset passwords; assign organization |
| **Analytics** | Real-time KPIs; authorization status pipeline progress bars; AI usage statistics |
| **Audit Logs** | Immutable activity trail; filter by severity (INFO / WARNING / CRITICAL), action type; full pagination; CSV export |

---

### 🩺 PROVIDER

Providers (doctors, hospitals, clinics) submit and track authorization requests.

| Feature | Description |
|---|---|
| **Dashboard** | 12-month activity area chart with smart Y-axis scaling; pending/approved/denied counts; recent authorization list |
| **Authorization Requests** | Create new requests with patient PII, diagnosis codes, procedure codes, clinical notes, attachments; submit for payer review; track status in real-time |
| **AI Pre-Review** | Trigger Gemini AI analysis on a draft authorization to get risk score and recommendation before submission |
| **Provide Additional Info** | Respond to payer's "More Info Required" requests by adding supplemental clinical notes |
| **Chat** | Secure messaging interface with thread management |
| **Profile** | View and edit personal information; change password |

---

### 🏦 PAYER

Payers (insurance companies) review and decide on authorization requests.

| Feature | Description |
|---|---|
| **Dashboard** | Requests assigned to this payer by status; dual-series chart (approved vs denied); quick stats cards |
| **Review Queue** | Full list of assigned requests with inline approve, reject, request-more-info, and reconsider actions; filterable by status |
| **AI Review** | Trigger Gemini AI review from the review queue for a clinical second opinion |
| **Analytics** | Monthly approval/rejection bar chart; decision breakdown donut; top providers by volume; authorization status summary |
| **Profile** | View and edit personal information; change password |

---

## 🔐 Authentication & Authorization Flow

### Login Flow

```
User enters email + password
         │
         ▼
POST /api/auth/login
         │
         ▼
AuthService.authenticate()
  1. Load user by email from MongoDB
  2. Check account active & not locked
  3. Verify BCrypt(input_password) == stored_hash
  4. If failed: increment failed_attempts
     ├── attempts >= 5 → lock account for 30 min
     └── return 401 INVALID_CREDENTIALS
  5. If success: reset failed_attempts, update last_login
  6. Generate JWT token (HS384, 24h expiry)
         │
         ▼
Response: { token, refreshToken, user: { id, email, role, ... } }
         │
         ▼
Angular stores token in localStorage
AuthInterceptor adds "Authorization: Bearer <token>" to every request
```

### JWT Token Structure

```
Header:  { "alg": "HS384" }

Payload: {
  "sub":            "<userId>",         ← MongoDB user._id (primary identity)
  "userId":         "<userId>",
  "email":          "user@example.com",
  "role":           "PAYER",
  "organizationId": "<orgId>",
  "sessionId":      "<uuid>",
  "iat":            <issued_at>,
  "exp":            <expires_at>        ← 24 hours after issue
}

Signature: HMACSHA384(base64(header) + "." + base64(payload), secret_key)
```

### Request Authentication Pipeline

```
Every HTTP Request
      │
      ▼
JwtAuthenticationFilter (extends OncePerRequestFilter)
  1. Extract "Authorization: Bearer <token>" header
  2. If no token → pass to next filter (public endpoints allowed)
  3. Parse JWT → extract userId
  4. Load UserDetails from MongoDB by userId
  5. Build UsernamePasswordAuthenticationToken
  6. Set in SecurityContextHolder
  7. If ExpiredJwtException  → 401 TOKEN_EXPIRED
  8. If MalformedJwtException → 401 TOKEN_INVALID
      │
      ▼
Spring Security Authorization Filter
  - PUBLIC endpoints: /api/auth/**, /swagger-ui/**, /api-docs/** → allow
  - All other endpoints: require Authentication
      │
      ▼
@PreAuthorize("hasRole('PAYER')") / @PreAuthorize("hasRole('PROVIDER')")
  - Method-level RBAC enforced via Spring Security Method Security
  - Role loaded from JWT into GrantedAuthority at filter time
```

### Role-Based Access Control (RBAC)

```
SUPER_ADMIN  →  /api/users/**
                /api/analytics/admin/**
                /api/audit-logs/**

PROVIDER     →  /api/authorizations        (create, read own, submit)
                /api/authorizations/{id}/provide-info
                /api/analytics/provider/**
                /api/chat/**

PAYER        →  /api/authorizations/payer-queue
                /api/authorizations/{id}/approve
                /api/authorizations/{id}/reject
                /api/authorizations/{id}/request-info
                /api/authorizations/{id}/reconsider
                /api/authorizations/{id}/ai-review
                /api/analytics/payer/**
```

---

## 📋 Prior Authorization Lifecycle

```
                     PROVIDER creates
                           │
                           ▼
                        ┌──────┐
                        │DRAFT │  (saved, not yet sent)
                        └──┬───┘
                           │ POST /{id}/submit
                           ▼
                       ┌─────────┐
                       │SUBMITTED│  (payer can see it)
                       └────┬────┘
                            │ POST /{id}/start-review
                            ▼
                      ┌────────────┐
                      │UNDER_REVIEW│  (payer actively reviewing)
                      └─────┬──────┘
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
         ┌────────┐   ┌──────────┐  ┌────────────────┐
         │APPROVED│   │ REJECTED │  │MORE_INFO_REQUIRED│
         └────┬───┘   └────┬─────┘  └───────┬────────┘
              │             │                │
              │   POST /{id}/reconsider       │ Provider POST /{id}/provide-info
              └─────────────┘                │
                      ▲                      │
                      └──────────────────────┘
                     Back to UNDER_REVIEW

Status Transition Rules:
  ✅ PROVIDER   can: submit (DRAFT→SUBMITTED), provide-info (MORE_INFO→UNDER_REVIEW)
  ✅ PAYER      can: start-review, approve, reject, request-info, reconsider
  ✅ approve()  accepts: SUBMITTED, UNDER_REVIEW, MORE_INFO_REQUIRED
  ✅ reconsider() accepts: APPROVED, REJECTED only
  ❌ Only DRAFT can be deleted
```

---

## 🔄 Data Flow

### Creating & Approving an Authorization Request

```
1. PROVIDER fills form in Angular UI
         │
         ▼
2. POST /api/authorizations  (createDraft)
         │
   AuthorizationRequestService.createDraft():
   ├── Validate payer exists and has PAYER role
   ├── AES-256/GCM encrypt sensitive fields:
   │     patientName, patientAddress, patientMobile,
   │     insuranceNumber, memberId, diagnosisDescription,
   │     procedureDescription, clinicalNotes
   ├── Generate reference number: HA-{timestamp}-{counter}
   └── Save to MongoDB (status = DRAFT)
         │
         ▼
3. PROVIDER submits → POST /api/authorizations/{id}/submit
         │
   ├── Status: DRAFT → SUBMITTED
   ├── @Async: AuditService logs AUTHORIZATION_SUBMITTED
   └── @Async: NotificationService emails the PAYER
         │
         ▼
4. PAYER sees request in Review Queue
         │
         ▼
5. POST /api/authorizations/{id}/start-review
         │
   └── Status: SUBMITTED → UNDER_REVIEW
         │
         ▼
6. (Optional) PAYER triggers AI Review
         │
   GeminiAIService:
   ├── Decrypt all patient/clinical fields
   ├── Build structured clinical prompt
   ├── Call Google Vertex AI Gemini 2.5 Flash
   └── Parse: risk score, recommendation, flags → save to MongoDB
         │
         ▼
7. PAYER approves → POST /api/authorizations/{id}/approve
         │
   ├── Status: UNDER_REVIEW → APPROVED
   ├── Set approvedAt, reviewedAt, payerNotes
   ├── Save to MongoDB
   ├── @Async: AuditService logs AUTHORIZATION_APPROVED
   └── @Async: NotificationService emails the PROVIDER
         │
         ▼
8. PROVIDER sees APPROVED status on dashboard
```

### Response Decryption Flow

```
MongoDB stores:
  patient_name = "AES_GCM_BASE64_CIPHERTEXT"

On every read via toResponse():
  safeDecrypt(encryptedValue):
  ├── if null → return null
  ├── AESUtil.decrypt(base64) using AES-256/GCM key
  ├── if decrypt throws → log warning, return raw value (graceful fallback)
  └── return plaintext string

Angular receives:
  patientName = "John Smith"   (decrypted, never encrypted at client)
```

---

## 🛡️ Security Implementation

### 1. 🔑 Password Security
- **Algorithm:** BCrypt with cost factor **12**
- **Storage:** Only hash ever stored — plaintext never persisted
- **Brute-force protection:** Account locked after **5 failed attempts** for **30 minutes**
- **Password expiry:** Configurable (default 90 days)

### 2. 🔒 Patient Data Encryption (AES-256/GCM)

```
Fields encrypted on every AuthorizationRequest:
  ✅ patientName          ✅ patientAddress
  ✅ patientMobile        ✅ insuranceNumber
  ✅ memberId             ✅ diagnosisDescription
  ✅ procedureDescription ✅ clinicalNotes

Algorithm: AES/GCM/NoPadding (256-bit key)
Key:        application.properties → aes.secret-key (base64-encoded 32 bytes)
IV:         Random 12-byte nonce per encryption (prepended to ciphertext)
Auth Tag:   128-bit GCM authentication tag (detects tampering)
```

### 3. 🌐 HTTP Security Headers

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; frame-ancestors 'none'; script-src 'self'` | XSS prevention |
| `X-Frame-Options` | `DENY` | Clickjacking prevention |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer privacy |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing prevention |

### 4. 🔀 CORS Configuration

```
Allowed Origins:  http://localhost:3000, http://localhost:4200,
                  http://localhost:8080, http://localhost:49330
Allowed Methods:  GET, POST, PUT, PATCH, DELETE, OPTIONS
Allowed Headers:  Authorization, Content-Type, X-Requested-With, Accept
Exposed Headers:  Authorization
Credentials:      Allowed
Max Age:          3600 seconds (1 hour preflight cache)
```

### 5. ⚠️ Exception Handling Strategy

All exceptions flow through `GlobalExceptionHandler` (`@RestControllerAdvice`):

```json
{
  "status": 403,
  "errorCode": "FORBIDDEN",
  "message": "You do not have access to this authorization request",
  "path": "/api/authorizations/123/approve",
  "errors": null
}
```

| Exception | HTTP Status | Error Code |
|---|---|---|
| `ResourceNotFoundException` | 404 | `RESOURCE_NOT_FOUND` |
| `ForbiddenException` | 403 | `FORBIDDEN` |
| `BusinessException` | 422 | Custom per rule |
| `AESException` | 500 | `AES_ENCRYPTION_ERROR` |
| `BadCredentialsException` | 401 | `INVALID_CREDENTIALS` |
| `LockedException` | 403 | `ACCOUNT_LOCKED` |
| `AccessDeniedException` | 403 | `FORBIDDEN` |
| `DuplicateKeyException` | 409 | `DUPLICATE_RESOURCE` |
| `Exception` (fallback) | 500 | `INTERNAL_SERVER_ERROR` |
| `Throwable` (fallback) | 500 | `INTERNAL_SERVER_ERROR` |

### 6. 📜 Audit Logging

Every significant action is recorded **asynchronously** with full context:

```
userId, userEmail, userRole
action (enum: LOGIN, AUTHORIZATION_APPROVED, USER_CREATED, ...)
entityType, entityId
description
ipAddress (X-Forwarded-For aware)
device (Desktop / Mobile / Tablet — from User-Agent)
timestamp
success flag
```

---

## 🗄️ Database Design

### MongoDB Collections

#### 👤 `users`
```json
{
  "_id": "ObjectId",
  "first_name": "string",
  "last_name": "string",
  "email": "string (unique index)",
  "mobile": "string",
  "password": "BCrypt hash",
  "role": "SUPER_ADMIN | PROVIDER | PAYER",
  "organization_id": "string",
  "organization_name": "string",
  "status": "ACTIVE | INACTIVE | BLOCKED",
  "failed_attempts": 0,
  "account_locked": false,
  "password_changed": false,
  "last_login": "ISODate",
  "created_at": "ISODate",
  "updated_at": "ISODate",
  "deleted": false,
  "version": 0
}
```

#### 📄 `authorizations`
```json
{
  "_id": "ObjectId",
  "reference_number": "HA-12345-1 (unique)",
  "provider_id": "→ users._id",
  "provider_name": "string",
  "payer_id": "→ users._id",
  "payer_name": "string",
  "organization_id": "string",

  "patient_name": "AES-256/GCM encrypted",
  "patient_dob": "string",
  "patient_address": "AES-256/GCM encrypted",
  "patient_mobile": "AES-256/GCM encrypted",
  "insurance_number": "AES-256/GCM encrypted",
  "member_id": "AES-256/GCM encrypted",

  "primary_diagnosis_code": "ICD-10",
  "diagnosis_description": "AES-256/GCM encrypted",
  "procedure_code": "CPT code",
  "procedure_description": "AES-256/GCM encrypted",
  "clinical_notes": "AES-256/GCM encrypted",
  "requested_service_date": "string",
  "priority": "ROUTINE | URGENT | STAT",
  "place_of_service": "string",

  "status": "DRAFT | SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED | MORE_INFO_REQUIRED",
  "payer_notes": "string",
  "rejection_reason": "string",
  "more_info_notes": "string",

  "ai_score": 0.0,
  "ai_risk_level": "LOW | MEDIUM | HIGH",
  "latest_ai_review_id": "string",
  "fhir_compliant": true,

  "submitted_at": "ISODate",
  "reviewed_at": "ISODate",
  "approved_at": "ISODate",
  "rejected_at": "ISODate",
  "created_at": "ISODate",
  "updated_at": "ISODate",
  "deleted": false,
  "version": 0
}
```

#### 📋 `audit_logs`
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "user_email": "string",
  "user_role": "string",
  "action": "AuditAction enum",
  "entity_type": "string",
  "entity_id": "string",
  "description": "string",
  "ip_address": "string",
  "user_agent": "string",
  "device": "Desktop | Mobile | Tablet",
  "timestamp": "ISODate",
  "success": true
}
```

### Compound Indexes

```
authorizations: { provider_id: 1, status: 1 }        ← provider queue queries
authorizations: { payer_id: 1, status: 1 }            ← payer queue queries
authorizations: { organization_id: 1, created_at: -1 } ← admin analytics
users:          { email: 1 }  (unique)
authorizations: { reference_number: 1 }  (unique)
```

---

## 🤖 AI Integration

### Google Gemini 2.5 Flash (via Vertex AI)

The AI copilot helps payers make faster, evidence-based authorization decisions.

```
Trigger:  POST /api/authorizations/{id}/ai-review  (PAYER role)
              │
              ▼
GeminiAIService.reviewAuthorization()
  1. Fetch authorization from MongoDB
  2. Decrypt all encrypted patient/clinical fields
  3. Build structured clinical prompt:
     ├── Patient age, diagnosis (ICD-10)
     ├── Requested procedure (CPT code + description)
     ├── Clinical notes & medical necessity justification
     └── Insurance/member context
  4. Call Vertex AI: gemini-2.5-flash-lite
     ├── temperature: 0.2  (near-deterministic)
     └── max_output_tokens: 4096
  5. Parse structured response:
     ├── ai_score:      0-100 clinical necessity score
     ├── ai_risk_level: LOW | MEDIUM | HIGH
     ├── recommendation: APPROVE | DENY | REQUEST_MORE_INFO
     └── flags:         list of clinical concerns
  6. Persist ai_score + ai_risk_level to authorization document
  7. Return AIReviewResponse to frontend
```

**Model configuration (`application.properties`):**
```properties
spring.ai.vertex.ai.gemini.chat.options.model=gemini-2.5-flash-lite
spring.ai.vertex.ai.gemini.chat.options.temperature=0.2
spring.ai.vertex.ai.gemini.chat.options.max-output-tokens=4096
```

---

## 📡 REST API Reference

> 📖 **Live Swagger UI:** **[https://fueji-health-connector-springboot-backend.onrender.com/swagger-ui/index.html](https://fueji-health-connector-springboot-backend.onrender.com/swagger-ui/index.html)**  
> 📄 **OpenAPI JSON:** `https://fueji-health-connector-springboot-backend.onrender.com/api-docs`

### 🔑 Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login → returns JWT |
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/refresh` | Public | Refresh JWT token |
| POST | `/api/auth/logout` | Auth | Logout |
| POST | `/api/auth/forgot-password` | Public | Send reset email |
| POST | `/api/auth/reset-password` | Public | Reset with token |

### 📄 Authorization Requests
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/authorizations` | PROVIDER | My submitted requests (paged) |
| GET | `/api/authorizations/payer-queue` | PAYER | Assigned requests (paged) |
| GET | `/api/authorizations/all` | ADMIN | All requests (paged) |
| POST | `/api/authorizations` | PROVIDER | Create draft |
| POST | `/api/authorizations/{id}/submit` | PROVIDER | Submit for review |
| POST | `/api/authorizations/{id}/start-review` | PAYER | Begin reviewing |
| POST | `/api/authorizations/{id}/approve` | PAYER | Approve |
| POST | `/api/authorizations/{id}/reject` | PAYER | Reject with reason |
| POST | `/api/authorizations/{id}/request-info` | PAYER | Request more info |
| POST | `/api/authorizations/{id}/provide-info` | PROVIDER | Provide additional info |
| POST | `/api/authorizations/{id}/reconsider` | PAYER | Reopen for reconsideration |
| POST | `/api/authorizations/{id}/ai-review` | PAYER | Trigger Gemini AI review |
| DELETE | `/api/authorizations/{id}` | PROVIDER | Delete draft |

### 👤 User Management
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/users/providers` | ADMIN | List providers (paged) |
| GET | `/api/users/payers` | ADMIN | List payers (paged) |
| POST | `/api/users/providers` | ADMIN | Create provider |
| POST | `/api/users/payers` | ADMIN | Create payer |
| PUT | `/api/users/{id}` | ADMIN | Update user |
| PATCH | `/api/users/{id}/status` | ADMIN | Activate / deactivate |
| POST | `/api/users/{id}/reset-password` | ADMIN | Admin password reset |
| PUT | `/api/profile` | Auth | Update own profile |
| PUT | `/api/profile/password` | Auth | Change own password |

### 📊 Analytics
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/admin/dashboard` | ADMIN | Platform-wide metrics |
| GET | `/api/analytics/provider/dashboard` | PROVIDER | Provider-specific metrics |
| GET | `/api/analytics/payer/dashboard` | PAYER | Payer-specific metrics |

### 📋 Audit Logs
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/audit-logs` | ADMIN | All logs (paged) |
| GET | `/api/audit-logs/user/{userId}` | ADMIN | Logs by user |
| GET | `/api/audit-logs/entity/{entityId}` | ADMIN | Logs by entity |

### 🔔 Notifications
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Auth | My notifications (paged) |
| PATCH | `/api/notifications/{id}/read` | Auth | Mark as read |

> 📖 **Swagger UI (local):** `http://localhost:8080/swagger-ui.html`  
> 📖 **Swagger UI (live):** **[https://fueji-health-connector-springboot-backend.onrender.com/swagger-ui/index.html](https://fueji-health-connector-springboot-backend.onrender.com/swagger-ui/index.html)**  
> 📄 **OpenAPI JSON:** `http://localhost:8080/api-docs`

---

## ⚙️ Installation & Setup

### Prerequisites

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| Java JDK | 21 | `java -version` |
| Gradle | 8.x (wrapper included) | `./gradlew --version` |
| Node.js | 20.x | `node --version` |
| npm | 11.x | `npm --version` |
| MongoDB Atlas | Cloud account | [atlas.mongodb.com](https://cloud.mongodb.com) |

### 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/feuji-health-connector.git
cd feuji-health-connector
```

### 2. Backend Configuration

Edit `healthconnector/src/main/resources/application.properties`:

```properties
# MongoDB Atlas
spring.data.mongodb.uri=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/health?retryWrites=true&w=majority

# JWT (minimum 64 characters)
jwt.secret=<your-64-char-random-secret>
jwt.expiration-ms=86400000
jwt.refresh-expiration-ms=604800000

# AES key (base64-encoded 32 bytes)
# Generate: openssl rand -base64 32
aes.secret-key=<your-base64-aes-key>

# Super Admin (created on first startup)
superadmin.email=admin@yourorg.com
superadmin.password=Admin@123
superadmin.first-name=Admin
superadmin.last-name=User
superadmin.organization-name=YourOrg Inc.

# Gmail SMTP (use App Password, not account password)
spring.mail.username=your-gmail@gmail.com
spring.mail.password=xxxx-xxxx-xxxx-xxxx

# CORS
app.cors.allowed-origins=http://localhost:4200
```

### 3. Frontend Configuration

Edit `fe_health_connector/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

---

## 🚀 Running the Application

### ▶️ Backend (Spring Boot)

```bash
cd healthconnector

# Recommended — uses Gradle compile settings including -parameters flag
./gradlew bootRun

# Or build a JAR and run it
./gradlew build
java -jar build/libs/healthconnector-1.0.0-SNAPSHOT.jar
```

✅ Backend available at: **http://localhost:8080**  
✅ Swagger UI (local) at: **http://localhost:8080/swagger-ui.html**  
📖 Swagger UI (live) at: **[https://fueji-health-connector-springboot-backend.onrender.com/swagger-ui/index.html](https://fueji-health-connector-springboot-backend.onrender.com/swagger-ui/index.html)**

> ⚠️ **Always use `./gradlew bootRun`** — running directly from an IDE without  
> "Delegate to Gradle" enabled bypasses the `-parameters` compiler flag and  
> causes `@RequestParam` binding failures on some endpoints.

### ▶️ Frontend (Angular)

```bash
cd fe_health_connector

# Install dependencies
npm install

# Start development server
npm start
# or: npx ng serve
```

✅ Frontend available at: **http://localhost:4200**

### 📦 Production Build

**Backend:**
```bash
cd healthconnector
./gradlew build -x test
# JAR → healthconnector/build/libs/healthconnector-1.0.0-SNAPSHOT.jar
```

**Frontend:**
```bash
cd fe_health_connector
npm run build
# Output → fe_health_connector/dist/fe_health_connector/

# Run SSR server
npm run serve:ssr:fe_health_connector
```

---

## 🔧 Environment Configuration

### Key `application.properties` Settings

| Property | Default | Description |
|---|---|---|
| `server.port` | `8080` | API server port |
| `jwt.expiration-ms` | `86400000` | Access token TTL (24 hours) |
| `jwt.refresh-expiration-ms` | `604800000` | Refresh token TTL (7 days) |
| `app.security.max-failed-attempts` | `5` | Lock after N failures |
| `app.security.account-lock-minutes` | `30` | Lock duration |
| `app.security.password-expiry-days` | `90` | Password expiry |
| `server.error.include-message` | `always` | Include error messages in responses |
| `spring.cache.caffeine.spec` | `maximumSize=1000,expireAfterWrite=30m` | Cache settings |
| `logging.level.com.healthconnector` | `DEBUG` | Application log verbosity |
| `app.cors.allowed-origins` | localhost ports | Comma-separated allowed CORS origins |

### Async Thread Pool

| Setting | Value |
|---|---|
| Core Pool Size | 4 |
| Max Pool Size | 16 |
| Queue Capacity | 100 |
| Thread Name Prefix | `Async-` |

---

## 🔑 Default Credentials

> ⚠️ **Change all default passwords immediately after first login in any non-development environment.**

### 🌍 Live Application

> The application is deployed and publicly accessible — no local setup required to try it.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        🚀 LIVE DEPLOYMENT                                │
│                                                                          │
│   🌐  URL  :  https://fueji-health-connector-angular-fron.vercel.app    │
│                                                                          │
│   Direct login page:                                                     │
│   👉  https://fueji-health-connector-angular-fron.vercel.app/login      │
└──────────────────────────────────────────────────────────────────────────┘
```

### 🚨 Built-in Super Admin Login

> Use these credentials to log in for the first time and access all admin features.

```
┌─────────────────────────────────────────────────────┐
│              SUPER ADMIN — DEFAULT LOGIN             │
│                                                     │
│   📧  Email    :  eswar.crypto.tech@gmail.com       │
│   🔑  Password :  Admin@123                         │
│   👤  Role     :  SUPER_ADMIN                       │
│   🏢  Org      :  HealthConnector Inc.              │
└─────────────────────────────────────────────────────┘
```

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **`SUPER_ADMIN`** | **`eswar.crypto.tech@gmail.com`** | **`Admin@123`** | Auto-created on first startup |
| **`PROVIDER`** | Admin-created | Admin-set initial password | User prompted to change on first login |
| **`PAYER`** | Admin-created | Admin-set initial password | User prompted to change on first login |

### How Admin Creates Users

1. Login as **SUPER\_ADMIN** using the credentials above
2. Navigate to **Providers** or **Payers** section
3. Click **Add Provider / Add Payer**
4. Fill in name, email, organization details
5. System generates and emails a temporary password
6. User logs in → must change password (`password_changed = false` flag)

---

## 🔁 Async Processing Design

API responses are fast because side effects run in background threads:

```
Main Request Thread                   Background Pool (max 16 threads)
────────────────────                  ─────────────────────────────────────
approve() saves to DB
     │
     ├──@Async──────────────────►   AuditService.log()
     │                               ├── Writes to audit_logs collection
     │                               └── Swallows all exceptions (non-blocking)
     │
     ├──@Async──────────────────►   NotificationService.send()
     │                               ├── Sends email via Gmail SMTP
     │                               └── Fire-and-forget (no retry)
     │
     ▼
return AuthorizationResponse
(immediate — user gets response without waiting for email delivery)
```

---

## 🧩 Key Design Decisions

| Decision | Rationale |
|---|---|
| **MongoDB over SQL** | Flexible authorization schema; horizontal scaling; native JSON support |
| **`@Version` optimistic locking** | Prevents two payers accidentally overwriting the same authorization |
| **AES-256/GCM with random IV** | Authenticated encryption — prevents both reading and tampering; random IV means identical plaintexts produce different ciphertexts |
| **`safeDecrypt` fallback** | If a field was stored pre-encryption or key was rotated, return raw value instead of crashing |
| **`@Async` audit + notifications** | Main thread only handles core business logic; side effects never block the response |
| **Angular SSR** | Faster first-contentful-paint; SEO-friendly; server-rendered initial HTML |
| **Custom SVG charts** | No Chart.js dependency; full control; smaller bundle; smart Y-axis scaling prevents duplicate labels |
| **Stateless JWT** | No sticky sessions; horizontally scalable; token carries role for instant RBAC |
| **`-parameters` compiler flag** | Spring MVC resolves `@RequestParam` names via reflection — flag ensures correct binding in all environments |

---

## 📦 API Response Envelopes

**Success response:**
```json
{
  "success": true,
  "message": "Approved",
  "data": { "id": "...", "status": "APPROVED", "referenceNumber": "HA-12345-1" }
}
```

**Business error:**
```json
{
  "status": 422,
  "errorCode": "BUSINESS_RULE_VIOLATION",
  "message": "Cannot approve from status: DRAFT",
  "path": "/api/authorizations/123/approve",
  "errors": null
}
```

**Validation error:**
```json
{
  "status": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed",
  "path": "/api/authorizations",
  "errors": [
    { "field": "patientName", "message": "must not be blank" }
  ]
}
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB Atlas Network Access — add your IP or `0.0.0.0/0` for dev
- Verify Java 21: `java -version`
- Port 8080 in use? Change `server.port` in `application.properties`

### 500 error on approve / reject
- Restart backend using `./gradlew bootRun` (not from IDE directly)
- Check logs for the actual exception — `GlobalExceptionHandler` wraps all errors
- Ensure `-parameters` flag is active (it is in `build.gradle.kts`)

### Angular blank page or API 401
- Confirm `environment.ts` has the correct `apiUrl`
- Check browser DevTools → Network tab for failed requests
- Ensure CORS origins in `application.properties` includes `http://localhost:4200`
- Token may be expired — log out and log back in

### Emails not sending
- Use a **Gmail App Password** (not your regular password): [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Check SMTP port 587 is not blocked by firewall
- Look for `NotificationService` errors in backend logs (they are `@Async`, so check thread logs)

### AI review not working
- Set `GOOGLE_CLOUD_PROJECT` env variable to a valid GCP project with Vertex AI API enabled
- Remove the `spring.autoconfigure.exclude` line for VertexAI once credentials are available
- Check service account / ADC credentials are configured on the server

---

## 📄 License

This project is developed by **Feuji Group** for healthcare prior authorization management.

---

*Built with ❤️ using Spring Boot 3 · Angular 22 · MongoDB Atlas · Google Gemini AI*
