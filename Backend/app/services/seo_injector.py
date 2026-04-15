import os
import re
from ..database import get_database
from bson import ObjectId

# Path to the index.html file relative to this file
# Backend/app/services/seo_injector.py -> ../../../../Frontend/index.html
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
INDEX_HTML_PATH = os.path.join(BASE_DIR, "Frontend", "index.html")

async def get_seo_data(path: str):
    db = await get_database()
    if db is None:
        return None

    # Default fallback from global settings
    global_settings = await db["global_settings"].find_one({})
    default_seo = global_settings.get("seo") if global_settings else None

    seo = None

    # 1. Product Detail: /product/{id}
    product_match = re.match(r"^/product/([a-f\d]{24})$", path)
    if product_match:
        product_id = product_match.group(1)
        product = await db["products"].find_one({"_id": ObjectId(product_id)})
        if product:
            seo = product.get("seo")
            if not seo:
                seo = {
                    "title": f"{product.get('name', 'Product')} | {product.get('brand', 'Luscent Glow')}",
                    "description": product.get("description", "")[:160],
                    "ogImage": product.get("image")
                }

    # 2. Blog Detail: /blogs/{id}
    elif re.match(r"^/blogs/([a-f\d]{24})$", path):
        blog_match = re.match(r"^/blogs/([a-f\d]{24})$", path)
        blog_id = blog_match.group(1)
        blog = await db["blog_posts"].find_one({"_id": ObjectId(blog_id)})
        if blog:
            seo = blog.get("seo")
            if not seo:
                seo = {
                    "title": f"{blog.get('title', 'Story')} | Luscent Glow",
                    "description": blog.get("excerpt", "")[:160],
                    "ogImage": blog.get("image")
                }

    # 3. Blogs Listing: /blogs
    elif path == "/blogs":
        blog_settings = await db["blog_settings"].find_one({})
        if blog_settings:
            seo = blog_settings.get("seo")

    # 4. About: /about
    elif path == "/about":
        about_settings = await db["about_settings"].find_one({})
        if about_settings:
            seo = about_settings.get("seo")

    # 5. Contact: /contact
    elif path == "/contact":
        contact_settings = await db["contact_settings"].find_one({})
        if contact_settings:
            seo = contact_settings.get("seo")

    # 6. FAQ: /faq
    elif path == "/faq":
        faq_settings = await db["faq_settings"].find_one({})
        if faq_settings:
            seo = faq_settings.get("seo")

    # 7. Gift Cards: /gift-cards
    elif path == "/gift-cards":
        gc_settings = await db["gift_card_settings"].find_one({})
        if gc_settings:
            seo = gc_settings.get("seo")

    # 8. Bulk Orders: /bulk-orders
    elif path == "/bulk-orders":
        bo_settings = await db["bulk_order_settings"].find_one({})
        if bo_settings:
            seo = bo_settings.get("seo")

    # 9. Home: /
    elif path == "/" or path == "":
        home_settings = await db["home_settings"].find_one({})
        if home_settings:
            seo = home_settings.get("seo")

    # Merge with default if needed
    if not seo:
        seo = default_seo
    
    # Fill missing fields from default
    if default_seo and seo:
        for key in ["title", "description", "keywords", "ogImage"]:
            if not seo.get(key) and default_seo.get(key):
                seo[key] = default_seo[key]

    # Hardcoded per-route fallbacks for when DB has no SEO data
    ROUTE_FALLBACKS = {
        "/blogs": {
            "title": "Journal & Blogs | Luscent Glow",
            "description": "Explore beauty rituals, skincare wisdom, and botanical radiance stories from the Luscent Glow editorial team.",
            "keywords": "beauty blog, skincare tips, botanical beauty, luscent glow journal",
        },
        "/about": {
            "title": "About Us | Luscent Glow",
            "description": "Discover the story behind Luscent Glow — premium, cruelty-free botanical skincare crafted for your authentic brilliance.",
            "keywords": "about luscent glow, botanical skincare brand, cruelty-free beauty",
        },
        "/contact": {
            "title": "Contact Us | Luscent Glow",
            "description": "Get in touch with the Luscent Glow team. We're here to help with your skincare journey.",
            "keywords": "contact luscent glow, customer support, beauty help",
        },
        "/": {
            "title": "Luscent Glow | Pure Botanical Radiance",
            "description": "Elevate your beauty routine with Luscent Glow. Discover premium, cruelty-free botanical skincare and artisanal makeup.",
            "keywords": "skincare, beauty, botanical, cruelty-free, luscent glow",
        },
    }

    fallback = ROUTE_FALLBACKS.get(path, {})
    if fallback:
        for key, val in fallback.items():
            if not seo or not seo.get(key):
                if seo is None:
                    seo = {}
                seo[key] = val

    return seo if seo else None

def inject_seo(html: str, seo: dict):
    if not seo:
        return html
    
    # Only use non-empty values — skip empty strings
    title = (seo.get("title") or "").strip() or "Luscent Glow | Pure Botanical Radiance"
    description = (seo.get("description") or "").strip() or "Premium, cruelty-free botanical skincare and makeup."
    keywords = (seo.get("keywords") or "").strip() or "skincare, beauty, botanical"
    image = seo.get("ogImage") or "/og-image.png"

    # Replace Title tags
    html = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html)
    html = re.sub(r'<meta property="og:title" content=".*?"', f'<meta property="og:title" content="{title}"', html)
    html = re.sub(r'<meta name="twitter:title" content=".*?"', f'<meta name="twitter:title" content="{title}"', html)

    # Replace Description tags
    html = re.sub(r'<meta name="description" content=".*?"', f'<meta name="description" content="{description}"', html)
    html = re.sub(r'<meta property="og:description" content=".*?"', f'<meta property="og:description" content="{description}"', html)
    html = re.sub(r'<meta name="twitter:description" content=".*?"', f'<meta name="twitter:description" content="{description}"', html)

    # Replace Keywords
    html = re.sub(r'<meta name="keywords" content=".*?"', f'<meta name="keywords" content="{keywords}"', html)

    # Replace Image tags
    html = re.sub(r'<meta property="og:image" content=".*?"', f'<meta property="og:image" content="{image}"', html)
    html = re.sub(r'<meta name="twitter:image" content=".*?"', f'<meta name="twitter:image" content="{image}"', html)

    return html
