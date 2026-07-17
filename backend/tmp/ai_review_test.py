import json
import urllib.request
import urllib.error

body = {
    "patientName": "John123",
    "insuranceCompany": "Acme",
    "policyNumber": "123",
    "memberId": "abc",
    "coverageType": "HMO",
    "doctorName": "Dr 456",
    "npiNumber": "12345",
    "hospital": "General",
    "specialty": "Cardiology",
    "diagnosis": "I10",
    "icd10Code": "I10",
    "procedureName": "ECHO",
    "cptCode": "93306",
    "reasonForAuthorization": "Chest pain evaluation",
    "mriReport": "",
    "labReport": "",
    "prescription": "",
    "medicalHistory": "Hypertension"
}

req = urllib.request.Request(
    "http://localhost:8091/api/ai/review",
    data=json.dumps(body).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)
try:
    with urllib.request.urlopen(req) as resp:
        print(resp.status)
        print(resp.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("STATUS", e.code)
    print(e.read().decode("utf-8"))
except Exception as e:
    print("ERROR", e)
