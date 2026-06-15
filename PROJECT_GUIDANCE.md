# Smart Healthcare Connector Platform

Welcome to the **Smart Healthcare Connector Platform**! This project provides a seamless, bidirectional communication platform between Healthcare Providers and Payers. It replaces traditional one-way communication with an intelligent workflow powered by AI and FHIR standards.

## Project Structure

The repository is divided into two main modules:

1. **`Healthcare-project/` (Backend)**
   - **Framework**: Java 17+ with Spring Boot
   - **Database**: MongoDB
   - **Features**: REST APIs for Provider/Payer modules, Gemini AI Copilot integration (`AiCopilotServiceImpl`), FHIR-aligned data models (`AuthorizationRequest`), and a notification engine.
   
2. **`healthcare-frontend/` (Frontend)**
   - **Framework**: Angular 18
   - **Features**: Provider Dashboard, Payer Dashboard, dynamic AI Copilot review modals, and status tracking interface.

---

## Prerequisites

Before running the application, ensure you have the following installed on your system:
- **Java Development Kit (JDK) 17** or higher
- **Maven** (or use the included `mvnw` wrapper)
- **Node.js** (v18+ recommended) and **npm**
- **Angular CLI** (`npm install -g @angular/cli`)
- **MongoDB** running locally on default port `27017`

---

## Setup Instructions

### 1. Database Setup
Start your local MongoDB instance. The backend is configured to automatically connect to `mongodb://localhost:27017/healthcare_db` and will create the necessary collections on startup.

### 2. Backend Setup (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd Healthcare-project
   ```
2. Verify your Gemini API key in `src/main/resources/application.yaml`:
   ```yaml
   gemini:
     api:
       key: "YOUR_GEMINI_API_KEY"
       url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
   ```
3. Build and run the Spring Boot application:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   *The backend server will start on `http://localhost:8080`.*

### 3. Frontend Setup (Angular)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd healthcare-frontend
   ```
2. Install the necessary Node dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   ng serve
   ```
   *The frontend application will be available at `http://localhost:4200`.*

---

## Application Workflow Guide

Once both the backend and frontend servers are running, you can test the entire secure bidirectional workflow:

### Step 1: Organization Registration & Admin Approval
- A new hospital or insurance company registers via the public signup page as either a **Provider** or a **Payer**.
- For security and HIPAA compliance, their organization account is created in a **Pending Approval** state (`active = false`).
- An automatic email is sent to the System Administrator alerting them of the new registration.
- The **System Administrator** logs into the Admin Dashboard (`/admin/dashboard`), reviews the organization's details, and clicks "Activate".
- An approval email is automatically sent to the newly activated organization notifying them they can now log in.
- *Note: The first user to register for an organization is automatically assigned the `orgAdmin` role.*

### Step 2: Organization Staff Management
- Once activated, the main Organization Administrator (`orgAdmin`) logs in.
- They navigate to the **Staff Management** dashboard.
- The Admin can invite new staff members (e.g., billing specialists, reviewers) by entering their name and email.
- The backend strictly enforces that any newly invited staff member inherits the same `organizationId` and `role` as the Admin, preventing security breaches.
- New staff members receive an email invitation to set up their password.

### Step 3: Provider-Payer Network Credentialing
- Before any business can be conducted, a Provider must explicitly contract with a Payer.
- The **Provider** logs in and navigates to the **Network** dashboard, selects a Payer, and clicks **Request Affiliation**.
- The **Payer** logs in, navigates to the **Provider Network** dashboard, reviews the incoming requests, and clicks **Approve**. 
- *Note: Providers are strictly blocked by the backend from sending Authorization Requests or Messages to Payers they are not affiliated with.*

### Step 4: Real-Time Encrypted Communication (WebSockets)
- Once an affiliation is `APPROVED`, both organizations unlock the **Messages** tab in their Network/Credentialing dashboards.
- The backend establishes a secure **Spring WebSocket (STOMP)** connection, authenticated by extracting the user's JWT token from the STOMP `CONNECT` frame via a custom Channel Interceptor.
- Providers and Payers can instantly chat about contracts or rates in true real-time. Messages are broadcasted to `/topic/chat/{affiliationId}` and instantly rendered on the frontend using Angular's `RxStomp` without needing to refresh the page.

### Step 5: Provider Creates an Authorization Request
- The **Provider** navigates to the **New Request** section.
- They fill out the FHIR-aligned patient and clinical details (e.g., Diagnosis codes, Procedure codes).

### Step 6: AI Copilot Review & Backend Fallback
- Before final submission, the Provider clicks **Review & Submit with AI Copilot**.
- The frontend calls the Spring Boot backend, which sends the request to the **Gemini API**.
- The AI acts as a medical billing expert, reviewing the payload for missing CPT codes, incompatible diagnoses, or missing patient data.
- **Backend Fallback Validation:** If the Gemini API fails (e.g., due to rate limits), the backend will automatically step in and strictly validate the submitted diagnosis and procedure codes against its internal reference database, flagging any unrecognized codes.
- The Provider can fix any suggested issues before finally submitting the request to the Payer.

### Step 7: Payer Adjudication
- The **Payer** navigates to the **Review Queue** to view incoming requests from their affiliated Providers.
- The Payer can view the AI's recommendations regarding medical necessity, policy alignment, and potential fraud.
- The Payer manually adjudicates the claim by clicking **Approve** or **Reject**.

### Step 8: Status Tracking & Notifications
- The backend generates a status update via the Notification Service.
- The Provider's dashboard is automatically updated to reflect the `APPROVED` or `REJECTED` status, completing the secure bidirectional communication loop.
