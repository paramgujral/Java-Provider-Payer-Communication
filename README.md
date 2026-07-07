# Smart Healthcare Connector Platform — Java (Spring Boot) Edition

Same platform as the Node.js prototype, rebuilt with a **Java / Spring Boot**
backend. The frontend (HTML/CSS/JS) and the REST API contract are unchanged,
so the UI works identically.

Workflow: `Login → Fill Form → AI Copilot Validation → Submission → Push to Payer → Accept/Reject → Notification`

## Tech stack

- **Backend**: Java 17, Spring Boot 3.2 (`spring-boot-starter-web`), Maven
- **Storage**: simple JSON-file "database" (`data/db.json`) via Jackson —
  no external DB required to run the demo. Swap `DataStore` for a real
  JPA repository (Postgres/Mongo) in production.
- **Frontend**: plain HTML/CSS/JS served as Spring Boot static resources
  from `src/main/resources/static` — identical files to the Node version.
- **AI Copilot**: `AiCopilotService.reviewRequest()` — rule-based validation
  (CPT/ICD-10 format checks, urgent-care justification, etc.), written as a
  drop-in method so it can be swapped for a real LLM call later without
  touching any other code.

## Project structure

```
healthcare-connector-java/
├── pom.xml
├── data/
│   └── db.json                          # seed users, persisted requests/notifications
└── src/main/
    ├── java/com/healthcareconnector/
    │   ├── HealthcareConnectorApplication.java
    │   ├── model/                        # User, AuthorizationRequest, HistoryEntry, AIReview, Notification, Database
    │   ├── dto/                          # LoginRequest, DecisionRequest, NewRequestDTO
    │   ├── service/                      # DataStore (persistence), AiCopilotService (validation)
    │   └── controller/                   # AuthController, RequestController, NotificationController
    └── resources/
        ├── application.properties        # server.port=4000
        └── static/                       # index.html, style.css, app.js (same UI as Node version)
```

## API endpoints (identical to the Node.js version)

| Method | Path                              | Purpose                          |
|--------|------------------------------------|-----------------------------------|
| POST   | `/api/login`                       | Authenticate                     |
| POST   | `/api/requests`                    | Create a Draft request           |
| POST   | `/api/requests/{id}/validate`      | Run AI Copilot review            |
| POST   | `/api/requests/{id}/submit`        | Submit Draft → Pending           |
| GET    | `/api/requests?role=&username=`    | List requests (filtered)         |
| POST   | `/api/requests/{id}/decision`      | Payer Accept/Reject              |
| GET    | `/api/notifications?username=`     | List notifications               |
| POST   | `/api/notifications/{id}/read`     | Mark notification as read        |

## Getting started

Requires **JDK 17+** and **Maven** (or use the included wrapper if you add one).

```bash
mvn spring-boot:run
```

or build a runnable jar:

```bash
mvn clean package
java -jar target/healthcare-connector-1.0.0.jar
```

Then open **http://localhost:4000**.

> **Note on this environment**: the sandbox this was built in has no internet
> access, so Maven couldn't download Spring Boot dependencies to run a live
> build/test here. Every file has been written carefully and reviewed line
> by line to match Spring Boot 3.2 / Java 17 conventions, but please run
> `mvn clean package` on your own machine as a first step and let me know if
> you hit any compile errors — happy to fix immediately.

### Demo accounts

| Role     | Username   | Password    |
|----------|------------|-------------|
| Provider | provider1  | provider123 |
| Payer    | payer1     | payer123    |

## Extending this prototype

- **Real AI Copilot**: replace the body of `AiCopilotService.reviewRequest()`
  with a call to the Anthropic API (Claude), passing the request as JSON and
  parsing a structured response back into an `AIReview`.
- **Real FHIR integration**: map `AuthorizationRequest` to FHIR `Claim` /
  `ClaimResponse` / `Communication` resources and call a FHIR server (HAPI
  FHIR, Medplum) from a new service class instead of writing to `db.json`.
- **Persistence**: replace `DataStore` with Spring Data JPA repositories
  backed by Postgres/MySQL for real concurrent multi-user use.
- **Auth**: add Spring Security + OAuth2/SMART-on-FHIR instead of the
  plaintext demo credential check.
