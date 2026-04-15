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
You are a business analyst reviewing sales data.

KPIs:
{json.dumps(kpis, indent=2)}

Monthly revenue trend:
{json.dumps(chart_data['revenue_by_month'], indent=2)}

Revenue by category:
{json.dumps(chart_data['revenue_by_category'], indent=2)}

Top products:
{json.dumps(chart_data['top_products'], indent=2)}

Write a 2-3 sentence business summary covering:
1. Overall performance (use the KPI numbers)
2. Best performing category and product
3. One specific recommendation based on the data

Write in plain English. Do not use bullet points. Do not use markdown.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.3,    
    )

    return response.choices[0].message.content.strip()