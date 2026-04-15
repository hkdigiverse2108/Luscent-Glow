import os
import re
from ..database import get_database
from bson import ObjectId
from urllib.parse import urlparse, parse_qs

# Path to the index.html file relative to this file
# Backend/app/services/seo_injector.py -> ../../../../Frontend/index.html
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
INDEX_HTML_PATH = os.path.join(BASE_DIR, "Frontend", "index.html")

# ─────────────────────────────────────────────────────────────────────────────
# Hardcoded fallbacks — used when DB has null / empty SEO fields
# Keys must match the URL path (without query string). For /product/:id and
# /blogs/:id we generate dynamic fallbacks from the DB document itself.
# ─────────────────────────────────────────────────────────────────────────────
ROUTE_FALLBACKS: dict = {
    "/": {
        "title": "Luscent Glow | Pure Botanical Radiance",
        "description": "Elevate your beauty routine with Luscent Glow. Discover premium, cruelty-free botanical skincare and artisanal makeup crafted for your authentic brilliance.",
        "keywords": "skincare, beauty, botanical, cruelty-free, luscent glow, botanical skincare",
    },
    "/products": {
        "title": "All Products | Luscent Glow",
        "description": "Discover our full range of premium botanical skincare rituals, serums, oils, and artisanal makeup — crafted for your authentic radiance.",
        "keywords": "botanical skincare products, luxury beauty, cruelty-free skincare, luscent glow shop",
    },
    "/offers": {
        "title": "Exclusive Offers | Luscent Glow",
        "description": "Discover limited-time botanical skincare rituals at special prices. Shop Luscent Glow's handpicked offers and seasonal promotions.",
        "keywords": "skincare offers, beauty discounts, luxury skincare sale, luscent glow promotions",
    },
    "/blogs": {
        "title": "Journal & Blogs | Luscent Glow",
        "description": "Explore beauty rituals, skincare wisdom, and botanical radiance stories from the Luscent Glow editorial team.",
        "keywords": "beauty blog, skincare tips, botanical beauty, luscent glow journal, skincare routines",
    },
    "/about": {
        "title": "About Us | Luscent Glow",
        "description": "Discover the story behind Luscent Glow — premium, cruelty-free botanical skincare crafted for your authentic brilliance.",
        "keywords": "about luscent glow, botanical skincare brand, cruelty-free beauty, skincare philosophy",
    },
    "/contact": {
        "title": "Contact Us | Luscent Glow",
        "description": "Get in touch with the Luscent Glow team. We're here to assist with your skincare journey, orders, and enquiries.",
        "keywords": "contact luscent glow, customer support, beauty help, skincare enquiry",
    },
    "/faq": {
        "title": "Frequently Asked Questions | Luscent Glow",
        "description": "Find answers to common questions about Luscent Glow products, shipping, returns, ingredients, and beauty rituals.",
        "keywords": "luscent glow faq, skincare questions, beauty faq, returns policy, shipping info",
    },
    "/gift-cards": {
        "title": "Gift Cards | Luscent Glow",
        "description": "Give the gift of radiance. Luscent Glow gift cards are perfect for every beauty enthusiast — share the luxury of botanical skincare.",
        "keywords": "beauty gift cards, skincare gift, luscent glow gift, luxury beauty voucher",
    },
    "/bulk-orders": {
        "title": "Bulk & Wholesale Orders | Luscent Glow",
        "description": "Partner with Luscent Glow for bulk and wholesale botanical skincare orders. Ideal for spas, salons, and corporate gifting.",
        "keywords": "bulk skincare orders, wholesale beauty, luscent glow wholesale, corporate gifting skincare",
    },
}


def _val(raw) -> str:
    """Return stripped non-empty string or empty string."""
    return (raw or "").strip()


def _merge(base: dict, override: dict) -> dict:
    """Fill missing/empty keys in base from override."""
    result = dict(base)
    for key, val in override.items():
        if not _val(result.get(key)) and _val(val):
            result[key] = val
    return result


async def get_seo_data(path: str):
    """
    Resolve SEO metadata for a given URL path.
    Priority order:
      1. DB document-specific seo field
      2. DB settings collection seo field
      3. Global settings seo field
      4. Hardcoded ROUTE_FALLBACKS
    """
    db = await get_database()
    if db is None:
        return ROUTE_FALLBACKS.get(path.split("?")[0])

    # Strip query string for route matching, but keep it for category lookup
    parsed = urlparse(path)
    clean_path = parsed.path.rstrip("/") or "/"
    qs = parse_qs(parsed.query)

    # Default fallback from global settings
    global_settings = await db["global_settings"].find_one({})
    global_seo = global_settings.get("seo", {}) if global_settings else {}

    seo: dict = {}

    # ── 1. Product Detail: /product/{id} ──────────────────────────────────────
    product_match = re.match(r"^/product/([a-f\d]{24})$", clean_path)
    if product_match:
        try:
            product = await db["products"].find_one({"_id": ObjectId(product_match.group(1))})
            if product:
                seo = product.get("seo") or {}
                if not _val(seo.get("title")):
                    seo["title"] = f"{product.get('name', 'Product')} | Luscent Glow"
                if not _val(seo.get("description")):
                    seo["description"] = (product.get("description") or "")[:160]
                if not seo.get("ogImage"):
                    seo["ogImage"] = product.get("image")
                if not _val(seo.get("keywords")):
                    seo["keywords"] = f"{product.get('name', '')}, botanical skincare, luscent glow"
        except Exception:
            pass

    # ── 2. Blog Detail: /blogs/{id} ───────────────────────────────────────────
    elif re.match(r"^/blogs/([a-f\d]{24})$", clean_path):
        blog_id = re.match(r"^/blogs/([a-f\d]{24})$", clean_path).group(1)
        try:
            blog = await db["blog_posts"].find_one({"_id": ObjectId(blog_id)})
            if blog:
                seo = blog.get("seo") or {}
                if not _val(seo.get("title")):
                    seo["title"] = f"{blog.get('title', 'Story')} | Luscent Glow"
                if not _val(seo.get("description")):
                    seo["description"] = (blog.get("excerpt") or "")[:160]
                if not seo.get("ogImage"):
                    seo["ogImage"] = blog.get("image")
                if not _val(seo.get("keywords")):
                    seo["keywords"] = f"{blog.get('title', '')}, beauty blog, luscent glow journal"
        except Exception:
            pass

    # ── 3. Products listing: /products (optionally with ?category=slug) ────────
    elif clean_path == "/products":
        cat_slug = (qs.get("category") or [None])[0]
        if cat_slug:
            # Category-specific SEO
            category = await db["categories"].find_one({"slug": cat_slug})
            if category:
                seo = category.get("seo") or {}
                if not _val(seo.get("title")):
                    seo["title"] = f"{category.get('name', cat_slug.title())} | Luscent Glow"
                if not _val(seo.get("description")):
                    seo["description"] = f"Explore our premium {category.get('name', cat_slug)} collection — botanical skincare rituals crafted for radiant skin."
                if not _val(seo.get("keywords")):
                    seo["keywords"] = f"{category.get('name', cat_slug)}, botanical skincare, luscent glow {cat_slug}"

    # ── 4. Offers: /offers ────────────────────────────────────────────────────
    elif clean_path == "/offers":
        promo_settings = await db["promotion_settings"].find_one({})
        if promo_settings:
            seo = promo_settings.get("seo") or {}

    # ── 5. Blogs listing: /blogs ───────────────────────────────────────────────
    elif clean_path == "/blogs":
        blog_settings = await db["blog_settings"].find_one({})
        if blog_settings:
            seo = blog_settings.get("seo") or {}

    # ── 6. About: /about ──────────────────────────────────────────────────────
    elif clean_path == "/about":
        about_settings = await db["about_settings"].find_one({})
        if about_settings:
            seo = about_settings.get("seo") or {}

    # ── 7. Contact: /contact ──────────────────────────────────────────────────
    elif clean_path == "/contact":
        contact_settings = await db["contact_settings"].find_one({})
        if contact_settings:
            seo = contact_settings.get("seo") or {}

    # ── 8. FAQ: /faq ──────────────────────────────────────────────────────────
    elif clean_path == "/faq":
        faq_settings = await db["faq_settings"].find_one({})
        if faq_settings:
            seo = faq_settings.get("seo") or {}

    # ── 9. Gift Cards: /gift-cards ────────────────────────────────────────────
    elif clean_path == "/gift-cards":
        gc_settings = await db["gift_card_settings"].find_one({})
        if gc_settings:
            seo = gc_settings.get("seo") or {}

    # ── 10. Bulk Orders: /bulk-orders ─────────────────────────────────────────
    elif clean_path == "/bulk-orders":
        bo_settings = await db["bulk_order_settings"].find_one({})
        if bo_settings:
            seo = bo_settings.get("seo") or {}

    # ── 11. Home: / ───────────────────────────────────────────────────────────
    elif clean_path in ("/", ""):
        home_settings = await db["home_settings"].find_one({})
        if home_settings:
            seo = home_settings.get("seo") or {}

    # ── Chain: fill empty fields from global_seo then hardcoded fallbacks ─────
    seo = _merge(seo, global_seo)
    fallback = ROUTE_FALLBACKS.get(clean_path, {})
    seo = _merge(seo, fallback)

    return seo if any(_val(v) for v in seo.values() if isinstance(v, str)) else None


def inject_seo(html: str, seo: dict):
    if not seo:
        return html

    # Only use non-empty values — skip empty strings
    title       = _val(seo.get("title"))       or "Luscent Glow | Pure Botanical Radiance"
    description = _val(seo.get("description")) or "Premium, cruelty-free botanical skincare and makeup crafted for your authentic brilliance."
    keywords    = _val(seo.get("keywords"))    or "skincare, beauty, botanical, cruelty-free, luscent glow"
    image       = (seo.get("ogImage") or "").strip() or "/og-image.png"

    # Replace title
    html = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html)
    html = re.sub(r'<meta property="og:title" content=".*?"',       f'<meta property="og:title" content="{title}"',       html)
    html = re.sub(r'<meta name="twitter:title" content=".*?"',      f'<meta name="twitter:title" content="{title}"',      html)

    # Replace description
    html = re.sub(r'<meta name="description" content=".*?"',         f'<meta name="description" content="{description}"',         html)
    html = re.sub(r'<meta property="og:description" content=".*?"',  f'<meta property="og:description" content="{description}"',  html)
    html = re.sub(r'<meta name="twitter:description" content=".*?"', f'<meta name="twitter:description" content="{description}"', html)

    # Replace keywords
    html = re.sub(r'<meta name="keywords" content=".*?"', f'<meta name="keywords" content="{keywords}"', html)

    # Replace OG/Twitter image
    html = re.sub(r'<meta property="og:image" content=".*?"',  f'<meta property="og:image" content="{image}"',  html)
    html = re.sub(r'<meta name="twitter:image" content=".*?"', f'<meta name="twitter:image" content="{image}"', html)

    return html
