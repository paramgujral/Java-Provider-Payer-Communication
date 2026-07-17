import json
import urllib.request
import urllib.error
from pathlib import Path

req_body = Path('tmp/review_req.json').read_text(encoding='utf-8')
req = urllib.request.Request(
    'http://localhost:8080/api/ai/review',
    data=req_body.encode('utf-8'),
    headers={'Content-Type': 'application/json'},
)
try:
    with urllib.request.urlopen(req) as resp:
        print('STATUS', resp.status)
        print(resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('STATUS', e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print('ERROR', type(e).__name__, e)
