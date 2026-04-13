import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

async def get_db_creds():
    url = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
    client = AsyncIOMotorClient(url)
    db = client['luscent_glow_db']
    creds = await db["shiprocket_credentials"].find_one({})
    client.close()
    return creds

async def get_token(email, password):
    url = "https://apiv2.shiprocket.in/v1/external/auth/login"
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={"email": email, "password": password})
        if response.status_code == 200:
            return response.json().get("token")
        return None

async def test_adhoc(token):
    url = "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc"
    
    # Try the MINIMALIST version
    payload = {
        "order_id": "TEST-" + os.urandom(4).hex(),
        "order_date": "2026-04-13 17:10",
        "pickup_location": "Primary",
        "billing_customer_name": "Test",
        "billing_last_name": "User",
        "billing_address": "123 Main Street Road near Park Lane",
        "billing_city": "Surat",
        "billing_pincode": "395007",
        "billing_state": "Gujarat",
        "billing_country": "India",
        "billing_email": "test@example.com",
        "billing_phone": "9999999999",
        "shipping_is_billing": True,
        "order_items": [{
            "name": "Test Product",
            "sku": "SKU-001",
            "units": 1,
            "selling_price": 500
        }],
        "payment_method": "Prepaid",
        "sub_total": 500
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers={"Authorization": f"Bearer {token}"})
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

async def list_pickup_locations(token):
    url = "https://apiv2.shiprocket.in/v1/external/settings/get/pickup"
    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"Pickup Locations Status: {response.status_code}")
        print(f"Pickup Locations: {response.text}")

async def run():
    creds = await get_db_creds()
    if not creds:
        print("No creds in DB")
        return
    
    email = creds.get("shiprocketEmail")
    password = creds.get("shiprocketPassword")
    
    token = await get_token(email, password)
    if not token:
        print(f"Failed to get token for {email}")
        return
        
    await list_pickup_locations(token)
    await test_adhoc(token)

if __name__ == "__main__":
    asyncio.run(run())
