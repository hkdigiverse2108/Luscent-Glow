import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add app directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "luscent_glow_db"

initial_steps = [
    {
        "stepId": "skinType",
        "question": "How would you describe your current skin state?",
        "order": 1,
        "options": [
            { "id": "dry", "label": "Dry & Dehydrated", "sub": "Feels tight, looks dull", "icon": "💧", "recommendedTag": "hydration" },
            { "id": "oily", "label": "Oily & Shiny", "sub": "Excess sebum, enlarged pores", "icon": "✨", "recommendedTag": "matte" },
            { "id": "combination", "label": "Combination", "sub": "Oily T-zone, dry cheeks", "icon": "🌓", "recommendedTag": "skin-care" },
            { "id": "sensitive", "label": "Sensitive", "sub": "Prone to redness, reactive", "icon": "🌸", "recommendedTag": "sensitive" }
        ]
    },
    {
        "stepId": "concern",
        "question": "What is your primary focus at the moment?",
        "order": 2,
        "options": [
            { "id": "glow", "label": "Radiance & Glow", "sub": "Revive tired, dull complexion", "icon": "✨", "recommendedTag": "vitamin-c" },
            { "id": "aging", "label": "Aging Gracefully", "sub": "Fine lines, loss of firmness", "icon": "⏳", "recommendedTag": "anti-aging" },
            { "id": "acne", "label": "Clarifying", "sub": "Blemishes, texture, congestion", "icon": "🧼", "recommendedTag": "repair" },
            { "id": "recovery", "label": "Barrier Recovery", "sub": "Soothing, deep nourishment", "icon": "🛡️", "recommendedTag": "barrier" }
        ]
    },
    {
        "stepId": "routine",
        "question": "What is your preferred ritual style?",
        "order": 3,
        "options": [
            { "id": "minimal", "label": "The Minimalist", "sub": "3 essential steps max", "icon": "⚪", "recommendedTag": None },
            { "id": "balanced", "label": "Golden Balance", "sub": "The perfect 5-step flow", "icon": "🌅", "recommendedTag": None },
            { "id": "luxury", "label": "The Maximalist", "sub": "Full 10-step immersion", "icon": "💎", "recommendedTag": None }
        ]
    }
]

async def seed_quiz():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    collection = db["quiz_steps"]
    
    # Clear existing steps
    await collection.delete_many({})
    
    # Insert initial steps
    result = await collection.insert_many(initial_steps)
    print(f"Successfully seeded {len(result.inserted_ids)} quiz steps.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_quiz())
