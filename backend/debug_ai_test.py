import json
import urllib.request
from urllib.error import HTTPError, URLError

base = 'http://localhost:8080'
login = {'email': 'provider.submit.9e7a15dd@example.com', 'password': 'Password@123'}
req = urllib.request.Request(base + '/api/auth/login', data=json.dumps(login).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(req) as resp:
    body = resp.read().decode('utf-8')
    print('LOGIN', resp.status)
    print(body)
    token = json.loads(body)['token']
for path, payload in [('/api/ai/summarize', {'requestText': 'Test summary'}), ('/api/ai/review', {
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
})]:
    req = urllib.request.Request(base + path, data=json.dumps(payload).encode('utf-8'), headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            print(path, resp.status)
            print(resp.read().decode('utf-8'))
    except HTTPError as e:
        print(path, 'HTTPError', e.code)
        print(e.read().decode('utf-8'))
    except URLError as e:
        print(path, 'URLError', e)
