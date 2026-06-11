# Healthcare Connector Platform Backend

## Overview
A secure healthcare communication and authorization platform built with Java 21 and Spring Boot 3.

## Technology Stack
- Java 21
- Spring Boot 3.2.0
- Spring Security (JWT)
- MySQL
- Spring Data JPA
- HAPI FHIR
- OpenAPI/Swagger

## Prerequisites
- JDK 21
- Maven 3.9+
- MySQL 8.0+

## Database Setup
1. Open MySQL Workbench.
2. Run the script located at `src/main/resources/sql/schema.sql` to create the `healthcare_db` database and tables.
3. This will create the `healthcare_db` and seed it with two users:
   - **Provider:** `admin` / `password`
   - **Payer:** `payer` / `password`

## Running the Application
1. Update `src/main/resources/application.properties` with your MySQL credentials.
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## API Documentation
Once the application is running, access Swagger UI at:
`http://localhost:8080/api/swagger-ui.html`

## Modules
- **Auth:** JWT-based authentication and role-based access control.
- **Authorization Requests:** Workflow for providers to submit and payers to review requests.
- **AI Copilot:** Mock integration for request validation.
- **FHIR:** HAPI FHIR integration for healthcare data standards.
- **Messaging:** Communication between providers and payers.
- **Notifications:** Real-time system notifications.
- **Audit:** Tracking of all critical system actions.
