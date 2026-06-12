# Java-Provider-Payer-Communication_Aneel-Miyapuram

# Smart Healthcare Connector

AI-Powered Provider-Payer Authorization Platform

## Project Overview

Smart Healthcare Connector is a healthcare authorization workflow application that enables communication between healthcare Providers and Payers.

The application allows:

### Provider Portal

* Login
* Submit Authorization Requests
* AI Validation of Claims
* View Authorization Status
* Receive Approval/Rejection Notifications
* Dashboard Analytics

### Payer Portal

* Login
* Review Authorization Requests
* Approve Requests
* Reject Requests
* Dashboard Analytics
* Activity Tracking

---

## Technology Stack

### Backend

* Java 17
* Spring Boot
* Spring Data JPA
* Hibernate
* H2 Database
* Maven
* Lombok

### Frontend

* ReactJS
* Axios
* React Router DOM
* CSS

---

## Database Information

This project currently uses:

H2 In-Memory Database

```properties
spring.datasource.url=jdbc:h2:mem:testdb
```

### Important

Because H2 is configured as an In-Memory Database:

* Data is NOT persisted.
* All users and authorization requests will be lost whenever the Spring Boot application restarts.
* Demo users may need to be recreated after restart.

---

## Demo Login Credentials

### Provider

Username:

```text
provider1
```

Password:

```text
provider123
```

### Payer

Username:

```text
payer1
```

Password:

```text
payer123
```

---

## Recreate Demo Users

If login fails after restarting the application, insert demo users again.

Open H2 Console:

```text
http://localhost:8080/h2-console
```

Use:

```text
JDBC URL: jdbc:h2:mem:testdb
Username: sa
Password:
```

Run:

```sql
INSERT INTO USERS
(ID, USERNAME, PASSWORD, ROLE)
VALUES
(1,'provider1','provider123','PROVIDER');

INSERT INTO USERS
(ID, USERNAME, PASSWORD, ROLE)
VALUES
(2,'payer1','payer123','PAYER');
```

---

## Backend Startup

```bash
mvn clean install
mvn spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

---

## Frontend Startup

```bash
npm install
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

## Main APIs

### Login

```http
POST /api/auth/login
```

### Validate Authorization

```http
POST /api/requests/validate
```

### Submit Authorization Request

```http
POST /api/requests/submit
```

### Provider Dashboard

```http
GET /api/requests/dashboard/provider/{providerId}
```

### Provider Notifications

```http
GET /api/requests/provider/{providerId}/notifications
```

### Payer Dashboard

```http
GET /api/requests/payer
```

### Approve Request

```http
PUT /api/requests/{id}/status?status=APPROVED
```

### Reject Request

```http
PUT /api/requests/{id}/status?status=REJECTED
```

---

## Future Enhancements

* JWT Authentication
* Role Based Access Control
* MySQL/PostgreSQL Integration
* Email Notifications
* Audit Logging
* AI-Based Claim Recommendations
* Docker Deployment
* Kubernetes Deployment

---

## Author

Aneel Miyapuram

Java Full Stack Developer
