from sqlalchemy import text
from sqlalchemy.orm import Session


def get_all_kpis(dataset_id: int, db: Session):
    main = db.execute(text("""
        SELECT
            ROUND(SUM(total)::numeric, 2) AS total_revenue,
            COUNT(id) AS total_orders,
            SUM(quantity) AS total_units_sold,
            ROUND((SUM(total) / COUNT(id))::numeric, 2) AS avg_order_value,
            ROUND(AVG(price)::numeric, 2) AS avg_unit_price
        FROM public.business_data
        WHERE dataset_id = :dataset_id
    """), {"dataset_id": dataset_id}).mappings().fetchone()
 
    top_cat = db.execute(text("""
        SELECT category, ROUND(SUM(total)::numeric, 2) AS revenue
        FROM public.business_data
        WHERE dataset_id = :dataset_id
        GROUP BY category
        ORDER BY revenue DESC
        LIMIT 1
    """), {"dataset_id": dataset_id}).mappings().fetchone()

    top_prod = db.execute(text("""
        SELECT product, ROUND(SUM(total)::numeric, 2) AS revenue
        FROM public.business_data
        WHERE dataset_id = :dataset_id
        GROUP BY product
        ORDER BY revenue DESC
        LIMIT 1
    """), {"dataset_id": dataset_id}).mappings().fetchone()

    best_mon = db.execute(text("""
        SELECT month, ROUND(SUM(total)::numeric, 2) AS revenue
        FROM public.business_data
        WHERE dataset_id = :dataset_id
        GROUP BY month
        ORDER BY revenue DESC
        LIMIT 1
    """), {"dataset_id": dataset_id}).mappings().fetchone()

    return {
        "total_revenue":    float(main["total_revenue"]),
        "total_orders":     int(main["total_orders"]),
        "total_units_sold": int(main["total_units_sold"]),
        "avg_order_value":  float(main["avg_order_value"]),
        "avg_unit_price":   float(main["avg_unit_price"]),
        "top_category": {
            "name":    top_cat["category"],
            "revenue": float(top_cat["revenue"]),
        },
        "top_product": {
            "name":    top_prod["product"],
            "revenue": float(top_prod["revenue"]),
        },
        "best_month": {
            "month":   int(best_mon["month"]),
            "revenue": float(best_mon["revenue"]),
        },
    }