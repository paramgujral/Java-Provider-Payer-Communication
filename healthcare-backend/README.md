# Healthcare JWT Secured Microservices Backend

Java backend-only Spring Boot microservices project.

## Includes

- Java 17
- Spring Boot 3
- Maven multi-module project
- Eureka Service Registry
- Spring Cloud API Gateway
- Load balancing with `lb://SERVICE-NAME`
- Auth Service with JWT generation
- JWT validation at API Gateway
- JWT validation again inside every microservice
- Role-based authorization using `@PreAuthorize`
- Provider Service
- Payer Service
- Authorization Service
- AI Copilot Service
- Notification Service
- JPA + H2 local database
- MySQL driver included
- Unit tests with JUnit 5 and Mockito
- Dockerfiles and Docker Compose

## Ports

| Service | Port |
|---|---:|
| service-registry | 8761 |
| api-gateway | 8080 |
| provider-service | 8081 |
| payer-service | 8082 |
| authorization-service | 8083 |
| ai-copilot-service | 8084 |
| notification-service | 8085 |
| auth-service | 8086 |

## Build

```bash
mvn clean package
```

## Run order

```bash
java -jar service-registry/target/service-registry-1.0.0.jar
java -jar auth-service/target/auth-service-1.0.0.jar
java -jar api-gateway/target/api-gateway-1.0.0.jar
java -jar provider-service/target/provider-service-1.0.0.jar
java -jar payer-service/target/payer-service-1.0.0.jar
java -jar authorization-service/target/authorization-service-1.0.0.jar
java -jar ai-copilot-service/target/ai-copilot-service-1.0.0.jar
java -jar notification-service/target/notification-service-1.0.0.jar
```

## Step 1: Register user

### Provider user

```http
POST http://localhost:8080/auth/register
```

```json
{
  "username": "provider1",
  "password": "password123",
  "role": "PROVIDER"
}
```

### Payer user

```http
POST http://localhost:8080/auth/register
```

```json
{
  "username": "payer1",
  "password": "password123",
  "role": "PAYER"
}
```

### Admin user

```http
POST http://localhost:8080/auth/register
```

```json
{
  "username": "admin1",
  "password": "password123",
  "role": "ADMIN"
}
```

## Step 2: Login

```http
POST http://localhost:8080/auth/login
```

```json
{
  "username": "provider1",
  "password": "password123"
}
```

Response:

```json
{
  "token": "JWT_TOKEN_HERE",
  "tokenType": "Bearer"
}
```

## Step 3: Use token

For all secured APIs, add header:

```http
Authorization: Bearer JWT_TOKEN_HERE
```

## Provider APIs

```http
POST http://localhost:8080/provider
```

```json
{
  "providerName": "Apollo Hospital",
  "npiNumber": "NPI123456",
  "email": "apollo@test.com",
  "phone": "9876543210",
  "address": "Bangalore"
}
```

```http
GET http://localhost:8080/provider
GET http://localhost:8080/provider/1
PUT http://localhost:8080/provider/1
DELETE http://localhost:8080/provider/1
```

## Payer APIs

```http
POST http://localhost:8080/payer
```

```json
{
  "payerName": "Blue Cross",
  "payerCode": "BC101",
  "email": "payer@test.com",
  "phone": "8888888888"
}
```

```http
GET http://localhost:8080/payer
GET http://localhost:8080/payer/1
PUT http://localhost:8080/payer/1
DELETE http://localhost:8080/payer/1
```

## Authorization APIs

```http
POST http://localhost:8080/authorization
```

```json
{
  "providerId": 1,
  "payerId": 1,
  "patientId": "PAT001",
  "procedureCode": "PROC101",
  "diagnosisCode": "ICD10-A123",
  "clinicalNotes": "Patient requires MRI scan."
}
```

```http
PUT http://localhost:8080/authorization/1/submit
```

```http
PUT http://localhost:8080/authorization/1/approve
```

```json
{
  "remarks": "Approved after clinical review."
}
```

```http
PUT http://localhost:8080/authorization/1/reject
```

```json
{
  "remarks": "Clinical notes are missing."
}
```

```http
GET http://localhost:8080/authorization
GET http://localhost:8080/authorization/1
```

## AI Copilot API

```http
POST http://localhost:8080/ai/review
```

```json
{
  "authorizationId": "1",
  "patientId": "PAT001",
  "payerId": "1",
  "procedureCode": "PROC101",
  "diagnosisCode": "ICD10-A123",
  "clinicalNotes": "Patient requires MRI scan."
}
```

## Notification API

```http
POST http://localhost:8080/notification/send
```

```json
{
  "authorizationId": 1,
  "receiverEmail": "provider@test.com",
  "subject": "Authorization Status",
  "message": "Your authorization request has been approved."
}
```

## JWT Validation Flow

```text
Client sends JWT
        |
API Gateway validates JWT
        |
Gateway forwards same Authorization header
        |
Microservice validates JWT again
        |
Role checked using @PreAuthorize
        |
Controller executes
```
