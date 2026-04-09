import requests
import json

def audit_footer():
    url = "http://127.0.0.1:5172/api/footer/"
    print(f"[*] Auditing Registry: {url}")
    try:
        response = requests.get(url, timeout=10)
        print(f"[*] Status Code: {response.status_code}")
        if response.ok:
            data = response.json()
            print("[✔] Registry Data Pulled:")
            print(json.dumps(data, indent=2))
            
            # Check for empty columns
            if not data.get("columns") or len(data.get("columns")) == 0:
                print("[!] ALERT: Columns are EMPTY in the database.")
            else:
                print(f"[✔] Found {len(data['columns'])} columns.")
                for col in data["columns"]:
                    print(f"    - {col['title']}: {len(col['links'])} links")
        else:
            print(f"[!] Error Response: {response.text}")
    except Exception as e:
        print(f"[!] Exception during audit: {e}")

if __name__ == "__main__":
    audit_footer()
