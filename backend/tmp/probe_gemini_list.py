import json
import urllib.request
import urllib.error
from pathlib import Path

props = {}
with open('src/main/resources/application.properties', 'r', encoding='utf-8') as f:
    for line in f:
        stripped = line.strip()
        if '=' in stripped and not stripped.startswith('#'):
            key, value = stripped.split('=', 1)
            props[key] = value

api_key = props.get('spring.ai.api-key')
if not api_key:
    raise SystemExit('Missing API key')

url = f'https://generativelanguage.googleapis.com/v1beta2/models?key={api_key}'
print('GET', url)
req = urllib.request.Request(url, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as resp:
        print('STATUS', resp.status)
        print(resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('STATUS', e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print('ERROR', type(e).__name__, e)
