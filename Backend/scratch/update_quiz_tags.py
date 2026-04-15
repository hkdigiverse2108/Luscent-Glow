import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def run():
    load_dotenv('Backend/.env')
    uri = os.getenv('MONGODB_URL')
    db_name = os.getenv('DATABASE_NAME', 'luscent_glow_db')
    if not uri:
        print("Error: MONGODB_URL not found in environment")
        return
        
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    # Update 'routine' quiz step options with appropriate tags
    # The Minimalist -> minimalist
    # Golden Balance -> balanced
    # The Maximalist -> maximalist
    
    # First, find the document to get the correct structure
    step = await db.quiz_steps.find_one({"stepId": "routine"})
    if not step:
        print("Error: 'routine' step not found")
        return
        
    options = step.get('options', [])
    if len(options) >= 3:
        options[0]['recommendedTag'] = 'minimalist'
        options[1]['recommendedTag'] = 'balanced'
        options[2]['recommendedTag'] = 'maximalist'
        
        result = await db.quiz_steps.update_one(
            {"stepId": "routine"},
            {"$set": {"options": options}}
        )
        if result.modified_count == 1:
            print("Successfully updated 'routine' quiz tags to: minimalist, balanced, maximalist")
        else:
            print("No changes made (tags might already be set)")
    else:
        print(f"Error: Expected 3 options, found {len(options)}")

if __name__ == "__main__":
    asyncio.run(run())
