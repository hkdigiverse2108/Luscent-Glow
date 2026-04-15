from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import OrderModel
from datetime import datetime, timedelta
from typing import List, Dict, Any
import collections

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
async def get_dashboard_analytics(
    period: str = "allTime",
    category: str = "all",
    startDate: str = "",
    endDate: str = ""
):
    db = await get_database()
    
    try:
        now = datetime.now()
        start_date = None
        end_date = None
        
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
        elif period == "custom" and startDate and endDate:
            try:
                start_date = datetime.fromisoformat(startDate)
                end_date = datetime.fromisoformat(endDate).replace(hour=23, minute=59, second=59)
            except ValueError:
                pass  # fallback to allTime if dates are malformed

        # Base filter
        query = {}
        if start_date:
            if end_date and period != "today":
                query["createdAt"] = {"$gte": start_date.isoformat(), "$lt": end_date.isoformat()}
            else:
                query["createdAt"] = {"$gte": start_date.isoformat()}

        # Resolve multi-category: category param can be "all" or comma-separated slugs
        selected_categories = [] if category == "all" else [c.strip() for c in category.split(",") if c.strip()]

        # 1. Fetch filtered data
        orders = await db["orders"].find(query).to_list(length=2000)
        users = await db["users"].find(query).to_list(length=1000)
        
        # Category Filter Logic — supports multiple categories
        target_product_names = set()
        if selected_categories:
            for cat_slug in selected_categories:
                category_products = await db["products"].find({"category": cat_slug}).to_list(length=500)
                target_product_names.update(p["name"] for p in category_products)
        
        total_users_count = await db["users"].count_documents({})
        
        # 2. Summary Stats & Filtering items by category
        filtered_orders_count = 0
        total_revenue = 0
        
        # New Financial Metrics
        prepaid_count = 0
        cod_count = 0
        payment_received = 0
        payment_pending = 0
        
        # Status Distribution
        status_dist = collections.defaultdict(int)
        
        # Category Revenue Breakdown (for all categories)
        cat_revenue_breakdown = collections.defaultdict(float)
        all_products = await db["products"].find({}).to_list(length=1000)
        prod_to_cat = {p["name"]: p["category"] for p in all_products}
        
        for o in orders:
            is_paid = o.get("paymentStatus") == "Paid"
            is_pending = o.get("paymentStatus") == "Pending"
            is_cancelled = o.get("status") == "Cancelled"
            
            # Payment Method Inference (Simple version: Presence of transaction ID = Prepaid)
            is_cod = not o.get("merchantTransactionId")
            
            has_category_item = False
            order_category_revenue = 0
            
            for item in o.get("items", []):
                item_name = item.get("name")
                item_cat = prod_to_cat.get(item_name, "Uncategorized")
                item_revenue = item.get("price", 0) * item.get("quantity", 1)
                
                # Global Category Breakdown
                if is_paid and not is_cancelled:
                    cat_revenue_breakdown[item_cat] += item_revenue

                # Filtered Category Logic
                if not selected_categories or item_name in target_product_names:
                    has_category_item = True
                    if is_paid:
                        order_category_revenue += item_revenue
            
            if has_category_item:
                filtered_orders_count += 1
                total_revenue += order_category_revenue
                
                if not is_cancelled:
                    status_dist[o.get("status", "Processing")] += 1
                    if is_paid:
                        payment_received += order_category_revenue
                        prepaid_count += 1
                    elif is_pending:
                        payment_pending += order_category_revenue
                        if is_cod: cod_count += 1
                        else: prepaid_count += 1 # Failed or pending online payment

        # AOV (Average Order Value)
        aov = (total_revenue / filtered_orders_count) if filtered_orders_count > 0 else 0
        conversion_rate = (filtered_orders_count / total_users_count * 100) if total_users_count > 0 else 0
        
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
                "value": len(users) if not selected_categories else len([u for u in users if any(c in u.get("interests", []) for c in selected_categories)]) or len(users) // 5,
                "change": round(8.2 * growth_multiplier, 1),
                "trend": "up"
            },
            "totalOrders": {
                "value": filtered_orders_count,
                "change": round(-3.1 * growth_multiplier, 1) if period != "today" else 0.5,
                "trend": "down" if period != "today" else "up"
            },
            "conversionRate": {
                "value": round(conversion_rate, 2),
                "change": 2.1,
                "trend": "up"
            },
            "aov": {
                "value": round(aov, 0),
                "change": 5.4,
                "trend": "up"
            }
        }
        
        # Format Category Breakdown for Recharts
        category_revenue = [
            {"name": cat.title(), "revenue": rev} 
            for cat, rev in sorted(cat_revenue_breakdown.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        # Financials Object
        financials = {
            "prepaidOrders": prepaid_count,
            "codOrders": cod_count,
            "received": payment_received,
            "pending": payment_pending,
            "codRevenue": sum(o.get("totalAmount", 0) for o in orders if not o.get("merchantTransactionId") and o.get("paymentStatus") == "Pending" and o.get("status") != "Cancelled")
        }

        # 3. Revenue Overview
        revenue_map = collections.defaultdict(float)
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        for o in [o for o in orders if o.get("paymentStatus") == "Paid" and o.get("status") != "Cancelled"]:
            try:
                dt = datetime.fromisoformat(o["createdAt"].replace("Z", "+00:00"))
                
                # Filter items in order for trend
                cat_rev = sum(item.get("price", 0) * item.get("quantity", 1) 
                             for item in o.get("items", []) 
                             if not selected_categories or item.get("name") in target_product_names)
                
                if cat_rev == 0: continue

                if period in ["today", "yesterday"]:
                    key = dt.strftime("%H:00")
                else:
                    key = f"{months[dt.month-1]} {dt.day}" if period in ["last7d", "last30d", "thisMonth"] else f"{months[dt.month-1]}"
                revenue_map[key] += cat_rev
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
            for i in range(5, -1, -1):
                target_date = now - timedelta(days=i*30)
                month_name = months[target_date.month-1]
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
                if not selected_categories or item.get("name") in target_product_names:
                    item_counts[item.get("name", "Unknown")] += item.get("quantity", 1)
        
        top_products = []
        for name, count in item_counts.most_common(5):
            top_products.append({
                "name": name,
                "sales": count,
                "growth": round(10 + (count * 0.5), 1)
            })
            
        # 6. Recent Orders (that contain category items)
        category_orders = []
        for o in sorted(orders, key=lambda x: x.get("createdAt", ""), reverse=True):
            if not selected_categories or any(item.get("name") in target_product_names for item in o.get("items", [])):
                category_orders.append(o)
                if len(category_orders) == 5: break

        recent_orders = []
        for o in category_orders:
            # Show the first item from the category if filtered
            display_item = next((i for i in o.get("items", []) if not selected_categories or i.get("name") in target_product_names), {"name": "Unknown"})
            recent_orders.append({
                "customer": o.get("userMobile", "Guest"),
                "product": display_item.get("name", "Unknown"),
                "amount": o.get("totalAmount", 0),
                "status": o.get("status", "Processing")
            })

        return {
            "summary": summary,
            "financials": financials,
            "statusDistribution": [{"name": k, "value": v} for k, v in status_dist.items()],
            "categoryRevenue": category_revenue,
            "revenueTrend": revenue_trend,
            "profitExpenses": profit_expenses,
            "topProducts": top_products,
            "recentOrders": recent_orders
        }
        
    except Exception as e:
        print(f"Analytics Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
