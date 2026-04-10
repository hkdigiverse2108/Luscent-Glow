import requests
import json
from datetime import datetime

def seed_registry():
    url = "http://127.0.0.1:5172/api/footer/"
    
    FOOTER_DATA = {
        "brandDescription": "Elevate your beauty routine with our premium, cruelty-free cosmetics. Crafted with love, powered by nature.",
        "email": "hello@luscentglow.com",
        "phone": "+91 97126 63607",
        "socials": [
            {"platform": "Instagram", "url": "#", "icon": "Instagram"},
            {"platform": "Facebook", "url": "#", "icon": "Facebook"},
            {"platform": "Youtube", "url": "#", "icon": "Youtube"},
            {"platform": "Twitter", "url": "#", "icon": "Twitter"}
        ],
        "columns": [
            {
                "title": "Information",
                "links": [
                    {"label": "About Us", "path": "/about"},
                    {"label": "Contact Us", "path": "/contact"},
                    {"label": "FAQ's", "path": "/faq"},
                    {"label": "Blogs", "path": "/blogs"},
                    {"label": "Track Your Order", "path": "/track-order"}
                ]
            },
            {
                "title": "Policies",
                "links": [
                    {"label": "Return & Refund", "path": "/return-policy"},
                    {"label": "Privacy Policy", "path": "/privacy-policy"},
                    {"label": "Terms & Conditions", "path": "/terms-and-conditions"},
                    {"label": "Shipping Policy", "path": "/shipping-policy"},
                    {"label": "Cancellation Policy", "path": "/cancellation-policy"}
                ]
            }
        ],
        "newsletterTitle": "Beauty Line",
        "newsletterSubtitle": "Curated aesthetics & beauty tips straight to your inbox.",
        "copyrightText": f"© {datetime.now().year} Luscent Glow. All rights reserved."
    }

    print(f"[*] Force-Syncing Registry: {url}")
    try:
        response = requests.put(url, json=FOOTER_DATA, timeout=10)
        print(f"[*] Response Status: {response.status_code}")
        if response.ok:
            print("[✔] Registry Reconstructed Successfully with 7-Link Information and 5-Link Policies!")
        else:
            print(f"[!] Reconstruction Failed: {response.text}")
    except Exception as e:
        print(f"[!] Sanctuary Critical Error: {e}")

if __name__ == "__main__":
    seed_registry()
