# AuthBridge

## 🎥 Demo video

https://github.com/jnikshep13/Feuji_java_full_stack_project/raw/master/Harsha%20Vardhini%20Agatamudi/authbridge/AuthBridgeDemo.mp4

> If the player above does not load, click **[AuthBridgeDemo.mp4](./AuthBridgeDemo.mp4)** in this folder — GitHub plays it inline.


**AI-powered prior authorization platform connecting healthcare providers and payers.**

AuthBridge streamlines prior-authorization and claims-related communication between hospitals (providers) and insurers (payers). An AI copilot reviews every request *before* it's submitted — flagging missing data, format errors, and policy gaps and predicting approval likelihood — while a workflow engine tracks each request from draft to decision with a full audit trail and real-time notifications.

> 📐 Full system design — architecture diagrams, DB/ER, API contracts, AI/LLM design, security, deployment, and the MVP→production roadmap — is in **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

## What's in here

```
authbridge/
├── frontend/     Next.js 14 + React + TypeScript + Tailwind  (provider & payer portals + AI copilot)
├── backend/      Spring Boot 3.3 / Java 21  (REST API, workflow engine, copilot service)
├── ARCHITECTURE.md
└── docker-compose.yml
```

The **frontend runs fully standalone** on its own in-memory API routes (no database, no API keys) so you can explore the whole platform immediately. The **Spring Boot backend** implements the identical `/api/v1` contract for the production path; point the frontend at it with `BACKEND_URL`.

---

## Run the website (fastest path)

```bash
cd frontend
npm install
npm run dev          # → http://localhost:3000
```

Open http://localhost:3000, click **Launch demo**, and pick a role:

- **Provider** → create requests and watch the AI copilot review them live; submit, track, resubmit.
- **Payer** → work the review queue; approve, request more info, or deny with notes.

Both portals share live data, so a request you submit as a provider appears in the payer queue, and a payer decision shows up as a provider notification in real time.

### Run the full stack (frontend + Java backend + Postgres)

```bash
docker compose up --build
# frontend → http://localhost:3000   backend → http://localhost:8080
```

### Run the backend on its own

```bash
cd backend
mvn spring-boot:run            # dev profile: in-memory H2 + seeded data on :8080
# try it:
curl localhost:8080/api/v1/requests
```

---

## Key features (all implemented in the demo)

| Area | What it does |
|---|---|
| **Provider portal** | Create/submit authorization requests, attach documents, track status & history, resubmit after info requests/denials. |
| **Payer portal** | Review queue, read submissions + documents, approve / request-info / deny with structured notes, reports & compliance view. |
| **AI Copilot** | Live pre-submission review: completeness %, approval-likelihood %, prioritized actionable issues, suggested clinical narrative. Submission is blocked while blocking issues remain. |
| **Workflow engine** | Enforced state machine (DRAFT→SUBMITTED→IN_REVIEW→APPROVED/DENIED/INFO_REQUESTED→RESUBMITTED), append-only audit timeline on every request. |
| **Notifications** | In-app notification center with unread badges and live polling; email/SMS fan-out hooks on the backend. |

## AI Copilot — rules today, Claude tomorrow

The copilot ships with a deterministic **rules engine** (in both `frontend/lib/copilot.ts` and `backend/.../copilot/CopilotService.java`) so the platform works with zero API keys. It returns a structured `CopilotReview`. To upgrade to a **Claude-backed** reviewer, set `ANTHROPIC_API_KEY` and implement the `reviewWithLLM` path documented in those files — the response shape is identical, so the UI is unchanged. See [ARCHITECTURE.md §6](ARCHITECTURE.md).

---

## Tech stack

**Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
**Backend:** Spring Boot 3.3, Java 21, Spring Web, Spring Data JPA, Bean Validation, Actuator; H2 (dev) / PostgreSQL (prod).
**Infra:** Docker, Docker Compose, Kubernetes-ready (see ARCHITECTURE.md §9).

> ⚠️ Demonstration platform with **synthetic data only**. Production use requires the HIPAA controls, BAAs, and security assessment described in ARCHITECTURE.md §8.
