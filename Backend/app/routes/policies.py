from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import PolicyModel
from datetime import datetime
from typing import Dict

router = APIRouter(prefix="/policies", tags=["Policies"])

def get_default_policy(policy_type: str) -> Dict:
    """
    Returns default content for a policy if not found in the database.
    """
    defaults = {
        "privacy-policy": {
            "type": "privacy-policy",
            "title": "Privacy Policy",
            "subtitle": "Your privacy is our priority. We handle your data with care.",
            "lastUpdated": "April 10, 2026",
            "insights": [
                {"icon": "Shield", "title": "Data Safety", "description": "We use strong encryption to keep your personal information secure at all times."},
                {"icon": "Eye", "title": "Clear Choice", "description": "You decide how your information is used. No hidden data harvesting."},
                {"icon": "Lock", "title": "Secure Only", "description": "Only the people fulfilling your order can ever see your details."},
                {"icon": "Globe", "title": "Global Ready", "description": "We follow all major privacy laws so you can shop with total confidence."}
            ],
            "sections": [
                {
                    "id": "collection",
                    "title": "What We Collect",
                    "content": "<p>We only collect what we need to deliver your products and a better experience:</p><ul class=\"list-disc pl-6 space-y-2\"><li><strong>Details:</strong> Name, email, and address for shipping.</li><li><strong>Interaction:</strong> Which products you like so we can show you better recommendations.</li><li><strong>Technical:</strong> Basic device info to make sure our site runs smoothly for you.</li></ul>"
                },
                {
                    "id": "usage",
                    "title": "How We Use It",
                    "content": "<p>Your data helps us serve you better:</p><ul class=\"list-disc pl-6 space-y-2\"><li>Processing and shipping your orders.</li><li>Sending order updates and news (only if you want them).</li><li>Making our products and website better every day.</li><li>Keeping our shop safe and secure for everyone.</li></ul>"
                },
                {
                    "id": "sharing",
                    "title": "Sharing Data",
                    "content": "We do not sell your data. We only share it with trusted partners—like delivery services—who help us get your order to you. They are legally required to keep your info private."
                },
                {
                    "id": "rights",
                    "title": "Your Control",
                    "content": "You own your data. You can ask us to see, change, or delete your info at any time. Just reach out through our support chat or email—we'll handle it immediately."
                }
            ]
        },
        "terms-and-conditions": {
            "type": "terms-and-conditions",
            "title": "Terms & Conditions",
            "subtitle": "Clear and simple rules for a respectful shopping experience.",
            "lastUpdated": "April 10, 2026",
            "insights": [
                {"icon": "FileText", "title": "Agreement", "description": "By using our site, you agree to follow these simple community rules."},
                {"icon": "UserCheck", "title": "Respect", "description": "We expect all our beauty enthusiasts to be honest and respectful."},
                {"icon": "ShieldAlert", "title": "Fairness", "description": "We work hard for perfection but can't be held responsible for system outages."},
                {"icon": "Award", "title": "Our Brand", "description": "Our designs and content are our own—please don't copy without asking."}
            ],
            "sections": [
                {
                    "id": "acceptance",
                    "title": "Accepting These Rules",
                    "content": "Welcome to Luscent Glow. By using our website, you're agreeing to these terms. If you don't agree, please don't use the site. It's as simple as that."
                },
                {
                    "id": "intellectual",
                    "title": "Our Content",
                    "content": "Everything you see here—text, logos, and images—belongs to us. You can use it for your personal shopping, but you cannot copy or use it for business without our written permission."
                },
                {
                    "id": "user-accounts",
                    "title": "Your Account",
                    "content": "If you create an account, keep your password safe. You are responsible for everything that happens under your account."
                },
                {
                    "id": "liability",
                    "title": "Our Responsibility",
                    "content": "We provide premium skincare guidance, but it doesn't replace a doctor's advice. We aren't responsible for how you use the products or if the system has a temporary glitch."
                },
                {
                    "id": "governing",
                    "title": "Disputes",
                    "content": "If we ever have a legal disagreement, it will be handled by the local courts in our headquarters' jurisdiction."
                }
            ]
        },
        "return-policy": {
            "type": "return-policy",
            "title": "Return & Refund",
            "subtitle": "Shop with confidence. We've got you covered.",
            "lastUpdated": "April 10, 2026",
            "insights": [
                {"icon": "RefreshCcw", "title": "30 Days", "description": "You have 30 full days from delivery to decide if a product is right for you."},
                {"icon": "ShieldCheck", "title": "Easy Returns", "description": "We accept returns on items that are mostly full and in good condition."},
                {"icon": "Mail", "title": "Fast Support", "description": "Our support team is always ready to help you with your return request."},
                {"icon": "HelpCircle", "title": "Quick Refunds", "description": "Once approved, your money goes back to you within 7-10 business days."}
            ],
            "sections": [
                {
                    "id": "eligibility",
                    "title": "When Can You Return?",
                    "content": "<p>We want you to love your glow. If you aren't happy, you can return products that are mostly unused (at least half full) within 30 days.</p><p>Please note: Gift cards and sale items are usually final sale unless they arrive damaged.</p>"
                },
                {
                    "id": "process",
                    "title": "How to Return",
                    "content": "<p>Returning is easy:</p><ul class=\"list-disc pl-6 space-y-2\"><li>Email us at support@luscentglow.com with your order number.</li><li>We'll send you a prepaid shipping label.</li><li>Pack it up and drop it at the carrier.</li></ul>"
                },
                {
                    "id": "refunds",
                    "title": "Getting Your Money Back",
                    "content": "Once we receive your return, we'll check it and send you an email. If everything looks good, we'll refund your original payment method within 7-10 business days."
                },
                {
                    "id": "exchanges",
                    "title": "Swapping Products",
                    "content": "If your product arrives damaged, we'll replace it for free. If you just want a different item, contact us and we'll help you set up a swap."
                }
            ]
        },
        "shipping-policy": {
            "type": "shipping-policy",
            "title": "Shipping Policy",
            "subtitle": "Safe, fast, and elegant delivery to your doorstep.",
            "lastUpdated": "April 10, 2026",
            "insights": [
                {"icon": "Zap", "title": "Fast Shipping", "description": "We pack and ship your orders within 1-2 business days."},
                {"icon": "PackageCheck", "title": "Priority Glow", "description": "Need it fast? Choose our priority shipping for 1-2 day delivery."},
                {"icon": "Truck", "title": "Eco-Friendly", "description": "We use sustainable shipping partners to reduce our carbon footprint."},
                {"icon": "Globe2", "title": "Tracking", "description": "You'll get a tracking link the moment your package leaves our shop."}
            ],
            "sections": [
                {
                    "id": "processing",
                    "title": "Packing Time",
                    "content": "We move fast. Most orders are packed and ready to go within 1-2 business days. You'll get an email tracking link as soon as it's on the truck."
                },
                {
                    "id": "rates",
                    "title": "Costs & Timing",
                    "content": "<p>We offer two simple shipping options:</p><ul class=\"list-disc pl-6 space-y-2\"><li><strong>Standard:</strong> 3-5 days. Free on all orders over $75!</li><li><strong>Priority:</strong> 1-2 days. Available for a flat $15 fee.</li></ul>"
                },
                {
                    "id": "international",
                    "title": "Global Shipping",
                    "content": "We ship worldwide! International orders usually take 7-14 days. Just keep in mind that local custom fees are handled by the customer."
                },
                {
                    "id": "tracking",
                    "title": "Keep an Eye on It",
                    "content": "Check your email for your tracking number. You can track your package right here on our website or through the carrier's link."
                },
                {
                    "id": "damages",
                    "title": "Lost or Damaged",
                    "content": "If your package is lost or arrives damaged, don't worry. Contact us immediately and we'll work with the carrier to make it right for you."
                }
            ]
        },
        "cancellation-policy": {
            "type": "cancellation-policy",
            "title": "Cancellation Policy",
            "subtitle": "Easy changes for your evolving beauty ritual.",
            "lastUpdated": "April 10, 2026",
            "insights": [
                {"icon": "Clock", "title": "6-Hour Window", "description": "Cancel within 6 hours of ordering for a full, instant refund."},
                {"icon": "XCircle", "title": "No Stress", "description": "Cancel easily through your account settings or a quick email."},
                {"icon": "CheckCircle2", "title": "Auto-Approve", "description": "If you're within the 6-hour window, your request is approved instantly."},
                {"icon": "CreditCard", "title": "Instant Refund", "description": "We release your funds back to you the moment you cancel."}
            ],
            "sections": [
                {
                    "id": "window",
                    "title": "The Cancellation Window",
                    "content": "Changed your mind? No problem. You have 6 hours from the moment you place your order to cancel it for a full, guaranteed refund."
                },
                {
                    "id": "how-to",
                    "title": "How to Cancel",
                    "content": "<p>You have two easy options:</p><ul class=\"list-disc pl-6 space-y-2\"><li>Go to your \"Order History\" and click \"Cancel Order\".</li><li>Email us at support@luscentglow.com with your order number.</li></ul>"
                },
                {
                    "id": "after-window",
                    "title": "After 6 Hours",
                    "content": "After 6 hours, we've already started packing your ritual. While we can't cancel it then, you can still return it for a refund once it arrives."
                },
                {
                    "id": "refunds",
                    "title": "Getting Your Refund",
                    "content": "We release your funds to your bank immediately. It usually takes 5-7 days for your bank to show it in your account."
                }
            ]
        }
    }
    return defaults.get(policy_type)

@router.get("/", response_description="List all policies", response_model=list[PolicyModel])
async def list_policies():
    db = await get_database()
    policies_cursor = db["policies"].find({})
    policies = await policies_cursor.to_list(length=100)
    
    # Process for visualization
    for p in policies:
        p["id"] = str(p["_id"])
        if "_id" in p:
            del p["_id"]
        
    # Merge with defaults that aren't in the DB yet
    db_types = {p["type"] for p in policies}
    defaults = {
        "privacy-policy", 
        "terms-and-conditions", 
        "return-policy", 
        "shipping-policy", 
        "cancellation-policy"
    }
    
    for d_type in defaults:
        if d_type not in db_types:
            default_p = get_default_policy(d_type)
            if default_p:
                policies.append(default_p)
                
    return policies

@router.get("/{policy_type}", response_description="Get a specific policy", response_model=PolicyModel)
async def get_policy(policy_type: str):
    db = await get_database()
    policy = await db["policies"].find_one({"type": policy_type})
    if not policy:
        default_policy = get_default_policy(policy_type)
        if not default_policy:
            raise HTTPException(status_code=404, detail=f"Policy type '{policy_type}' not found")
        return default_policy
    
    policy["id"] = str(policy["_id"])
    if "_id" in policy:
        del policy["_id"]
    return policy

@router.put("/{policy_type}", response_description="Update or create a policy", response_model=PolicyModel)
async def update_policy(policy_type: str, policy: PolicyModel):
    db = await get_database()
    
    policy_dict = policy.model_dump(by_alias=True, exclude=["id"])
    policy_dict["type"] = policy_type
    policy_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    result = await db["policies"].find_one_and_update(
        {"type": policy_type}, 
        {"$set": policy_dict}, 
        upsert=True, 
        return_document=True
    )
    if result:
        result["id"] = str(result["_id"])
        if "_id" in result:
            del result["_id"]
    return result

@router.delete("/{policy_type}", response_description="Delete a policy")
async def delete_policy(policy_type: str):
    db = await get_database()
    
    result = await db["policies"].delete_one({"type": policy_type})
    
    if result.deleted_count == 1:
        return {"message": f"Policy '{policy_type}' has been purged from the sanctuary."}
    
    raise HTTPException(status_code=404, detail=f"Policy '{policy_type}' not found in archives.")
