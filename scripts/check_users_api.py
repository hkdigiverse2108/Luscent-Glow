import requests
import json

BASE_URL = "http://localhost:8000/api"

def check_users():
    print("--- Checking Users API ---")
    try:
        response = requests.get(f"{BASE_URL}/users/")
        if response.status_code == 200:
            users = response.json()
            print(f"Success! Found {len(users)} users.")
            if users:
                print(f"First user: {users[0].get('fullName')} ({users[0].get('email')})")
                
                # Check detail endpoint
                user_id = users[0].get('id')
                detail_resp = requests.get(f"{BASE_URL}/users/{user_id}")
                if detail_resp.status_code == 200:
                    details = detail_resp.json()
                    print(f"Detail check Success! User: {details.get('user', {}).get('fullName')}")
                    print(f"Cart items: {len(details.get('cart', []))}")
                    print(f"Wishlist items: {len(details.get('wishlist', []))}")
                else:
                    print(f"Detail check failed: {detail_resp.status_code}")
        else:
            print(f"Failed to list users: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    check_users()
