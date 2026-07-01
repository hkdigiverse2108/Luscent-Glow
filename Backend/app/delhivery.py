import httpx
import logging
import json
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

DELHIVERY_SANDBOX_URL = "https://staging-express.delhivery.com"
DELHIVERY_PRODUCTION_URL = "https://track.delhivery.com"

class DelhiveryClient:
    @classmethod
    def _get_base_url(cls, db_creds: Optional[Dict[str, Any]] = None) -> str:
        mode = (db_creds or {}).get("delhiveryMode", "sandbox")
        if mode == "production":
            return DELHIVERY_PRODUCTION_URL
        return DELHIVERY_SANDBOX_URL

    @classmethod
    def _get_headers(cls, db_creds: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
        token = (db_creds or {}).get("delhiveryToken", "")
        return {
            "Authorization": f"Token {token}",
            "Content-Type": "application/x-www-form-urlencoded"
        }

    @classmethod
    async def create_custom_order(cls, order_payload: Dict[str, Any], db_creds: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create an order booking in Delhivery.
        """
        base_url = cls._get_base_url(db_creds)
        headers = cls._get_headers(db_creds)
        url = f"{base_url}/api/cmu/create.json"

        # Delhivery expects data in format=json&data=JSON_STRING
        form_data = {
            "format": "json",
            "data": json.dumps(order_payload)
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    data=form_data,
                    headers=headers,
                    timeout=20.0
                )
                if response.status_code in [200, 201]:
                    return response.json()
                else:
                    logger.error(f"Delhivery order creation failed: {response.status_code} - {response.text}")
                    return {"error": f"API Error: {response.status_code}", "details": response.text}
        except Exception as e:
            logger.error(f"Delhivery order creation exception: {str(e)}")
            return {"error": str(e)}

    @classmethod
    async def track_by_awb(cls, waybill: str, db_creds: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Track package by Delhivery Waybill (AWB code).
        """
        base_url = cls._get_base_url(db_creds)
        token = (db_creds or {}).get("delhiveryToken", "")
        url = f"{base_url}/api/v1/packages/json/"
        
        headers = {
            "Authorization": f"Token {token}"
        }
        params = {
            "waybill": waybill
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    params=params,
                    headers=headers,
                    timeout=15.0
                )
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Delhivery track failed: {response.status_code} - {response.text}")
                    return {"error": f"API Error: {response.status_code}"}
        except Exception as e:
            logger.error(f"Delhivery track exception: {str(e)}")
            return {"error": str(e)}

    @classmethod
    async def get_pickup_locations(cls, db_creds: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Fetch registered warehouses / pickup locations in Delhivery.
        """
        base_url = cls._get_base_url(db_creds)
        token = (db_creds or {}).get("delhiveryToken", "")
        url = f"{base_url}/api/backend/client/warehouse/all/"
        
        headers = {
            "Authorization": f"Token {token}"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    headers=headers,
                    timeout=15.0
                )
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Delhivery pickup locations fetch failed: {response.status_code} - {response.text}")
                    return {"error": f"API Error: {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": str(e)}

delhivery_client = DelhiveryClient()
