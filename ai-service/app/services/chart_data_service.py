from sqlalchemy import text
from sqlalchemy.orm import Session

def get_revenue_by_month(dataset_id: int, db: Session):

    revenue_by_month = db.execute(text ("""
        SELECT
            month,
            ROUND(SUM(total)::numeric, 2) AS revenue
        FROM public.business_data
        WHERE dataset_id = :dataset_id
        GROUP BY month
        ORDER BY month ASC
    """), {"dataset_id": dataset_id}).mappings().fetchall()

    return [{"month": r["month"], "revenue": float(r["revenue"])} for r in revenue_by_month]




def get_revenue_by_category(dataset_id: int, db: Session):
    revenue_by_category = db.execute(text ("""
        SELECT
            category,
            ROUND(SUM(total)::numeric, 2) AS revenue
        FROM public.business_data
        WHERE dataset_id = :dataset_id
        GROUP BY category
        ORDER BY revenue DESC
    """), {"dataset_id": dataset_id}).mappings().fetchall()

    return [{"category": r["category"], "revenue": float(r["revenue"])} for r in revenue_by_category]




def get_category_share(dataset_id: int, db: Session):
    category_share = db.execute(text ("""
        SELECT
            category,
            ROUND(SUM(total)::numeric, 2) AS revenue,
            ROUND(
                (SUM(total) * 100.0 / SUM(SUM(total)) OVER ())::numeric, 1
            ) AS percentage
        FROM public.business_data
        WHERE dataset_id = :dataset_id
        GROUP BY category
        ORDER BY revenue DESC
    """), {"dataset_id": dataset_id}).mappings().fetchall()

    return [
        {
            "category":   r["category"],
            "revenue":    float(r["revenue"]),
            "percentage": float(r["percentage"]),
        }
        for r in category_share
    ]




def get_top_products(dataset_id: int, db: Session,limit: int = 10):
    top_products = db.execute(text ("""
        SELECT
            product,
            ROUND(SUM(total)::numeric, 2) AS revenue
        FROM public.business_data
        WHERE dataset_id = :dataset_id
        GROUP BY product
        ORDER BY revenue DESC
        LIMIT :limit
    """), {"dataset_id": dataset_id, "limit": limit}).mappings().fetchall()

    return [{"product": r["product"], "revenue": float(r["revenue"])} for r in top_products]




def get_qty_by_month_category(dataset_id: int, db: Session):
    qty_by_month_category = db.execute(text ("""
        SELECT
            month,
            category,
            SUM(quantity) AS qty
        FROM public.business_data
        WHERE dataset_id = :dataset_id
        GROUP BY month, category
        ORDER BY month ASC, category ASC
    """), {"dataset_id": dataset_id}).mappings().fetchall()

    pivot: dict = {}
    for r in qty_by_month_category:
        m = r["month"]
        if m not in pivot:
            pivot[m] = {"month": m}
        pivot[m][r["category"]] = int(r["qty"])
 
    return list(pivot.values())




def get_price_vs_qty(dataset_id: int, db: Session):
    price_vs_qty = db.execute(text ("""
        SELECT
            product,
            ROUND(AVG(price)::numeric, 2) AS avg_price,
            SUM(quantity) AS total_qty
        FROM public.business_data
        WHERE dataset_id = :dataset_id
        GROUP BY product
        ORDER BY avg_price ASC
    """), {"dataset_id": dataset_id}).mappings().fetchall()

    return [
        {
            "product":   r["product"],
            "avg_price": float(r["avg_price"]),
            "total_qty": int(r["total_qty"]),
        }
        for r in price_vs_qty
    ]




def get_revenue_vs_qty_by_month(dataset_id: int, db: Session):
    revenue_vs_qty_by_month = db.execute(text ("""
        SELECT
            month,
            ROUND(SUM(total)::numeric, 2) AS revenue,
            SUM(quantity)AS qty
        FROM public.business_data
        WHERE dataset_id = :dataset_id 
        GROUP BY month
        ORDER BY month ASC
    """), {"dataset_id": dataset_id}).mappings().fetchall()

    return [
        {
            "month":   r["month"],
            "revenue": float(r["revenue"]),
            "qty":     int(r["qty"]),
        }
        for r in revenue_vs_qty_by_month
    ]




def get_daily_sales(dataset_id: int, db: Session):
    daily_sales = db.execute(text ("""
        SELECT
            date,
            ROUND(SUM(total)::numeric, 2) AS revenue
        FROM public.business_data
        WHERE dataset_id = :dataset_id 
        GROUP BY date
        ORDER BY date ASC
    """), {"dataset_id": dataset_id}).mappings().fetchall()

    return [{"date": str(r["date"]), "revenue": float(r["revenue"])} for r in daily_sales]