from fastapi import APIRouter, Body, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import os
from pathlib import Path
from dotenv import load_dotenv
from app.database import get_database

# Explicitly load the .env file from the Backend directory
_env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

router = APIRouter(prefix="/chat", tags=["AI Assistant"])

SYSTEM_PROMPT = """You are Lumina, the AI Beauty Assistant at Luscent Glow — a premium, cruelty-free beauty sanctuary.

Your persona:
- Warm, sophisticated, and knowledgeable about skincare and beauty
- Speak with elegance — use words like "ritual", "radiance", "glow", "sanctuary", "curated"
- You are an expert in skincare ingredients, routines, and product recommendations
- You genuinely care about each customer's unique skin journey

Your capabilities:
- Help customers find the right products for their skin type and concerns
- Explain skincare ingredients (Vitamin C, Retinol, Hyaluronic Acid, Niacinamide, etc.)
- Build personalized skincare routines (Morning & Evening)
- Answer questions about Luscent Glow products, shipping, returns, and policies
- Provide beauty tips, application techniques, and layering advice

Luscent Glow key facts:
- Free shipping above ₹999
- Use code GLOW15 for 15% off
- Products are cruelty-free, premium quality, and crafted with natural ingredients
- Categories: Skincare, Makeup, Lip Care, Hair Care, Fragrances
- Contact: hello@luscentglow.com | +91 97126 63607

Guidelines:
- Keep responses concise (2-4 sentences max unless asked for details)
- Always be helpful and never make up specific product prices
- If asked about something unrelated to beauty, gently redirect to your expertise
- End with an encouraging note or a gentle question to continue the conversation
- Use 1-2 relevant emojis per response to feel warm and premium
"""

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

@router.post("/", response_description="Get AI beauty concierge response")
async def chat_with_lumina(request: ChatRequest = Body(...)):
    try:
        from google import genai
        from google.genai import types

        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.")

        client = genai.Client(api_key=api_key)

        # Build conversation history
        history = []
        for msg in (request.history or []):
            history.append(
                types.Content(
                    role=msg.role,
                    parts=[types.Part(text=msg.content)]
                )
            )

        # Build Dynamic Context from DB
        db = await get_database()
        
        # Products
        products_cursor = db["products"].find({}, {"name": 1, "price": 1, "category": 1, "stock": 1, "description": 1})
        products_list = await products_cursor.to_list(length=50)
        product_info = "\n".join([f"- {p.get('name')} (Category: {p.get('category', 'N/A')}) - Price: ₹{p.get('price')} - Stock: {p.get('stock')}" for p in products_list])
        
        # Categories
        categories_cursor = db["categories"].find({}, {"name": 1})
        categories_list = await categories_cursor.to_list(length=20)
        cat_info = ", ".join([c.get("name", "") for c in categories_list])
        
        # Global Settings
        global_settings = await db["global_settings"].find_one({}) or {}
        shop_settings = global_settings.get("shop", {})
        shipping_policy = shop_settings.get("shippingPolicy", "Free shipping above ₹999")
        return_policy = shop_settings.get("returnPolicy", "Standard 7-day returns on unopened items.")
        
        dynamic_context = f"""
        
--- LIVE DATABASE INFORMATION ---
Always use this factual information if asked about products, prices, or policies:
Categories Available: {cat_info}

Our Current Products & Prices:
{product_info}

Store Policies:
- Shipping: {shipping_policy}
- Returns: {return_policy}
---------------------------------
"""
        final_system_prompt = SYSTEM_PROMPT + dynamic_context

        # Create chat session and send message
        chat = client.chats.create(
            model="gemini-2.5-flash-lite",
            config=types.GenerateContentConfig(
                system_instruction=final_system_prompt,
                temperature=0.7,
                max_output_tokens=512,
            ),
            history=history,
        )

        response = chat.send_message(request.message)
        reply = response.text

        return {
            "reply": reply,
            "model": "gemini-2.5-flash-lite"
        }

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "API_KEY" in error_msg.upper() or "api key" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Invalid Gemini API key. Please check your configuration.")
        raise HTTPException(status_code=500, detail=f"Lumina is temporarily unavailable: {error_msg}")
