# Smart Healthcare Connector Platform (AI + FHIR)

The Smart Healthcare Connector Platform is a bidirectional communication prototype between healthcare providers and insurance payers to streamline prior authorization workflows. It integrates **HL7 FHIR R4 standard structures**, an **AI Copilot engine** for pre-submission checks, and **in-app notification center** overlays for real-time tracking.

---

## Key Features

1. **Provider Portal**: Draft, review with AI, submit, edit, and track prior authorization requests. Attach documents and coordinate with payers.
2. **Payer Portal**: Real-time queue review, request additional details, approve, or reject authorizations.
3. **AI Copilot Panel**: Automated parsing of CPT/ICD-10 clinical codes, checking missing fields, generating a confidence score, and suggesting attachments.
4. **FHIR R4 Integration**: Exposes REST interfaces representing `Patient`, `Coverage`, and `Claim` (Prior Authorization) resources.
5. **Bidirectional Coordination**: Integrated message chat for providers and payers on specific requests.
6. **Notification Center**: Bell icon dropdown showing status updates (e.g. Approved, Info Required) and unread counts.

---

## Technology Stack

* **Backend**: Java 17+, Spring Boot 3.2.5, Spring Data JPA, Spring Security, PostgreSQL Driver.
* **Frontend**: Angular 18+, TypeScript, Custom CSS design framework (dark-mode, glassmorphism).
* **Database**: PostgreSQL 15.
* **Deployment**: Docker, Docker Compose.

---

## Project Structure

```
FHIR-authorization/
├── database/
│   └── schema.sql            # PostgreSQL CREATE schema, inserts, and helper queries
├── backend/
│   ├── src/                  # Spring Boot backend source files
│   ├── pom.xml               # Maven configuration
│   └── Dockerfile            # Multi-stage Java Dockerfile
├── frontend/
│   ├── src/                  # Angular standalone components and HTML/CSS
│   ├── nginx.conf            # Nginx routing configuration
│   ├── package.json          # Angular packages
│   └── Dockerfile            # Multi-stage Node/Nginx Dockerfile
└── docker-compose.yml        # Multi-container orchestration (db, backend, frontend)
```

---

## Setup & Running Locally

### Prerequisites
* Java 17+
* Node.js v18+ & npm
* PostgreSQL (Running on port 5432)

---

### Step 1: Database Setup
1. Create a database named `fhir_auth_db` in PostgreSQL.
2. Execute the DDL script in [schema.sql](file:///E:/AngularProjects/FHIR-authorization/database/schema.sql) to set up tables, constraints, indexes, and initial seed data.

---

### Step 2: Running the Spring Boot Backend
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Build the project using Maven:
   ```bash
   mvn clean compile
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
* The backend API server runs at `http://localhost:8080`.

---

### Step 3: Running the Angular Frontend
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
* The frontend app runs at `http://localhost:4200`.

---

## Deployment with Docker Compose

To deploy the entire stack (PostgreSQL, Spring Boot backend, and Angular frontend) with one command:

1. Ensure Docker Desktop is running.
2. From the root directory, execute:
   ```bash
   docker-compose up --build
   ```
3. Once running:
   * **Angular Web App**: `http://localhost:4200`
   * **Spring Boot API**: `http://localhost:8080`
   * **PostgreSQL Port**: `5432`

---

## Developer Testing Presets

For testing, use the login presets on the Sign In page:
* **Healthcare Provider**:
  * Email: `provider@connector.com`
  * Password: `password`
* **Insurance Payer (Reviewer)**:
  * Email: `payer@connector.com`
  * Password: `password`

---

## API Documentation

All APIs are mounted under `/api`.

### 1. Authentication
* **POST `/api/auth/login`**: Sign in and fetch role context.
  * *Request Body*:
    ```json
    {
      "email": "provider@connector.com",
      "password": "password"
    }
    ```
  * *Response (200 OK)*:
    ```json
    {
      "id": 1,
      "name": "Dr. Sarah Jenkins",
      "email": "provider@connector.com",
      "role": "ROLE_PROVIDER"
    }
    ```

### 2. Prior Authorizations
* **GET `/api/authorization`**: Get all requests (excluding drafts).
* **GET `/api/authorization/{id}`**: Get specific authorization details, timeline history, and comments.
* **POST `/api/authorization`**: Create a new authorization request.
  * *Request Body*:
    ```json
    {
      "patientId": 1,
      "coverageId": 1,
      "diagnosisCode": "M17.11",
      "diagnosisDescription": "Osteoarthritis, right knee",
      "treatmentCode": "27447",
      "treatmentDescription": "Total knee replacement",
      "notes": "Severe knee arthritis. Failed 6 weeks of PT.",
      "status": "SUBMITTED"
    }
    ```
* **PUT `/api/authorization/{id}`**: Update and resubmit an authorization request.

### 3. Provider APIs
* **GET `/api/provider/requests`**: Load all requests submitted by a specific provider.
  * *Query Params*: `providerId` (Defaults to 1).

### 4. Payer Decision APIs
* **GET `/api/payer/requests`**: Load all submitted requests pending reviewer evaluation.
* **POST `/api/payer/approve`**: Approve request.
  * *Request Body*:
    ```json
    {
      "requestId": 1,
      "note": "Approved based on clinical evidence.",
      "userId": 2
    }
    ```
* **POST `/api/payer/reject`**: Reject request.
* **POST `/api/payer/request-info`**: Request corrections. Changes status to `INFO_REQUIRED` and posts correction text to the comment thread.
  * *Request Body*:
    ```json
    {
      "requestId": 1,
      "note": "Please attach documented PT logs.",
      "userId": 2
    }
    ```

### 5. AI Copilot
* **POST `/api/ai/review`**: Evaluate draft request data.
  * *Request Body*: Same as `POST /api/authorization`.
  * *Response (200 OK)*:
    ```json
    {
      "confidenceScore": 92.50,
      "statusValidation": true,
      "issues": [],
      "recommendations": [
        "Attach relevant radiological imaging reports (MRI/X-ray).",
        "Attach physical therapy logs."
      ]
    }
    ```

### 6. Bidirectional Communication Chat
* **GET `/api/authorization/{id}/messages`**: Retrieve comments thread.
* **POST `/api/authorization/{id}/messages`**: Add a comment to the thread.
  * *Query Params*: `senderId`.
  * *Request Body*: `{"message": "Hello Payer"}`.

### 7. Notifications
* **GET `/api/notifications`**: Get list of notifications and unread counts.
  * *Query Params*: `userId`.
* **POST `/api/notifications/read-all`**: Clear all notifications.
  * *Query Params*: `userId`.
