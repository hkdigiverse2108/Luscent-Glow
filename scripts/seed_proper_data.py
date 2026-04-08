import requests
import json

# Luscent Glow - Proper Data Sanctuary Seeding Ritual
# This script populates the Atlas Cloud database with high-fidelity, professional policy content.

BASE_URL = "http://127.0.0.1:5172/api/policies"

POLICIES = [
    {
        "type": "privacy-policy",
        "title": "Privacy Policy",
        "subtitle": "Your digital platform is protected by our commitment to transparency and data integrity.",
        "lastUpdated": "April 6, 2026",
        "heroIcon": "Shield",
        "insights": [
            {"icon": "Shield", "title": "Data Security", "description": "Ensuring your private details are encrypted and inaccessible to unauthorized entities."},
            {"icon": "Lock", "title": "Encryption", "description": "Every transaction is shielded by military-grade SSL encryption for absolute trust."},
            {"icon": "EyeOff", "title": "No Ad Tracking", "description": "We do not sell your personal behavior data to third-party advertising networks."},
            {"icon": "UserCheck", "title": "Your Rights", "description": "Full control over your data, including deletion and export requests at any time."}
        ],
        "sections": [
            {
                "id": "introduction",
                "icon": "FileText",
                "title": "Introduction",
                "content": "<p>At Luscent Glow, your privacy is the cornerstone of our relationship. This Privacy Policy outlines how your personal data is collected, used, and protected when you interact with our digital platform.</p>"
            },
            {
                "id": "data-collection",
                "icon": "Fingerprint",
                "title": "Data Collection Processes",
                "content": "<p>We collect essential data to enhance your shopping experience, including:</p><ul><li><strong>Identity Data:</strong> Full name and mobile number.</li><li><strong>Contact Data:</strong> Email and billing/shipping addresses.</li><li><strong>Technical Data:</strong> IP address and navigation behavior to optimize site performance.</li></ul>"
            },
            {
                "id": "cookies",
                "icon": "Globe",
                "title": "Cookies & Tracking",
                "content": "<p>We use essential cookies to maintain your shopping cart and recognize your profile. No intrusive tracking is performed for third-party scripts.</p>"
            }
        ]
    },
    {
        "type": "terms-and-conditions",
        "title": "Terms & Conditions",
        "subtitle": "Guidelines for a professional and respectful interaction with the Luscent Glow platform.",
        "lastUpdated": "April 6, 2026",
        "heroIcon": "FileText",
        "insights": [
            {"icon": "FileText", "title": "Agreement", "description": "By entering the platform, you agree to follow our shared community standards."},
            {"icon": "UserCheck", "title": "Accountability", "description": "Ensure your profile credentials remain private and personal to you."},
            {"icon": "Package", "title": "Orders", "description": "Every order is a binding agreement between our brand and your beauty routine."},
            {"icon": "AlertCircle", "title": "Limitations", "description": "Clear boundaries regarding liability and platform usage rights."}
        ],
        "sections": [
            {
                "id": "usage",
                "icon": "Hand",
                "title": "Platform Usage",
                "content": "<p>Our platform is designed for personal, non-commercial use. Any high-frequency automated interaction or data scraping is strictly prohibited.</p>"
            },
            {
                "id": "products",
                "icon": "Sparkles",
                "title": "Product Representations",
                "content": "<p>We strive for complete accuracy in our product images. However, actual colors may vary slightly based on your digital display's calibration.</p>"
            }
        ]
    },
    {
        "type": "return-policy",
        "title": "Return & Refund Policy",
        "subtitle": "Our commitment to your satisfaction includes a seamless process for returns and exchanges.",
        "lastUpdated": "April 6, 2026",
        "heroIcon": "RotateCcw",
        "insights": [
            {"icon": "RefreshCcw", "title": "Flexible Returns", "description": "A 15-day window to initiate a return if the product remains in its pristine seals."},
            {"icon": "CheckCircle2", "title": "Quality Check", "description": "All returns undergo a professional inspection to ensure product integrity for the next user."},
            {"icon": "CreditCard", "title": "Instant Refunds", "description": "Once approved, refunds are credited back to your original payment method instantly."},
            {"icon": "Shield", "title": "Hygiene Standards", "description": "Due to hygiene standards, used or unsealed cosmetics cannot be returned."}
        ],
        "sections": [
            {
                "id": "return-window",
                "icon": "Clock",
                "title": "The 15-Day Window",
                "content": "<p>You have 15 days from the moment of delivery to initiate a return request via your Profile Dashboard.</p>"
            },
            {
                "id": "refund-process",
                "icon": "CreditCard",
                "title": "Refund Processes",
                "content": "<p>Approved refunds are processed within 48 hours of inspection. Shipping fees are non-refundable unless the item arrived damaged.</p>"
            }
        ]
    },
    {
        "type": "shipping-policy",
        "title": "Shipping Policy",
        "subtitle": "Global logistics powered by our dedication to fast and secure transit for your orders.",
        "lastUpdated": "April 6, 2026",
        "heroIcon": "Truck",
        "insights": [
            {"icon": "Truck", "title": "Fast Transit", "description": "Domestic orders arrive within 3-5 business days across the entire territory."},
            {"icon": "PackageCheck", "title": "Secure Packing", "description": "Multi-layer protective sealing to ensure your order arrives in perfect condition."},
            {"icon": "Globe", "title": "Global Logistics", "description": "International shipping to over 50 regions worldwide with tracked couriers."},
            {"icon": "Clock", "title": "Real-time Tracking", "description": "Track your order's journey in real-time from our facility to your doorstep."}
        ],
        "sections": [
            {
                "id": "tracking",
                "icon": "History",
                "title": "Order Tracking",
                "content": "<p>Once your order is fulfilled, you will receive a unique tracking ID via email and SMS.</p>"
            },
            {
                "id": "international",
                "icon": "Globe2",
                "title": "International Orders",
                "content": "<p>Cross-border orders may be subject to local import duties. These are managed by the recipient.</p>"
            }
        ]
    },
    {
        "type": "cancellation-policy",
        "title": "Cancellation Policy",
        "subtitle": "Flexible processes for order adjustments before your order begins its transit.",
        "lastUpdated": "April 6, 2026",
        "heroIcon": "Zap",
        "insights": [
            {"icon": "Zap", "title": "Instant Cancel", "description": "Orders can be canceled instantly before the packaging process begins."},
            {"icon": "Clock", "title": "Timing", "description": "A 12-hour grace period for all standard orders to be modified or halted."},
            {"icon": "AlertCircle", "title": "Exceptions", "description": "Customized or personalized items cannot be canceled once production starts."},
            {"icon": "RefreshCcw", "title": "Credit Reversal", "description": "Canceled orders result in immediate credit reversal to your original method."}
        ],
        "sections": [
            {
                "id": "how-to-cancel",
                "icon": "XSquare",
                "title": "Initiating Cancellation",
                "content": "<p>Navigate to 'My Orders' and select the 'Cancel Order' option before the status changes to 'Fufilled'.</p>"
            }
        ]
    }
]

def seed_proper_data():
    print("Initiating Professional Seeding Process for Policy Data...")
    for policy in POLICIES:
        try:
            print(f"Synchronizing {policy['title']}... ", end="")
            res = requests.put(f"{BASE_URL}/{policy['type']}", json=policy)
            if res.status_code == 200:
                print("SUCCESS.")
            else:
                print(f"FAILED (Status: {res.status_code})")
        except Exception as e:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    seed_proper_data()

if __name__ == "__main__":
    seed_proper_data()
