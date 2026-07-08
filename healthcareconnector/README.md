# Healthcare Connector Platform

A smart healthcare authorization workflow platform that enables seamless bidirectional communication between healthcare providers and insurance payers using AI validation and FHIR-based data exchange.

## Problem Statement

Current healthcare authorization systems lack efficient two-way communication between providers and payers. This results in incomplete authorization requests, manual corrections, and delays.

This platform improves the workflow by validating authorization requests using an AI Copilot before submission and enabling real-time status tracking between provider and payer.

---

## Features

### Provider Module

- Create authorization requests
- Submit patient diagnosis and procedure information
- Track authorization status
- Receive payer responses


### AI Copilot Module

- Reviews authorization requests before payer submission
- Detects missing information
- Provides correction recommendations
- Reduces payer rejection


Validation Examples:

- Missing patient details
- Missing diagnosis
- Missing procedure code
- Missing supporting documents


### FHIR Integration

Converts internal authorization data into healthcare FHIR Claim format.

Example:

```json
{
  "resourceType":"Claim",
  "patient":{
    "name":"John"
  },
  "procedure":{
    "code":"CABG001"
  }
}
```

### Payer Module

- View authorization requests
- Approve requests
- Reject requests with comments


### Notification Module

- Sends status update notifications
- Tracks approval/rejection updates


---

## Technology Stack

- Java 21
- Spring Boot 3
- Spring MVC REST API
- Spring Data JPA
- Hibernate
- H2 Database
- Maven
- Lombok
- Swagger OpenAPI


---

## Architecture


Provider

↓

Spring Boot REST API

↓

AI Copilot Validation

↓

FHIR Conversion

↓

Payer Review

↓

Status Notification


---

## API Endpoints


### Create Authorization Request

POST

/api/provider/authorization


Request:

```json
{
"patientName":"John",
"diagnosis":"Heart Surgery",
"procedureCode":"CABG001",
"documentAttached":true
}
```


---

### Track Status


GET

/api/provider/status/{id}


---

### Convert FHIR


GET

/api/fhir/{id}


---

### Get Payer Requests


GET

/api/payer/requests


---

### Approve Authorization


PUT

/api/payer/{id}/approve


---

### Reject Authorization


PUT

/api/payer/{id}/reject?reason=Missing documents


---

## Database

H2 Console:

http://localhost:8080/h2-console


Configuration:


JDBC URL:

jdbc:h2:mem:healthdb


Username:

admin


Password:

admin


---

## Swagger Documentation


Run application and open:


http://localhost:8080/swagger-ui.html


---

## Run Application


Build:

```bash
mvn clean install
```


Run:

```bash
mvn spring-boot:run
```


---

## Future Improvements

- Real OpenAI integration
- Kafka asynchronous communication
- Microservices deployment
- OAuth2 Security
- Kubernetes deployment
- Cloud database integration
