# <img src="frontend/public/Feuji%20Logo_orange-01.png" alt="Feuji Logo" height="38" valign="middle"> Smart Healthcare Connector

An AI-powered, FHIR-compliant healthcare prior-authorization communication platform designed to connect **Healthcare Providers** (hospitals/clinics) and **Insurance Payers** (insurance companies) seamlessly.

This platform leverages modern technologies to prevent incomplete or incorrect authorization requests from reaching the payer by using real-time AI-assisted validation before submission.

---

## 📂 Project Documentation

Detailed design, planning, tracking, and walkthrough documents are stored inside the [docs/](docs) folder:

* 📋 **[Software Requirements Specification & Technical Design Document (Implementation Plan)](docs/implementation_plan.md)**: Full project specifications, business rules, API documentation, system workflows, database models, and sprint layouts.
* 📝 **[Task Checklist](docs/task.md)**: Step-by-step feature checklist organized by sprints.
* 🚀 **[Completed Work Walkthrough](docs/walkthrough.md)**: Comprehensive summary of all implemented code modifications across the frontend and backend.

---

## 🛠️ Technology Stack

* **Frontend**: Angular 21, Angular Material, TypeScript, Vanilla CSS (custom Outfit & Inter theme).
* **Backend**: Spring Boot 3.5.16, Java 21, Spring Security, Spring Data JPA.
* **Database**: PostgreSQL (NeonDB serverless database).
* **Interoperability**: HAPI FHIR R4 (structures and base packages).
* **AI Copilot**: Google Gemini API (structured JSON clinical schema validations).
* **Notifications**: Spring Mail (Gmail SMTP) for OTP & status notifications, in-app notification engine with polling.
* **Caching & Rate-Limiting**: Upstash Redis REST API.
* **Cloud Storage**: Cloudinary secure upload operations.

---

## 🎯 Key Core Modules

### 1. Provider Portal
* **Dashboard Stats**: Request counts grouped by status (Approved, Rejected, Pending, Info Requested).
* **Multi-step Stepper Form**: Dynamic fields for Patient Info, Insurance Details, Diagnoses, Procedures, and Notes.
* **AI Copilot Panel**: Right-hand interactive panel offering real-time completeness checking, quality scores, suggestions, and auto-corrections.
* **Local Attachment Uploads**: Refactored to upload files directly to Cloudinary.

### 2. Payer Portal
* **Review Queue**: Pending queue showing list of authorization requests categorized by urgency.
* **Adjudication Dashboard**: Single-page review panel displaying AI summaries, patient info, and attachments.
* **Action Gateways**: Actionable triggers to **Approve**, **Reject**, or **Request Information** with mandatory remarks.

### 3. Cross-Cutting Services
* **FHIR Generator**: Backend converter constructing standard FHIR bundles (Patient, Coverage, Practitioner, Claim).
* **Dual Channel Notifications**: Simultaneous in-app bell notification polling and SMTP HTML email alerts on status changes.
* **Database Seeding**: Automatic seeding of default credentials and demo authorization requests on database initialization.

---

## 🏃‍♂️ Quick Start & Running Locally

### Prerequisites
* Java 21 SDK
* Node.js (v18+ or v20+)
* Maven 3.9+

### Environment Configuration

Configure application secrets and system parameters before running the applications:

#### Backend Settings
1. Navigate to the `backend/` directory and locate the [.env.example](backend/.env.example) file.
2. Copy it to create your local `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
3. Set your Google Gemini API key, database URL, Upstash Redis keys, Cloudinary credentials, and Gmail SMTP credentials in `backend/.env`.

#### Frontend Settings
1. Navigate to the `frontend/` directory and locate the [.env.example](frontend/.env.example) file.
2. Copy it to create your local `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
3. Adjust the backend API endpoint (`API_BASE_URL`) if running on custom ports.


### 1. Running the Backend
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Configure credentials or view default variables inside `src/main/resources/application.properties`.
3. Compile and launch:
   ```bash
   mvn spring-boot:run
   ```
4. The API server runs at `http://localhost:8080`.

### 2. Running the Frontend
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Start the local dev server:
   ```bash
   npm run start
   ```
4. Open your browser and navigate to `http://localhost:4200`.

### 3. Demo Credentials (Auto-seeded)
* **Provider Login**: `provider@feuji.com` / `password123`
* **Payer Login**: `payer@feuji.com` / `password123`
