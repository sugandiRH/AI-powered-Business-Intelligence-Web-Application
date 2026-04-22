import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from app.services.kpi_service import get_all_kpis
from app.services.chart_data_service import (
    get_revenue_by_month,
    get_revenue_by_category,
    get_top_products,
)

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def getSummary(dataset_id: int, db: Session): 
    kpis = get_all_kpis(dataset_id, db)


    chart_data = {
        "revenue_by_month":    get_revenue_by_month(dataset_id, db),
        "revenue_by_category": get_revenue_by_category(dataset_id, db),
        "top_products":        get_top_products(dataset_id, db),
    }

    summary = generate_visual_summary(kpis, chart_data)
    return {"summary": summary}


def generate_visual_summary(kpis, chart_data):
    prompt = f"""
You are a business analyst reviewing sales data. Analyse this sales data and return JSON only.

KPIs:
{json.dumps(kpis, indent=2)}

Monthly revenue trend:
{json.dumps(chart_data['revenue_by_month'], indent=2)}

Revenue by category:
{json.dumps(chart_data['revenue_by_category'], indent=2)}

Top products:
{json.dumps(chart_data['top_products'], indent=2)}

Return ONLY this JSON structure, no extra text:
{{
  "summary": "2-3 sentence business summary covering Overall performance (use the KPI numbers),Best performing category and product and three specific recommendation based on the data",
  "dashboard_overview": "2-3 sentence overall business summary using KPI numbers",
  "trend_insight": "what the monthly revenue trend shows — growth, dips, peaks",
  "category_insight": "which category leads, which underperforms, one recommendation",
  "product_insight": "top product performance and what it means",
  "anomaly": "any unusual value — big drop, zero sales, spike — or null if none",
  "recommendation": "one specific actionable recommendation based on the data"
}}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=400,
        temperature=0.3,    
    )

    return json.loads(response.choices[0].message.content)