import json
import urllib.request
import urllib.error
from pathlib import Path

with open('src/main/resources/application.properties', 'r', encoding='utf-8') as f:
    props = dict(line.strip().split('=',1) for line in f if '=' in line and not line.startswith('#'))
api_key = props.get('spring.ai.api-key')
if not api_key:
    raise SystemExit('Missing api key')

models = [
    ('gemini-1.5-pro', 'generateText'),
    ('gemini-1.5-pro', 'generateMessage'),
    ('chat-bison-001', 'generateMessage'),
    ('text-bison-001', 'generateText'),
]

for model, endpoint in models:
    url = f'https://generativelanguage.googleapis.com/v1beta2/models/{model}:{endpoint}?key={api_key}'
    if endpoint == 'generateText':
        body = {
            'prompt': {'text': 'Hello world'},
            'temperature': 0.0,
            'maxOutputTokens': 64,
            'candidateCount': 1,
        }
    else:
        body = {
            'prompt': {
                'messages': [
                    {'author': 'user', 'content': 'Hello world'}
                ]
            },
            'temperature': 0.0,
        }
    print('===', model, endpoint, '===')
    print(json.dumps(body, indent=2))
    req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            print('STATUS', resp.status)
            print(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print('STATUS', e.code)
        print(e.read().decode('utf-8'))
    except Exception as e:
        print('ERROR', type(e).__name__, e)
    print()
