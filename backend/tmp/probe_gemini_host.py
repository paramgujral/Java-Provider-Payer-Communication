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

models = ['gemini-1.5-pro', 'gemini-1.5', 'gemini-1.0', 'chat-bison-001']
hosts = [
    'https://gemini.googleapis.com/v1/models/%s:%s?key=%s',
    'https://generativelanguage.googleapis.com/v1beta2/models/%s:%s?key=%s'
]

for host in hosts:
    for model in models:
        for method in ['generateMessage','generateText']:
            url = host % (model, method, api_key)
            body = {
                'prompt': {
                    'messages': [
                        {'author': 'user', 'content': 'Hello world'}
                    ]
                },
                'temperature': 0.0
            } if method == 'generateMessage' else {
                'prompt': {'text': 'Hello world'},
                'temperature': 0.0,
                'maxOutputTokens': 64,
                'candidateCount': 1
            }
            print('\n===', url)
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
