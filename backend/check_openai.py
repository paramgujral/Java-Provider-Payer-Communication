import json
import re
import urllib.request
from urllib.error import HTTPError, URLError

prop_text = open('src/main/resources/application.properties', 'r', encoding='utf-8').read()
match = re.search(r'^spring\.ai\.openai\.api-key=(.*)$', prop_text, flags=re.MULTILINE)
if not match:
    print('NO_API_KEY')
    raise SystemExit(1)
api_key = match.group(1).strip()
print('API_KEY_LEN', len(api_key), 'PREFIX', api_key[:10])
url = 'https://api.openai.com/v1/chat/completions'
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}
data = json.dumps({
    'model': 'gpt-4.1',
    'messages': [
        {'role': 'system', 'content': 'You are a test assistant.'},
        {'role': 'user', 'content': 'Hello'}
    ]
}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers=headers, method='POST')
try:
    with urllib.request.urlopen(req) as resp:
        print('OPENAI_STATUS', resp.status)
        print(resp.read().decode('utf-8'))
except HTTPError as e:
    print('OPENAI_HTTP_ERROR', e.code)
    print(e.read().decode('utf-8'))
except URLError as e:
    print('OPENAI_URL_ERROR', e)
