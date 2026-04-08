import requests
import json

def check_api():
    url = "http://localhost:5172/api/orders/?userMobile=82005498988"
    try:
        response = requests.get(url, timeout=10)
        print(f"Status: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Total returned: {len(data)}")
            if len(data) > 0:
                print(f"Sample data fields: {list(data[0].keys())}")
                print(f"Sample data 'id': {data[0].get('id')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    check_api()
