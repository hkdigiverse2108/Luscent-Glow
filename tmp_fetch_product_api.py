import requests, json
url = "http://127.0.0.1:5172/api/products/69d08aced8f14d4b220c4180"
try:
    r = requests.get(url)
    print(json.dumps(r.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
