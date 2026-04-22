import json
import os
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


def chatbot_response(dataset_id: int, quection: str, db: Session) :
   
    context = {
        "kpis":                get_all_kpis(dataset_id, db),
        "revenue_by_month":    get_revenue_by_month(dataset_id, db),
        "revenue_by_category": get_revenue_by_category(dataset_id, db),
        "top_products":        get_top_products(dataset_id, db, limit=5),
    }

   
    prompt = f"""
You are a business analyst assistant. A user has uploaded a sales dataset.
Here is the data summary:

{json.dumps(context, indent=2)}

Answer this question clearly and concisely:
{quection}

If the question cannot be answered from the data above, say so politely.
Keep your answer short — 2 to 4 sentences maximum.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful business data analyst."},
            {"role": "user",   "content": prompt}
        ],
        max_tokens=400,
        temperature=0.3,    
    )

    return {"answer": response.choices[0].message.content}