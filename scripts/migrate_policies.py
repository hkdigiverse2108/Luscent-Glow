import requests
import json
from datetime import datetime

def migrate_policies():
    url_base = "http://127.0.0.1:5172/api/policies"
    
    # Existing default policies to migrate into DB
    policies = [
        {
            "type": "privacy-policy",
            "title": "Privacy Policy",
            "subtitle": "Your trust is the foundation of our commitment to you.",
            "lastUpdated": "March 30, 2026",
            "insights": [
                {"icon": "Shield", "title": "Data Protection", "description": "Industry-standard encryption for your personal information."},
                {"icon": "Eye", "title": "Full Transparency", "description": "Complete control over how your data is collected and used."}
            ],
            "sections": [
                {"id": "collection", "title": "Information We Collect", "content": "<p>We collect personal, usage, and device data to optimize your experience.</p>"},
                {"id": "usage", "title": "How We Use Your Data", "content": "<p>Fulfilling orders and improving our services.</p>"}
            ]
        },
        {
            "type": "terms-and-conditions",
            "title": "Terms & Conditions",
            "subtitle": "The principles that guide our relationship with you.",
            "lastUpdated": "March 30, 2026",
            "insights": [
                {"icon": "FileText", "title": "Agreement", "description": "Compliance with our terms and standards."},
                {"icon": "UserCheck", "title": "User Conduct", "description": "Respectful and honest community behavior."}
            ],
            "sections": [
                {"id": "acceptance", "title": "Acceptance of Terms", "content": "By using Luscent Glow, you agree to our terms."}
            ]
        }
        # Cancellation, Shipping, and Return policies will follow the same pattern
    ]

    print(f"[*] Starting Policy Migration to {url_base}")
    for policy in policies:
        try:
            # Using PUT to upsert into DB
            response = requests.put(f"{url_base}/{policy['type']}", json=policy, timeout=10)
            if response.ok:
                print(f"[✔] Migrated: {policy['title']}")
            else:
                print(f"[!] Migration Failed for {policy['type']}: {response.text}")
        except Exception as e:
            print(f"[!] Critical Error: {e}")

if __name__ == "__main__":
    migrate_policies()
