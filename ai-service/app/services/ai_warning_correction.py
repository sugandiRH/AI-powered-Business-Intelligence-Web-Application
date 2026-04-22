import os
import json

from sqlalchemy import text
from openai import OpenAI
from dotenv import load_dotenv


load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def warning_confirm(dataset_id, db):

    # get warning data
    warning_rows = db.execute(text("""
        SELECT id, date, month, year, total, product, category, price, quantity, validation_errors
        FROM temp_business_data_sample
        WHERE dataset_id = :dataset_id 
            AND error_level = 'warning'
    """), {"dataset_id": dataset_id}).fetchall()

    if not warning_rows:
        print("No warning rows found for dataset_id:", dataset_id)
        return []
    
    
    # get average, mode, price and quantity for each product
    stats_rows = db.execute(text("""
        SELECT product, 
            ROUND(AVG(CAST(price AS DECIMAL)), 2) AS avg_price, 
            ROUND(AVG(CAST(quantity AS DECIMAL)), 2) AS avg_quantity,
            ROUND(AVG(CAST(total AS DECIMAL)), 2)    AS avg_total,
            MODE() WITHIN GROUP (ORDER BY CAST(price AS DECIMAL)) AS mode_price,
            MODE() WITHIN GROUP (ORDER BY CAST(quantity AS DECIMAL)) AS mode_quantity
        FROM temp_business_data_sample
        WHERE dataset_id = :dataset_id
            AND quantity IS NOT NULL
            AND error_level != 'warning' 
            AND error_level != 'critical'
        GROUP BY product
    """), {"dataset_id": dataset_id}).fetchall()


    product_stats = {}
    for s in stats_rows:
        product_stats[s.product] = {
            "avg_price":    float(s.avg_price)    if s.avg_price    else None,
            "avg_quantity": float(s.avg_quantity) if s.avg_quantity else None,
            "avg_total":    float(s.avg_total)    if s.avg_total    else None,
            "mode_price":   float(s.mode_price)   if s.mode_price   else None,
        }


    rows_for_ai = []
    for row in warning_rows:
        stats = product_stats.get(row.product, {})
        rows_for_ai.append({
            "id":               row.id,
            "date":             str(row.date)     if row.date     else None,
            "month":            row.month,
            "year":             row.year,
            "product":          row.product,
            "category":         row.category,
            "quantity":         row.quantity,
            "price":            row.price,
            "total":            row.total,
            "errors":           json.loads(row.validation_errors) if isinstance(row.validation_errors, str) else (row.validation_errors or []),
            "product_avg_price":    stats.get("avg_price"),
            "product_avg_quantity": stats.get("avg_quantity"),
            "product_mode_price":   stats.get("mode_price"),
        })    


    batch_size = 15
    all_suggestions = {}

    for i in range(0, len(rows_for_ai), batch_size):
        batch = rows_for_ai[i:i + batch_size]
        suggestions = get_ai_warning_corrections(batch)
        all_suggestions.update(suggestions)  


    #store in database 
    for row_id_str, suggestion in all_suggestions.items():
        row_id = int(row_id_str)

        db.execute(text("""
            UPDATE temp_business_data_sample
            SET
                suggested_date     = :suggested_date,
                suggested_month    = :suggested_month,
                suggested_year     = :suggested_year,
                suggested_category = :suggested_category,
                suggested_price    = :suggested_price,
                suggested_quantity = :suggested_quantity,
                suggested_total    = :suggested_total
            WHERE id = :id
        """), {
            "suggested_date":     suggestion.get("date"),
            "suggested_month":    suggestion.get("month"),
            "suggested_year":     suggestion.get("year"),
            "suggested_category": suggestion.get("category"),
            "suggested_price":    suggestion.get("price"),
            "suggested_quantity": suggestion.get("quantity"),
            "suggested_total":    suggestion.get("total"),
            "id":                 row_id
        })

    db.commit()
    return all_suggestions   


def get_ai_warning_corrections(rows: list[dict]) -> dict:
    prompt = f"""
You are a data correction assistant for business sales data.

For each row, fix ONLY the fields mentioned in the "errors" list.
Use the product average/mode price as reference when fixing price outliers.

Error types and how to fix them:
- month_date_mismatch  → correct month to match the date field
- year_date_mismatch   → correct year to match the date field  
- price_outlier        → suggest a reasonable price close to product_avg_price or product_mode_price
- quantity_outlier     → suggest a reasonable quantity close to product_avg_quantity
- missing_category     → infer category from product name
- invalid_month        → derive correct month from date if available
- invalid_year         → derive correct year from date if available
- duplicate_row        → set "delete": true
- price_inconsistency  → suggest the most common price for this product

Rules:
- Only include fields that need correction
- Do not change fields that are not in the errors list
- If you cannot confidently fix a field, omit it

Return ONLY valid JSON keyed by row id (as string):
{{
  "row_id": {{
    "month": 3,
    "price": 450.0,
    "total": 2250.0
  }}
}}

Rows:
{json.dumps(rows, default=str)}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )

    try:
        return json.loads(response.choices[0].message.content)
    except (json.JSONDecodeError, AttributeError):
        return {}