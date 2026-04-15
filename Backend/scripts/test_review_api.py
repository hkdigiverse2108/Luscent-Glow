import requests
import json
import time

def test_review_submission():
    api_base = "http://localhost:5172/api"  # Adjust if backend is on different port
    
    # Mock data
    review_payload = {
        "productId": "69d08aced8f14d4b220c4181", # Use an existing product ID from check_reviews.py
        "userMobile": "9876543210",
        "userName": "Test User",
        "rating": 5,
        "comment": "This is a test review with images directly from script.",
        "title": "Amazing Test!",
        "images": ["/uploads/test_image_1.jpg", "/uploads/test_image_2.jpg"],
        "createdAt": "2026-04-15T14:15:43Z"
    }
    
    # Call the review endpoint
    try:
        response = requests.post(f"{api_base}/reviews/", json=review_payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_review_submission()
