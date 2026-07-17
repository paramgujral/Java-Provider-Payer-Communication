import json
import urllib.request
from urllib.error import HTTPError, URLError

base = 'http://localhost:8080'
login_data = json.dumps({'email': 'provider.submit.9e7a15dd@example.com', 'password': 'Password@123'}).encode('utf-8')
req = urllib.request.Request(base + '/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req) as resp:
        login_body = resp.read().decode('utf-8')
        print('LOGIN', resp.status)
        print(login_body)
        token = json.loads(login_body)['token']
except HTTPError as e:
    print('LOGIN ERROR', e.code)
    print(e.read().decode('utf-8'))
    raise SystemExit(1)
except URLError as e:
    print('LOGIN URL ERROR', e)
    raise SystemExit(1)

for path, payload in [
    ('/api/ai/summarize', {'requestText': 'Test summary'}),
    ('/api/ai/review', {
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
]:
    body = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(base + path, data=body, headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            print(path, resp.status)
            print(resp.read().decode('utf-8'))
    except HTTPError as e:
        print(path, 'HTTPError', e.code)
        print(e.read().decode('utf-8'))
    except URLError as e:
        print(path, 'URLError', e)
