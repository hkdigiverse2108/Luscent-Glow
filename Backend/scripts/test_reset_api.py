import requests
import json

def test_reset_password():
    url = "http://localhost:5172/api/auth/reset-password"
    payload = {
        "mobileNumber": "8200549898",
        "otp": "906908",
        "newPassword": "NewAdmin@123",
        "userId": "69cfb2c7561649fff4e90a02"
    }
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    print(f"--- Testing Reset Password ---")
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_reset_password()
