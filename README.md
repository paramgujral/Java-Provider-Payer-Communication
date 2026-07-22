# Smart Healthcare Connector Platform

## Overview

This project implements a Smart Healthcare Connector Platform that enables bidirectional communication between Providers and Payers for authorization workflows.

The application consists of:

- Provider Module
- Payer Module
- AI Copilot for request validation
- Authorization status tracking
- Notification support

---

## Technology Stack

### Backend
- Java 17
- Spring Boot
- Spring Data JPA
- MySQL
- REST APIs

### Frontend
- Angular 19
- TypeScript
- HTML
- CSS

---

## Project Structure

```
Java-Provider-Payer-Communication-Megha_Ganesh
│
├── healthcare-connector   (Spring Boot Backend)
│
└── healthcare-ui          (Angular Frontend)
```

---

## Features

### Provider Module

- Create Authorization Request
- Review request using AI Copilot
- Submit Authorization Request
- View Submitted Requests
- Delete Request
- View Request Status
- Receive Status Notifications

---

### Payer Module

- View Authorization Requests
- Approve Request
- Reject Request
- Status Updates

---

### AI Copilot

Before submitting a request, the AI Copilot reviews the request and provides recommendations such as:

- Missing Patient Name
- Missing Insurance ID
- Diagnosis and Procedure mismatch
- Request looks good and ready for submission

---

## Authorization Workflow

Provider

↓

Create Authorization Request

↓

Review with AI

↓

Submit

↓

Status = Pending

↓

Payer Reviews Request

↓

Approve / Reject

↓

Provider can track latest status

---

## REST APIs

### Create Authorization Request

```
POST /api/request
```

### Get All Requests

```
GET /api/request
```

### AI Review

```
POST /api/request/review
```

### Approve Request

```
PUT /api/request/{id}/approve
```

### Reject Request

```
PUT /api/request/{id}/reject
```

### Delete Request

```
DELETE /api/request/{id}
```

---

## Backend Setup

Navigate to:

```
healthcare-connector
```

Run:

```bash
mvn spring-boot:run
```

Backend URL

```
http://localhost:8080
```

---

## Frontend Setup

Navigate to:

```
healthcare-ui
```

Install dependencies

```bash
npm install
```

Run application

```bash
ng serve
```

Frontend URL

```
http://localhost:4200
```

---

## Database

MySQL

Update your database configuration inside:

```
application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/healthcare
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

---

## Developed By

Megha Choudhary