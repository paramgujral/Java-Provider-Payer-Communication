import json
import urllib.request
from urllib.error import HTTPError

token = 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcm92aWRlci5zdWJtaXQuOWU3YTE1ZGRAZXhhbXBsZS5jb20iLCJpYXQiOjE3ODQyMDg1MjMsImV4cCI6MTc4NDI5NDkyM30.9RRylk_GfY90jrTgJD5hIdqAaAClFunAvEDZfV2st8yAcvBfxRUOnXA6zF4xODq_'
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}
endpoints = [
    ('GET', '/api/auth/profile', None),
    ('GET', '/api/provider/dashboard', None),
    ('POST', '/api/ai/summarize', {'requestText': 'Test summary'}),
    ('POST', '/api/ai/review', {
        'patientName': 'John Doe',
        'insuranceCompany': 'Acme Health',
        'policyNumber': 'P12345',
        'memberId': 'M7890',
        'coverageType': 'Medical',
        'doctorName': 'Dr. Smith',
        'npiNumber': '1234567890',
        'hospital': 'General Hospital',
        'specialty': 'Cardiology',
        'diagnosis': 'Chest Pain',
        'icd10Code': 'R07.9',
        'procedureName': 'ECG',
        'cptCode': '93000',
        'reasonForAuthorization': 'Evaluation',
        'mriReport': 'None',
        'labReport': 'Normal',
        'prescription': 'Aspirin',
        'medicalHistory': 'Hypertension'
    })
]
for method, path, body in endpoints:
    try:
        data = None if body is None else json.dumps(body).encode('utf-8')
        req = urllib.request.Request('http://localhost:8080' + path, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req) as resp:
            print(path, resp.status)
            print(resp.read().decode())
    except HTTPError as e:
        print(path, 'HTTPError', e.code)
        try:
            print(e.read().decode())
        except Exception:
            pass
