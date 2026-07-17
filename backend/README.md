# Healthcare Connector Backend

This backend now exposes FHIR-focused endpoints for provider and payer workflows.

## What is implemented

- `POST /api/fhir/patient` and `GET /api/fhir/patient/{id}` for Patient resources
- `POST /api/fhir/coverage` and `GET /api/fhir/coverage/{id}` for Coverage resources
- `POST /api/fhir/claim` and `GET /api/fhir/claim/{id}` for Claim resources
- `POST /api/fhir/patient/validate`, `POST /api/fhir/coverage/validate`, `POST /api/fhir/claim/validate`
- `GET /api/fhir/validation/status` to inspect validation support and loaded StructureDefinitions
- `POST /api/fhir/outbound` to forward a FHIR JSON payload to a payer endpoint
- AI copilot endpoints under `/api/ai` with structured validation suggestions

## Sample requests

### Validate a Patient

```bash
curl -X POST http://localhost:8081/api/fhir/patient/validate \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "Patient",
    "name": [{ "family": "Doe", "given": ["John"] }],
    "gender": "male",
    "birthDate": "1980-01-01"
  }'
```

### Create a Claim

```bash
curl -X POST "http://localhost:8081/api/fhir/claim?validate=true" \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "Claim",
    "status": "active",
    "type": { "text": "Prior Authorization" }
  }'
```

### Forward a FHIR payload to a payer

```bash
curl -X POST http://localhost:8081/api/fhir/outbound \
  -H "Content-Type: application/json" \
  -d '{
    "payerUrl": "https://payer.example.com/fhir",
    "resourceJson": "{\"resourceType\":\"Claim\",\"status\":\"active\"}"
  }'
```

### AI validation with suggestions

```bash
curl -X POST http://localhost:8081/api/ai/validate \
  -H "Content-Type: application/json" \
  -d '{
    "requestText": "MRI request"
  }'
```

## Notes

- If you want strict validation against remote profiles, set `FHIR_VALIDATION_REMOTE` or `-Dfhir.validation.remote` to a FHIR base URL that publishes `StructureDefinition` resources.
- The app can run as a modular monolith without a separate standalone FHIR server.
