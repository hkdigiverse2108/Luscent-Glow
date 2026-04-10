from Backend.app.utils.env_utils import sync_to_env
import os

def test_sync():
    print("Testing .env sync...")
    updates = {
        "smtpHost": "smtp.test.com",
        "smtpPort": "465",
        "smtpUser": "testuser@gmail.com",
        "smtpPassword": "testpassword123",
        "fromEmail": "testsender@gmail.com",
        "fromName": "Test Luscent Glow"
    }
    sync_to_env(updates)
    print("Test complete. Check .env file.")

if __name__ == "__main__":
    test_sync()
