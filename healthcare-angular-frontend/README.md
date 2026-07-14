# Healthcare Angular Frontend

Angular frontend for your Spring Boot JWT-secured healthcare microservices backend.

## Includes

- Login
- Register
- JWT interceptor
- Auth guard
- Dashboard
- Provider page
- Payer page
- Authorization workflow
- AI Copilot review
- Notifications
- API Gateway URL: `http://localhost:8080`

## Run

```bash
npm install
npm start
```

## Backend start first

Start your Spring Boot services:

1. service-registry
2. auth-service
3. api-gateway
4. provider-service
5. payer-service
6. authorization-service
7. ai-copilot-service
8. notification-service

## Test users

Register:

```json
{
  "username": "admin1",
  "password": "Password@123",
  "role": "ADMIN"
}
```

Then login and use the UI.

## Important

If you make provider/payer creation Admin-only in backend, login as ADMIN to create Provider and Payer.
