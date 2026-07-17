import json, urllib.request, urllib.error
from pathlib import Path

with open('src/main/resources/application.properties', 'r', encoding='utf-8') as f:
    props = dict(line.strip().split('=',1) for line in f if '=' in line and not line.startswith('#'))
api_key = props.get('spring.ai.api-key')
model = props.get('spring.ai.chat.model')
if not api_key or not model:
    raise SystemExit('Missing api_key or model')

url = f'https://generativelanguage.googleapis.com/v1beta2/models/{model}:generateText?key={api_key}'
body = {
    'prompt': {'text': 'Hello from test'},
    'temperature': 0.0,
    'maxOutputTokens': 64,
    'candidateCount': 1
}
req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers={'Content-Type':'application/json'})
try:
    with urllib.request.urlopen(req) as resp:
        print('STATUS', resp.status)
        print(resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('STATUS', e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print('ERROR', e)
