from pymongo import MongoClient
from datetime import datetime

def seed_atlas_policies():
    # Correct Atlas URI from the system logs
    mongo_uri = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(mongo_uri)
    db = client.get_default_database() # This uses 'luscent_glow_db' from the URI
    
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
            ],
            "updatedAt": datetime.utcnow().isoformat()
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
            ],
            "updatedAt": datetime.utcnow().isoformat()
        },
        {
            "type": "return-policy",
            "title": "Return & Refund",
            "subtitle": "Ensuring your satisfaction with every luminous drop.",
            "lastUpdated": "March 30, 2026",
            "insights": [
                {"icon": "RefreshCcw", "title": "30-Day Window", "description": "30 days to initiate a return or exchange."},
                {"icon": "ShieldCheck", "title": "Quality Promise", "description": "Items must be in original condition."}
            ],
            "sections": [
                {"id": "eligibility", "title": "Eligibility", "content": "Satisfaction guaranteed within 30 days."}
            ],
            "updatedAt": datetime.utcnow().isoformat()
        },
        {
            "type": "shipping-policy",
            "title": "Shipping Policy",
            "subtitle": "Ensuring a smooth, elegant journey to your doorstep.",
            "lastUpdated": "March 30, 2026",
            "insights": [
                {"icon": "Zap", "title": "Fast Dispatch", "description": "Orders processed within 1-2 business days."},
                {"icon": "Truck", "title": "Eco-Shipping", "description": "Sustainable delivery rituals."}
            ],
            "sections": [
                {"id": "processing", "title": "Processing Time", "content": "1-2 days for most orders."}
            ],
            "updatedAt": datetime.utcnow().isoformat()
        },
        {
            "type": "cancellation-policy",
            "title": "Cancellation Policy",
            "subtitle": "Flexible guidance for your beauty needs.",
            "lastUpdated": "March 30, 2026",
            "insights": [
                {"icon": "Clock", "title": "6-Hour Window", "description": "Cancel within 6 hours for a full refund."},
                {"icon": "XCircle", "title": "No Hassle", "description": "Easy cancellation through your account."}
            ],
            "sections": [
                {"id": "window", "title": "Cancellation Window", "content": "Plans change, so we offer a 6-hour window."}
            ],
            "updatedAt": datetime.utcnow().isoformat()
        }
    ]

    print(f"[*] Starting Direct Policy Seeding to MongoDB Atlas...")
    try:
        # Check current collection name - in user logs it connected to luscent_glow_db
        # We'll use the 'policies' collection
        collection = db["policies"]
        
        for policy in policies:
            collection.update_one(
                {"type": policy["type"]},
                {"$set": policy},
                upsert=True
            )
            print(f"[✔] Cloud Seeded: {policy['title']}")
        print("[✔] Atlas Cloud Seeding Complete!")
    except Exception as e:
        print(f"[!] Critical Error during Atlas Seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_atlas_policies()
