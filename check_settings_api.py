import requests

def check_settings():
    try:
        r = requests.get('http://127.0.0.1:5172/api/blogs/settings')
        print(f"Settings Status: {r.status_code}")
        print(f"Settings JSON: {r.json()}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    check_settings()
