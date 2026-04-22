from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

from app.services.kpi_service import get_all_kpis
from app.schema.visualization_request import VisualizationRequest

from app.services.chart_data_service import (
    get_category_share,
    get_daily_sales,
    get_price_vs_qty,
    get_qty_by_month_category,
    get_revenue_by_category,
    get_revenue_by_month,
    get_revenue_vs_qty_by_month,
    get_top_products
)


router = APIRouter()
@router.post("/get_visual_details")

async def visualizatio_board(
    data: VisualizationRequest,
    db: Session = Depends(get_db)
):
    try:
        dataset_id = data.dataset_id
        kpi_result = get_all_kpis(dataset_id, db)

        revenue_by_month = get_revenue_by_month(dataset_id, db)
        revenue_by_category = get_revenue_by_category(dataset_id, db)
        category_share = get_category_share(dataset_id, db)
        top_products = get_top_products(dataset_id, db)
        qty_by_month_category = get_qty_by_month_category(dataset_id, db)
        price_vs_qty = get_price_vs_qty(dataset_id, db)
        revenue_vs_qty_by_month = get_revenue_vs_qty_by_month(dataset_id, db)
        daily_sales = get_daily_sales(dataset_id, db)


        return {
            "message": "KPI generate completed successfully",
            "dataset_id": dataset_id,
            "data": {
                "kpis":                    kpi_result, 
                "revenue_by_month":        revenue_by_month,
                "revenue_by_category":     revenue_by_category,
                "category_share":          category_share,
                "top_products":            top_products,
                "qty_by_month_category":   qty_by_month_category,
                "price_vs_qty":            price_vs_qty,
                "revenue_vs_qty_by_month": revenue_vs_qty_by_month,
                "daily_sales":             daily_sales,
            }
        }

    except Exception as e:

        print("ERROR:", e)
        return {"error": str(e)}
