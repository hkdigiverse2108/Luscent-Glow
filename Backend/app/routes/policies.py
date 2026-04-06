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
            "subtitle": "Your trust is the foundation of our commitment to you.",
            "lastUpdated": "March 30, 2026",
            "insights": [
                {"icon": "Shield", "title": "Data Protection", "description": "We use industry-standard encryption to protect your personal information at all times."},
                {"icon": "Eye", "title": "Full Transparency", "description": "You have complete control over how your data is collected and used."},
                {"icon": "Lock", "title": "Secure Access", "description": "Only authorized personnel have access to your data for fulfillment purposes."},
                {"icon": "Globe", "title": "Privacy Rights", "description": "We respect all regional data protection regulations (GDPR, CCPA, etc.)."}
            ],
            "sections": [
                {
                    "id": "collection",
                    "title": "Information We Collect",
                    "content": "<p>When you visit Luscent Glow, we collect certain information to provide you with a personalized experience. This includes:</p><ul class=\"list-disc pl-6 space-y-2\"><li><strong>Personal Data:</strong> Name, email address, shipping address, and payment information provided during checkout.</li><li><strong>Usage Data:</strong> Information on how you interact with our website, including pages visited and products viewed.</li><li><strong>Device Data:</strong> IP address, browser type, and device identifiers to optimize our technical performance.</li></ul>"
                },
                {
                    "id": "usage",
                    "title": "How We Use Your Data",
                    "content": "<p>Your information is used to ensure a seamless skincare journey, including:</p><ul class=\"list-disc pl-6 space-y-2\"><li>Processing and fulfilling your orders.</li><li>Communicating order updates and promotional offers (if opted-in).</li><li>Improving our website and product offerings through analytics.</li><li>Preventing fraudulent activities and ensuring platform security.</li></ul>"
                },
                {
                    "id": "sharing",
                    "title": "Third-Party Sharing",
                    "content": "We never sell your personal data to third parties. We only share information with trusted service providers who assist us in operating our website, conducting our business, or servicing you, provided they agree to keep this information confidential."
                },
                {
                    "id": "rights",
                    "title": "Your Rights",
                    "content": "You have the right to access, correct, or delete your personal information at any time. Simply contact us via our concierge service or through the settings in your account profile."
                }
            ]
        },
        "terms-and-conditions": {
            "type": "terms-and-conditions",
            "title": "Terms & Conditions",
            "subtitle": "The principles that guide our relationship with you.",
            "lastUpdated": "March 30, 2026",
            "insights": [
                {"icon": "FileText", "title": "Agreement", "description": "By using our platform, you agree to comply with our terms and standards."},
                {"icon": "UserCheck", "title": "User Conduct", "description": "We expect a respectful and honest community of skincare enthusiasts."},
                {"icon": "ShieldAlert", "title": "Liability", "description": "We strive for excellence but are not responsible for certain unforeseen events."},
                {"icon": "Award", "title": "Fair Usage", "description": "Our content and branding are protected by intellectual property laws."}
            ],
            "sections": [
                {
                    "id": "acceptance",
                    "title": "Acceptance of Terms",
                    "content": "Welcome to Luscent Glow. By accessing and using our website, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please refrain from using our platform."
                },
                {
                    "id": "intellectual",
                    "title": "Intellectual Property",
                    "content": "<p>All content on this website, including text, graphics, logos, images, and software, is the property of Luscent Glow and is protected by copyright and intellectual property laws.</p><ul class=\"list-disc pl-6 space-y-2\"><li><strong>Permitted Use:</strong> You may access our website only for personal, non-commercial use.</li><li><strong>Restrictions:</strong> Any reproduction, modification, or distribution of our content without express written consent is strictly prohibited.</li></ul>"
                },
                {
                    "id": "user-accounts",
                    "title": "User Accounts",
                    "content": "When creating an account, you are responsible for maintaining the confidentiality of your credentials. You agree to accept responsibility for all activities that occur under your account."
                },
                {
                    "id": "liability",
                    "title": "Limitation of Liability",
                    "content": "Luscent Glow will not be liable for any damages arising out of your use of our platform. While we strive to provide the most accurate skincare guidance, our products and advice are for aesthetic purposes and do not replace professional medical advice."
                },
                {
                    "id": "governing",
                    "title": "Governing Law",
                    "content": "These Terms and Conditions are governed by the laws of the jurisdiction in which we operate, and any disputes will be subject to the courts of that jurisdiction."
                }
            ]
        },
        "return-policy": {
            "type": "return-policy",
            "title": "Return & Refund",
            "subtitle": "Ensuring your satisfaction with every luminous drop.",
            "lastUpdated": "March 30, 2026",
            "insights": [
                {"icon": "RefreshCcw", "title": "30-Day Window", "description": "You have 30 days from the date of delivery to initiate a return or exchange."},
                {"icon": "ShieldCheck", "title": "Quality Promise", "description": "Items must be in original condition or at least 50% full to be eligible for a refund."},
                {"icon": "Mail", "title": "Seamless Support", "description": "Our Glow Concierge is available 24/7 to guide you through the return process."},
                {"icon": "HelpCircle", "title": "Easy Refunds", "description": "Refunds are processed back to your original payment method within 7-10 business days."}
            ],
            "sections": [
                {
                    "id": "eligibility",
                    "title": "Eligibility for Returns",
                    "content": "<p>At Luscent Glow, we want you to be completely satisfied with your skincare journey. If a product doesn't meet your expectations, we accept returns on items that are in their original packaging or have been used for less than 50% of their volume.</p><p>Please note that promotional items, gift cards, and certain limited-edition sets are non-refundable unless defective.</p>"
                },
                {
                    "id": "process",
                    "title": "The Return Process",
                    "content": "<p>Initiating a return is simple. Please follow these steps:</p><ul class=\"list-disc pl-6 space-y-2\"><li>Contact our concierge at support@luscentglow.com with your order number.</li><li>Once approved, you will receive a prepaid return shipping label via email.</li><li>Securely pack the items in the original box if possible.</li><li>Drop off the package at any authorized carrier location.</li></ul>"
                },
                {
                    "id": "refunds",
                    "title": "Refund Timeline",
                    "content": "Once your return is received and inspected, we will send you an email notification. Approved refunds will be processed immediately and will automatically be applied to your original method of payment within 7-10 business days, depending on your financial institution."
                },
                {
                    "id": "exchanges",
                    "title": "Exchanges",
                    "content": "We only replace items if they are defective or damaged during transit. If you need to exchange an item for a different variant, please contact our concierge team for assistance."
                }
            ]
        },
        "shipping-policy": {
            "type": "shipping-policy",
            "title": "Shipping Policy",
            "subtitle": "Ensuring a smooth, elegant journey to your doorstep.",
            "lastUpdated": "March 30, 2026",
            "insights": [
                {"icon": "Zap", "title": "Fast Dispatch", "description": "Orders are processed and dispatched within 1-2 business days of confirmation."},
                {"icon": "PackageCheck", "title": "Glow Priority", "description": "Get expedited 1-2 day delivery with our priority shipping option."},
                {"icon": "Truck", "title": "Eco-Shipping", "description": "Our carbon-neutral shipping partners ensure a sustainable journey for your glow."},
                {"icon": "Globe2", "title": "Tracking", "description": "Receive real-time tracking updates via email as soon as your order leaves our facility."}
            ],
            "sections": [
                {
                    "id": "processing",
                    "title": "Order Processing Time",
                    "content": "Thank you for joining the Luscent Glow community. All orders are processed within 1-2 business days (excluding weekends and holidays). You will receive a confirmation email once your order has been successfully placed, followed by a tracking number once dispatched."
                },
                {
                    "id": "rates",
                    "title": "Shipping Rates & Delivery Estimates",
                    "content": "<p>We offer two tiers of shipping to accommodate your schedule:</p><ul class=\"list-disc pl-6 space-y-2\"><li><strong>Standard Glow:</strong> 3-5 business days. Free for all orders over $75.</li><li><strong>Priority Radiance:</strong> 1-2 business days. Available for a flat rate of $15.</li></ul>"
                },
                {
                    "id": "international",
                    "title": "International Shipping",
                    "content": "We currently ship to select global locations. International delivery times vary (typically 7-14 business days). Please note that international orders may be subject to import duties and taxes, which are the responsibility of the recipient."
                },
                {
                    "id": "order-tracking",
                    "title": "Tracking Your Order",
                    "content": "As soon as your order has been dispatched, you'll receive a shipping confirmation email featuring a tracking number. You can monitor your package's journey through our website's tracking portal or directly through the carrier's link."
                },
                {
                    "id": "damages",
                    "title": "Lost or Damaged Items",
                    "content": "Luscent Glow is not liable for products damaged or lost during shipping. However, if your order arrives damaged, please save all packaging materials and damaged goods before filing a claim with the carrier and contacting our concierge team for assistance."
                }
            ]
        },
        "cancellation-policy": {
            "type": "cancellation-policy",
            "title": "Cancellation Policy",
            "subtitle": "Flexible guidance for your changing beauty needs.",
            "lastUpdated": "March 30, 2026",
            "insights": [
                {"icon": "Clock", "title": "6-Hour Window", "description": "Cancel your order within 6 hours of placement for a full, immediate refund."},
                {"icon": "XCircle", "title": "No Hassle", "description": "Cancellations are easy and direct through your account or our concierge email."},
                {"icon": "CheckCircle2", "title": "Quick Approval", "description": "Once requested within the timeframe, your cancellation is approved automatically."},
                {"icon": "CreditCard", "title": "Instant Refund", "description": "Funds are released back to your original payment method immediately upon approval."}
            ],
            "sections": [
                {
                    "id": "window",
                    "title": "Cancellation Window",
                    "content": "We understand that plans can change. To ensure our fulfillment process remains efficient, we offer a 6-hour window from the time of order placement to cancel your order and receive a full refund."
                },
                {
                    "id": "how-to",
                    "title": "How to Cancel",
                    "content": "<p>Please use one of the following methods to cancel your order:</p><ul class=\"list-disc pl-6 space-y-2\"><li>Log in to your account and select \"Cancel Order\" in your order history.</li><li>Email our concierge at support@luscentglow.com with your order number.</li></ul>"
                },
                {
                    "id": "after-window",
                    "title": "Cancellations After 6 Hours",
                    "content": "Once the 6-hour window has passed, our team has likely begun the fulfillment process. In this case, we are unable to cancel the order. However, you are still eligible to return the items for a refund once they arrive, in accordance with our Return Policy."
                },
                {
                    "id": "refunds",
                    "title": "Refund Process",
                    "content": "Once a cancellation is confirmed, your refund will be initiated immediately. Depending on your bank or credit card issuer, it may take 5-7 business days for the funds to reflect in your account."
                },
                {
                    "id": "pre-orders",
                    "title": "Pre-Orders & Limited Releases",
                    "content": "Please note that pre-ordered items or certain limited-edition releases may have specific cancellation terms, which will be clearly stated at the time of purchase."
                }
            ]
        }
    }
    return defaults.get(policy_type)

@router.get("/{policy_type}", response_description="Get a specific policy", response_model=PolicyModel)
async def get_policy(policy_type: str):
    db = await get_database()
    policy = await db["policies"].find_one({"type": policy_type})
    if not policy:
        default_policy = get_default_policy(policy_type)
        if not default_policy:
            raise HTTPException(status_code=404, detail=f"Policy type '{policy_type}' not found")
        return default_policy
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
    return result
