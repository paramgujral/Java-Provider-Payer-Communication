# Feuji Healthcare Connector Platform

## Overview

The Healthcare Connector Platform is a microservices-based application developed to streamline communication between healthcare providers and payers during the authorization process.

Traditional authorization workflows often involve incomplete or inaccurate requests, resulting in repeated communication between providers and payers. This solution introduces an **AI Copilot powered by Google Gemini 2.5 Flash**, which reviews authorization requests before submission and provides intelligent recommendations to help providers identify missing information, improve clinical documentation, and improve the quality of authorization requests before they reach the payer.

The platform also validates user input by enforcing standardized formats for Provider/Hospital Name, Patient Name, Insurance ID, Diagnosis Code, Procedure Code, and Clinical Notes, ensuring that only well-formed authorization requests are submitted.

The application consists of three Spring Boot microservices and a React-based frontend.

---

# Repository Structure

```text
Feuji_HealthCare
│
├── provider-service
│   └── Handles provider operations, AI review integration, authorization request management and notifications
│
├── payer-service
│   └── Handles authorization review, approval, rejection and provider status updates
│
├── ai-service
│   └── Integrates with Google Gemini AI for intelligent authorization request review
│
└── UI
    └── healthcare-ui
        └── React frontend application
```

---

# Technology Stack

## Backend

* Java 21
* Spring Boot
* Spring Data JPA
* MySQL
* REST APIs
* Maven

## Frontend

* React
* Bootstrap

## AI

* Google Gemini 2.5 Flash API
* Prompt Engineering
* REST Integration

## Database

* MySQL

---

# Microservices

## Provider Service

**Port:** `8081`

### Responsibilities

* Create authorization requests
* Update authorization requests
* Capture Provider/Hospital information
* Integrate with AI Copilot
* Submit authorization requests to the Payer Service
* Track authorization status
* Display payer notifications

---

## AI Service

**Port:** `8082`

### Responsibilities

* Integrates with Google Gemini AI
* Reviews authorization requests before submission
* Identifies missing mandatory information
* Reviews clinical documentation
* Generates intelligent recommendations
* Determines whether the authorization request is ready for submission

The AI Service builds a structured prompt using the authorization request details and sends it to the **Google Gemini 2.5 Flash API**. Gemini analyzes the request context and returns intelligent recommendations instead of relying on predefined or hardcoded validation rules.

### Configuration

Add your generated Gemini API Key to the `application.properties` file.

```properties
gemini.api.key=YOUR_API_KEY
```

Generate an API Key using Google AI Studio:

https://aistudio.google.com/app/apikey

---

## Payer Service

**Port:** `8083`

### Responsibilities

* Receive authorization requests from the Provider Service
* Display complete authorization details including:

  * Provider/Hospital Name
  * Patient Name
  * Insurance ID
  * Diagnosis Code
  * Procedure Code
  * Clinical Notes
* Review authorization requests
* Approve authorization requests
* Reject authorization requests with review comments
* Notify the Provider Service about authorization status updates

---

# Input Validation

Before an authorization request is created or updated, the application validates user input.

| Field                    | Validation                           |
| ------------------------ | ------------------------------------ |
| Provider / Hospital Name | Alphabets and spaces only            |
| Patient Name             | Alphabets and spaces only            |
| Insurance ID             | Format: **IN1234**                   |
| Diagnosis Code           | Format: **DC123**                    |
| Procedure Code           | Format: **PC123**                    |
| Clinical Notes           | Recommended minimum of 30 characters |

These validations improve data quality and reduce invalid authorization requests reaching the payer.

---

# Application Workflow

## Provider Workflow

1. Create an Authorization Request.
2. Enter Provider/Hospital information and patient details.
3. Review the request using the AI Copilot.
4. View AI-generated recommendations.
5. Update the request if improvements are suggested.
6. Submit the authorization request to the Payer Service.
7. Track authorization status.
8. Receive notifications when the payer reviews the request.

---

## AI Copilot Workflow

```text
Provider UI
      │
      ▼
Provider Service
      │
      ▼
AI Service
      │
      ▼
Google Gemini 2.5 Flash
      │
      ▼
AI Recommendation
      │
      ▼
Provider Service
      │
      ▼
Provider Dashboard
```

### AI Review Process

1. The provider creates an authorization request.
2. The provider clicks **AI Review**.
3. The Provider Service sends the authorization request to the AI Service.
4. The AI Service constructs a structured prompt using the request details.
5. The prompt is sent to Google Gemini 2.5 Flash.
6. Gemini analyzes the request and generates intelligent recommendations.
7. The AI Service returns the recommendations to the Provider Service.
8. The Provider Dashboard displays the AI recommendations for review.
9. The provider updates the request if necessary before submitting it to the payer.

---

## Payer Workflow

1. Receive submitted authorization requests.
2. Review complete request details, including:

   * Provider/Hospital Name
   * Patient Name
   * Insurance ID
   * Diagnosis Code
   * Procedure Code
   * Clinical Notes
3. Approve the request

**OR**

4. Reject the request with review comments.

---

## Notification Workflow

Whenever the authorization status changes, the Provider Service automatically generates a notification.

Supported status updates include:

* UNDER_REVIEW
* APPROVED
* REJECTED

These notifications are displayed on the Provider Dashboard, allowing providers to monitor the authorization lifecycle without directly contacting the payer.

---

# Request Lifecycle

## Successful Authorization Flow

```text
Provider Creates Request
            │
            ▼
         DRAFT
            │
            ▼
     AI REVIEW (Google Gemini)
            │
            ▼
 Provider Updates (if required)
            │
            ▼
       SUBMITTED
            │
            ▼
     UNDER_REVIEW
            │
            ▼
        APPROVED
            │
            ▼
 Provider Receives Notification
```

---

## Rejected Authorization Flow

```text
Provider Creates Request
            │
            ▼
         DRAFT
            │
            ▼
     AI REVIEW (Google Gemini)
            │
            ▼
       SUBMITTED
            │
            ▼
     UNDER_REVIEW
            │
            ▼
        REJECTED
            │
            ▼
 Provider Receives Notification
            │
            ▼
      Edit Authorization Request
            │
            ▼
     AI REVIEW (Google Gemini)
            │
            ▼
        RESUBMIT
```

---

# Service URLs

| Service              | URL                     |
| -------------------- | ----------------------- |
| **Provider Service** | `http://localhost:8081` |
| **AI Service**       | `http://localhost:8082` |
| **Payer Service**    | `http://localhost:8083` |
| **React Frontend**   | `http://localhost:5173` |

---

# Database Setup

Create the required MySQL databases before starting the application.

```sql
CREATE DATABASE provider_db;

CREATE DATABASE payer_db;
```

Update the MySQL username, password, and database configuration in each service's `application.properties` file if required.

Additionally, configure the Google Gemini API Key in the AI Service.

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/provider_db
spring.datasource.username=root
spring.datasource.password=your_password

gemini.api.key=YOUR_API_KEY
```

> **Note:** Generate your Gemini API Key from **Google AI Studio** and configure it in the AI Service before starting the application.

---

# Running the Application

## Step 1 - Start MySQL

Ensure that MySQL is running and create the required databases.

```sql
CREATE DATABASE provider_db;

CREATE DATABASE payer_db;
```

Update the MySQL configuration in each service's `application.properties` file if required.

For the AI Service, also configure your Google Gemini API Key.

```properties
gemini.api.key=YOUR_API_KEY
```

---

## Step 2 - Start Backend Services

Start the services in the following order.

### AI Service

```bash
cd ai-service

mvn spring-boot:run
```

Runs on:

```text
http://localhost:8082
```

---

### Payer Service

```bash
cd payer-service

mvn spring-boot:run
```

Runs on:

```text
http://localhost:8083
```

---

### Provider Service

```bash
cd provider-service

mvn spring-boot:run
```

Runs on:

```text
http://localhost:8081
```

---

## Step 3 - Start React Frontend

```bash
cd UI/healthcare-ui

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# API Reference

## 1. Create Authorization Request

### Request

```http
POST http://localhost:8081/provider/requests
```

```json
{
  "providerName": "Apollo Hospitals",
  "patientName": "John Smith",
  "insuranceId": "IN1234",
  "diagnosisCode": "DC101",
  "procedureCode": "PC201",
  "clinicalNotes": "Patient has severe lower back pain for three weeks. Conservative treatment has failed. MRI requested to evaluate lumbar disc pathology."
}
```

### Response

```json
{
  "id": 1,
  "providerName": "Apollo Hospitals",
  "patientName": "John Smith",
  "insuranceId": "IN1234",
  "diagnosisCode": "DC101",
  "procedureCode": "PC201",
  "clinicalNotes": "Patient has severe lower back pain for three weeks. Conservative treatment has failed. MRI requested to evaluate lumbar disc pathology.",
  "status": "DRAFT",
  "aiRecommendation": null
}
```

---

## 2. Review Authorization Request Using AI Copilot

### Request

```http
POST http://localhost:8081/provider/requests/1/review
```

### Sample Response

```json
{
  "id": 1,
  "status": "DRAFT",
  "aiRecommendation": "Summary:\nThe authorization request is complete and contains the required patient, provider and insurance information.\n\nMissing Information:\nNone\n\nClinical Notes Review:\nThe clinical notes adequately describe the patient's condition and support medical necessity.\n\nRecommendations:\n• Verify the authorization details before submission.\n• Ensure supporting clinical documents are attached if required.\n\nReady For Submission:\nYES"
}
```

> **Note:** Since recommendations are generated by Google Gemini, the response varies depending on the authorization request.

---

## 3. Update Authorization Request

### Request

```http
PUT http://localhost:8081/provider/requests/1
```

```json
{
  "providerName": "Apollo Hospitals",
  "patientName": "John Smith",
  "insuranceId": "IN1234",
  "diagnosisCode": "DC101",
  "procedureCode": "PC201",
  "clinicalNotes": "Patient has severe lower back pain for three weeks. Conservative treatment has failed. MRI requested to evaluate lumbar disc pathology."
}
```

### Response

```json
{
  "id": 1,
  "status": "DRAFT"
}
```

---

## 4. Submit Authorization Request

### Request

```http
POST http://localhost:8081/provider/requests/1/submit
```

### Response

The authorization request is forwarded to the **Payer Service**, and the request status changes to **UNDER_REVIEW**.

---

## 5. Get All Provider Requests

### Request

```http
GET http://localhost:8081/provider/requests
```

Returns all authorization requests along with AI recommendations and current authorization status.

---

## 6. Get Notifications

### Request

```http
GET http://localhost:8081/provider/notifications
```

### Sample Response

```json
[
  {
    "id": 1,
    "requestId": 1,
    "message": "Request APPROVED : Authorization Approved"
  }
]
```

---

## 7. Get Payer Requests

### Request

```http
GET http://localhost:8083/payer/requests
```

Each request contains:

* Provider/Hospital Name
* Patient Name
* Insurance ID
* Diagnosis Code
* Procedure Code
* Clinical Notes
* Status
* Review Comments

---

## 8. Approve Authorization Request

### Request

```http
PUT http://localhost:8083/payer/requests/1/approve
```

### Response

```json
{
  "status": "APPROVED"
}
```

---

## 9. Reject Authorization Request

### Request

```http
PUT http://localhost:8083/payer/requests/1/reject
```

```json
{
  "comments": "Additional supporting clinical documentation is required."
}
```

### Response

```json
{
  "status": "REJECTED",
  "comments": "Additional supporting clinical documentation is required."
}
```

---

# Validation Scenarios

## Scenario 1 – Successful Approval Flow

1. Create an authorization request using valid Provider, Patient, Insurance, Diagnosis and Procedure details.
2. Verify the application enforces the required input formats.
3. Click **AI Review**.
4. Verify that Google Gemini analyzes the authorization request and generates recommendations.
5. Update the request if improvements are suggested.
6. Submit the authorization request.
7. Verify the request status changes to **UNDER_REVIEW**.
8. Open the Payer Dashboard.
9. Verify all authorization details are displayed.
10. Approve the request.
11. Verify the Provider Dashboard displays **APPROVED**.
12. Verify a notification is generated.

---

## Scenario 2 – Rejection Flow

1. Create an authorization request.
2. Review the request using the AI Copilot.
3. Submit the authorization request.
4. Open the Payer Dashboard.
5. Review the authorization details.
6. Reject the request with review comments.
7. Verify the Provider Dashboard displays **REJECTED**.
8. Verify a notification is generated.
9. Edit the authorization request.
10. Run AI Review again.
11. Resubmit the authorization request.

---

# Features Implemented

* Authorization Request Management
* Provider/Hospital Information Management
* Client-side Input Validation
* Google Gemini AI Copilot Integration
* Prompt-Based AI Authorization Review
* Intelligent Clinical Documentation Review
* Authorization Request Update Workflow
* Provider-Payer Communication
* Authorization Approval Workflow
* Authorization Rejection Workflow
* Request Status Tracking
* Notification Management
* React Frontend
* Spring Boot Microservices
* MySQL Persistence
* REST-Based Service Communication
* End-to-End Authorization Lifecycle
