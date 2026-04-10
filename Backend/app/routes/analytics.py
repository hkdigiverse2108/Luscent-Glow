from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import OrderModel
from datetime import datetime, timedelta
from typing import List, Dict, Any
import collections

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
async def get_dashboard_analytics():
    db = await get_database()
    
    try:
        # 1. Fetch all data for calculation (Aggregation preferred for production)
        orders = await db["orders"].find({}).to_list(length=1000)
        users = await db["users"].find({}).to_list(length=1000)
        reviews = await db["reviews"].find({}).to_list(length=1000)
        products = await db["products"].find({}).to_list(length=1000)
        
        # 2. Summary Stats
        paid_orders = [o for o in orders if o.get("paymentStatus") == "Paid"]
        total_revenue = sum(o.get("totalAmount", 0) for o in paid_orders)
        
        # Conversion Rate simulation (Orders / Users)
        conversion_rate = (len(orders) / len(users) * 100) if len(users) > 0 else 0
        
        # Growth simulation (Compare current month vs last month)
        # This is a simplified mock for visual fidelity as requested
        summary = {
            "totalRevenue": {
                "value": total_revenue,
                "change": 12.5,
                "trend": "up"
            },
            "activeUsers": {
                "value": len(users),
                "change": 8.2,
                "trend": "up"
            },
            "totalOrders": {
                "value": len(orders),
                "change": -3.1,
                "trend": "down"
            },
            "conversionRate": {
                "value": round(conversion_rate, 2),
                "change": 4.5,
                "trend": "up"
            }
        }
        
        # 3. Revenue Overview (Last 6 Months)
        # We group by month and year from createdAt string
        revenue_map = collections.defaultdict(float)
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        for o in paid_orders:
            try:
                dt = datetime.fromisoformat(o["createdAt"].replace("Z", "+00:00"))
                month_key = f"{months[dt.month-1]} {dt.year}"
                revenue_map[month_key] += o.get("totalAmount", 0)
            except:
                continue
                
        # Format for Recharts (Recent 6 months)
        revenue_trend = []
        for i in range(5, -1, -1):
            target_date = datetime.now() - timedelta(days=i*30)
            month_key = f"{months[target_date.month-1]} {target_date.year}"
            revenue_trend.append({
                "name": months[target_date.month-1],
                "revenue": revenue_map.get(month_key, 0)
            })

        # 4. Profit vs Expenses (Calculated based on 40% estimation)
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
            
        # 5. Top Products
        item_counts = collections.Counter()
        for o in orders:
            for item in o.get("items", []):
                item_counts[item.get("name", "Unknown")] += item.get("quantity", 1)
        
        top_products = []
        for name, count in item_counts.most_common(5):
            # Find price/image from products or items
            top_products.append({
                "name": name,
                "sales": count,
                "growth": round(10 + (count * 0.5), 1) # Mock growth based on count
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
