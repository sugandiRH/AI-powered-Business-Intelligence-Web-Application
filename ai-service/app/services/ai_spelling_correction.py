import os
from sqlalchemy import text
from openai import OpenAI
from dotenv import load_dotenv

import json
import re

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SKIP_VALUES = {"nan", "none", "", "null"}
def correct_spelling( db, dataset_id ):
    result = db.execute(text("""
        SELECT DISTINCT product, category
        FROM temp_business_data_sample
        WHERE dataset_id = :dataset_id
    """), {"dataset_id": dataset_id}).fetchall()

    labeled = []
    seen = set()

    for row in result:
        for col_name, val in [("product", row.product), ("category", row.category)]:
            if not val:
                continue
           
            val_normalized = str(val).lower().strip()

        if val_normalized in SKIP_VALUES:
            continue    
    
        if val_normalized in SKIP_VALUES or val_normalized not in seen:
            if val_normalized not in SKIP_VALUES:
                seen.add(val_normalized)
                labeled.append((val, col_name))

    mapping = {}
    confidence_scores = {}
    uncached = []

    for (val, col_name) in labeled:
        val_normalized = str(val).lower().strip()

        cached = db.execute(text("""
            SELECT suggested_value, confidence
            FROM ai_corrections
            WHERE original_value = :original_value
              AND column_name = :column_name
        """), {
            "original_value": val_normalized,
            "column_name": col_name
        }).fetchone()

        if cached:
            mapping[val_normalized] = cached[0]
            confidence_scores[val] = float(cached[1]) if cached[1] else 0.0
        else:
            uncached.append((val, col_name))


    if uncached:
        uncached_values = [str(v).lower().strip() for v, _ in uncached]
        ai_result = get_ai_spelling_corrections(uncached_values)  

        for (val, col_name) in uncached:
            val_normalized = str(val).lower().strip()
            ai_entry = ai_result.get(val_normalized)

            if not ai_entry or not isinstance(ai_entry, dict):
                continue

            corrected   = ai_entry.get("corrected", "").strip()  
            confidence  = ai_entry.get("confidence", 0.0)

            mapping[val_normalized] = corrected 
            confidence_scores[val_normalized] = confidence

            existing = db.execute(text("""
                SELECT 1 FROM ai_corrections
                WHERE column_name = :column_name
                AND original_value = :original
            """), {"column_name": col_name, "original": val_normalized}).fetchone()

            if not existing:
                db.execute(text("""
                    INSERT INTO ai_corrections 
                        (column_name, original_value, suggested_value, confidence)
                    VALUES 
                        (:column_name, :original, :suggested, :confidence)
                """), {
                    "column_name": col_name,
                    "original":    val_normalized,
                    "suggested":   corrected,
                    "confidence":  confidence
                })

    db.commit()
    return mapping, confidence_scores


def get_ai_spelling_corrections(values: list[str]) -> dict:
    prompt = f"""
Fix ONLY genuine spelling mistakes in the following business product/category names.
Rules:
- Fix typos and misspellings (e.g. "bevarages" → "Beverages", "biscuite" → "Biscuit")
- Do NOT include entries where only capitalization changes (e.g. "beverages" → "Beverages" is NOT a correction)
- Do NOT include entries that are already correctly spelled
- Use proper title case in corrected values

Return ONLY valid JSON, no markdown:
{{
  "misspelled_value": {{
    "corrected": "Correct Value",
    "confidence": 0.95
  }}
}}

Values:
{json.dumps(values)}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}   # enforces JSON output, no markdown fences
    )

    try:
        return json.loads(response.choices[0].message.content)
    except (json.JSONDecodeError, AttributeError):
        return {}