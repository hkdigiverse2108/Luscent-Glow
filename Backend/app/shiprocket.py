import httpx
import logging
from typing import Optional, Dict, Any
from .config import settings

logger = logging.getLogger(__name__)

SHIPROCKET_AUTH_URL = "https://apiv2.shiprocket.in/v1/external/auth/login"
SHIPROCKET_TRACK_AWB_URL = "https://apiv2.shiprocket.in/v1/external/courier/track/awb/"
SHIPROCKET_CREATE_ORDER_URL = "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc"
SHIPROCKET_GENERATE_AWB_URL = "https://apiv2.shiprocket.in/v1/external/courier/assign/awb"
SHIPROCKET_TRACK_ORDER_URL = "https://apiv2.shiprocket.in/v1/external/courier/track/order/"
SHIPROCKET_GET_PICKUP_URL = "https://apiv2.shiprocket.in/v1/external/settings/get/pickup"

class ShiprocketClient:
    _token: Optional[str] = None

    @classmethod
    async def get_token(cls, db_creds: Optional[Dict[str, Any]] = None) -> Optional[str]:
        # ... (keep existing implementation)
        email = (db_creds or {}).get("shiprocketEmail") or settings.SHIPROCKET_EMAIL
        password = (db_creds or {}).get("shiprocketPassword") or settings.SHIPROCKET_PASSWORD

        if not email or not password:
            logger.warning("Shiprocket credentials not configured.")
            return None

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    SHIPROCKET_AUTH_URL,
                    json={"email": email, "password": password},
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    cls._token = data.get("token")
                    return cls._token
                else:
                    logger.error(f"Shiprocket auth failed: {response.status_code} - {response.text}")
                    return None
        except Exception as e:
            logger.error(f"Shiprocket auth exception: {str(e)}")
            return None

    @classmethod
    async def create_custom_order(cls, order_payload: Dict[str, Any], db_creds: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create an ad-hoc order in Shiprocket.
        """
        token = await cls.get_token(db_creds)
        if not token:
            return {"error": "Authentication failed"}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    SHIPROCKET_CREATE_ORDER_URL,
                    json=order_payload,
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=20.0
                )
                if response.status_code in [200, 201]:
                    return response.json()
                else:
                    logger.error(f"Shiprocket order creation failed: {response.status_code} - {response.text}")
                    return {"error": f"API Error: {response.status_code}", "details": response.json()}
        except Exception as e:
            logger.error(f"Shiprocket order creation exception: {str(e)}")
            return {"error": str(e)}

    @classmethod
    async def generate_awb(cls, shipment_id: int, db_creds: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate/Assign AWB for a shipment.
        """
        token = await cls.get_token(db_creds)
        if not token:
            return {"error": "Authentication failed"}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    SHIPROCKET_GENERATE_AWB_URL,
                    json={"shipment_id": shipment_id},
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=20.0
                )
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Shiprocket AWB generation failed: {response.status_code} - {response.text}")
                    return {"error": f"API Error: {response.status_code}"}
        except Exception as e:
            logger.error(f"Shiprocket AWB exception: {str(e)}")
            return {"error": str(e)}

    @classmethod
    async def track_by_awb(cls, awb_code: str, db_creds: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Track a shipment using AWB code.
        """
        token = await cls.get_token(db_creds)
        if not token:
            return {"error": "Authentication failed"}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{SHIPROCKET_TRACK_AWB_URL}{awb_code}",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=15.0
                )
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Shiprocket track failed: {response.status_code} - {response.text}")
                    return {"error": f"API Error: {response.status_code}"}
        except Exception as e:
            logger.error(f"Shiprocket track exception: {str(e)}")
            return {"error": str(e)}

    @classmethod
    async def track_by_order_id(cls, order_id: str, db_creds: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Track a shipment using Shiprocket Order ID.
        """
        token = await cls.get_token(db_creds)
        if not token:
            return {"error": "Authentication failed"}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{SHIPROCKET_TRACK_ORDER_URL}{order_id}",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=15.0
                )
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Shiprocket track failed: {response.status_code} - {response.text}")
                    return {"error": f"API Error: {response.status_code}"}
        except Exception as e:
            logger.error(f"Shiprocket track exception: {str(e)}")
            return {"error": str(e)}

    @classmethod
    async def get_pickup_locations(cls, db_creds: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Fetch registered pickup locations.
        """
        token = await cls.get_token(db_creds)
        if not token:
            return {"error": "Authentication failed"}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    SHIPROCKET_GET_PICKUP_URL,
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=15.0
                )
                if response.status_code == 200:
                    return response.json()
                else:
                    return {"error": f"API Error: {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": str(e)}

shiprocket_client = ShiprocketClient()
