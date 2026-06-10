# Healthcare Authorization Connector

## Overview

Healthcare Authorization Connector is an AI-powered platform that streamlines communication between healthcare providers and insurance payers.

The system helps providers create high-quality authorization requests by using AI to review submissions before they are sent to payers. This reduces incomplete requests, improves approval efficiency, and enhances the overall authorization workflow.

---

## Problem Statement

Healthcare authorization requests are frequently delayed or rejected because of:

* Incomplete information
* Vague diagnoses
* Insufficient procedure details
* Manual review overhead

These issues create delays for patients, providers, and insurance companies.

---

## Solution

Our solution introduces an AI Review layer before request submission.

Workflow:

1. Provider creates an authorization request.
2. AI reviews the request for completeness and quality.
3. If approved, a one-time review token is generated.
4. Provider submits the request using the token.
5. Payer reviews and approves/rejects the request.
6. Provider receives status updates and notifications.

---

## Key Features

### Provider Portal

* Submit authorization requests
* Run AI review before submission
* Track request status
* View approval/rejection history

### AI Copilot

* Reviews request quality
* Detects vague or missing information
* Provides recommendations
* Generates one-time review tokens
* Prevents bypassing AI validation

### Payer Portal

* View pending requests
* Approve requests
* Reject requests with remarks
* Manage authorization workflow

### Notifications

* Real-time request status updates
* Approval notifications
* Rejection notifications

---

## Architecture

Provider
↓
AI Review
↓
Review Token Generated
↓
Submit Authorization Request
↓
Payer Review
↓
Approve / Reject
↓
Notification

---

## Technology Stack

### Backend

* Java 17
* Spring Boot
* Spring Data JPA
* H2 Database
* OpenAI API

### Frontend

* React
* Axios
* React Hooks

---

## API Endpoints

### AI Review

POST /api/authorization/review

Reviews request quality and generates a review token.

### Submit Authorization Request

POST /api/provider/submit

Submits an authorization request after successful AI review.

### Provider Requests

GET /api/provider/requests/{providerId}

Returns all requests submitted by a provider.

### Payer Requests

GET /api/payer/{payerId}/requests/pending

Returns pending requests assigned to a payer.

### Update Request Status

PUT /api/payer/requests/{id}/status

Approves or rejects a request.

### Notifications

GET /api/notifications/{providerId}

Returns provider notifications.

---

## AI Review Workflow

### Example: Failed Review

Diagnosis:
Pain

Procedure:
Surgery

Result:

* Review Failed
* Diagnosis too vague
* Procedure too generic

### Example: Successful Review

Diagnosis:
Medial Meniscus Tear of Right Knee confirmed through MRI

Procedure:
Arthroscopic Meniscus Repair of Right Knee

Result:

* Review Passed
* Review Token Generated
* Ready for Submission

---

## Security Design

* AI review is mandatory before submission.
* Review tokens are generated only after successful AI validation.
* Tokens are validated by the backend.
* Tokens are consumed after use and cannot be reused.

This prevents direct API bypass of the AI review process.

---

## Running the Backend

1. Open backend project.
2. Configure OpenAI API key.

application.properties

openai.api.key=YOUR_OPENAI_API_KEY

3. Run Spring Boot application.

Backend URL:

http://localhost:8080

---

## Running the Frontend

1. Navigate to frontend folder.

2. Install dependencies.

npm install

3. Start application.

npm start

Frontend URL:

http://localhost:3000

---

## Demo Flow

1. Provider enters authorization request.
2. AI reviews the request.
3. AI generates review token.
4. Provider submits request.
5. Payer reviews request.
6. Payer approves/rejects request.
7. Provider tracks status through notifications.

---

## Future Enhancements

* JWT Authentication
* Redis-based token storage
* Email notifications
* Audit logging
* Role-based access control
* FHIR integration
* Dashboard analytics

---

## Team

Healthcare Authorization Connector Team
