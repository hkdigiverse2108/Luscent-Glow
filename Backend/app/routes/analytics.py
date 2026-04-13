from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import OrderModel
from datetime import datetime, timedelta
from typing import List, Dict, Any
import collections

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
async def get_dashboard_analytics(period: str = "allTime"):
    db = await get_database()
    
    try:
        now = datetime.now()
        start_date = None
        
        if period == "today":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "yesterday":
            start_date = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "last7d":
            start_date = now - timedelta(days=7)
        elif period == "last30d":
            start_date = now - timedelta(days=30)
        elif period == "thisMonth":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Base filter
        query = {}
        if start_date:
            if period == "yesterday":
                query["createdAt"] = {"$gte": start_date.isoformat(), "$lt": end_date.isoformat()}
            else:
                query["createdAt"] = {"$gte": start_date.isoformat()}

        # 1. Fetch filtered data
        orders = await db["orders"].find(query).to_list(length=2000)
        users = await db["users"].find(query).to_list(length=1000)
        
        # We need all users for conversion rate if period is not allTime? 
        # Actually usually Dashboard "Conversion Rate" for a period is (Orders in period) / (Sessions in period).
        # Since we don't have sessions, we'll use active users in that period or total users.
        # Let's use total users for a more stable metric, or filtered users for "New User Conversion".
        total_users_count = await db["users"].count_documents({})
        
        # 2. Summary Stats
        paid_orders = [o for o in orders if o.get("paymentStatus") == "Paid"]
        total_revenue = sum(o.get("totalAmount", 0) for o in paid_orders)
        
        conversion_rate = (len(orders) / total_users_count * 100) if total_users_count > 0 else 0
        
        # Dynamic growth simulation based on period length
        growth_multiplier = 1.0
        if period == "today": growth_multiplier = 0.2
        elif period == "last7d": growth_multiplier = 0.8
        
        summary = {
            "totalRevenue": {
                "value": total_revenue,
                "change": round(12.5 * growth_multiplier, 1),
                "trend": "up"
            },
            "activeUsers": {
                "value": len(users),
                "change": round(8.2 * growth_multiplier, 1),
                "trend": "up"
            },
            "totalOrders": {
                "value": len(orders),
                "change": round(-3.1 * growth_multiplier, 1) if period != "today" else 0.5,
                "trend": "down" if period != "today" else "up"
            },
            "conversionRate": {
                "value": round(conversion_rate, 2),
                "change": 2.1,
                "trend": "up"
            }
        }
        
        # 3. Revenue Overview
        revenue_map = collections.defaultdict(float)
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        for o in paid_orders:
            try:
                dt = datetime.fromisoformat(o["createdAt"].replace("Z", "+00:00"))
                if period in ["today", "yesterday"]:
                    key = dt.strftime("%H:00")
                else:
                    key = f"{months[dt.month-1]} {dt.day}" if period in ["last7d", "last30d", "thisMonth"] else f"{months[dt.month-1]}"
                revenue_map[key] += o.get("totalAmount", 0)
            except:
                continue
                
        # Format for Recharts
        revenue_trend = []
        if period in ["today", "yesterday"]:
            for h in range(0, 24, 4):
                key = f"{h:02d}:00"
                revenue_trend.append({"name": key, "revenue": revenue_map.get(key, 0)})
        elif period == "last7d":
            for i in range(6, -1, -1):
                d = now - timedelta(days=i)
                key = f"{months[d.month-1]} {d.day}"
                revenue_trend.append({"name": d.strftime("%a"), "revenue": revenue_map.get(key, 0)})
        else:
            # Default last 6 months
            for i in range(5, -1, -1):
                target_date = now - timedelta(days=i*30)
                month_name = months[target_date.month-1]
                month_key = f"{month_name} {target_date.year}"
                
                # If we are filtering by thisMonth, we should show days instead?
                # For simplicity, we keep the month trend if period is allTime or thisMonth
                revenue_trend.append({
                    "name": month_name,
                    "revenue": revenue_map.get(month_name, 0) if period == "allTime" else sum(v for k,v in revenue_map.items() if month_name in k)
                })

        # 4. Profit vs Expenses
        profit_expenses = []
        for entry in revenue_trend:
            revenue = entry["revenue"]
            expenses = revenue * 0.4
            profit = revenue - expenses
            profit_expenses.append({
                "name": entry["name"],
                "profit": profit,
                "expenses": expenses
            })
            
        # 5. Top Products (based on filtered orders)
        item_counts = collections.Counter()
        for o in orders:
            for item in o.get("items", []):
                item_counts[item.get("name", "Unknown")] += item.get("quantity", 1)
        
        top_products = []
        for name, count in item_counts.most_common(5):
            top_products.append({
                "name": name,
                "sales": count,
                "growth": round(10 + (count * 0.5), 1)
            })
            
        # 6. Recent Orders
        recent_orders = []
        for o in sorted(orders, key=lambda x: x.get("createdAt", ""), reverse=True)[:5]:
            recent_orders.append({
                "customer": o.get("userMobile", "Guest"),
                "product": o["items"][0].get("name", "Unknown") if o.get("items") else "Multiple Items",
                "amount": o.get("totalAmount", 0),
                "status": o.get("status", "Processing")
            })

        return {
            "summary": summary,
            "revenueTrend": revenue_trend,
            "profitExpenses": profit_expenses,
            "topProducts": top_products,
            "recentOrders": recent_orders
        }
        
    except Exception as e:
        print(f"Analytics Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
