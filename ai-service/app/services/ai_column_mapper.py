# This file is responsible for mapping the columns of the uploaded excel file to the expected columns in the database using AI.
# It uses OpenAI's API to get the best possible mapping based on the column names and the dataset context.

# before call ai, check if we have mapping for this dataset in DB, if yes return that, 
# if no, call ai to get mapping, save that in DB and return that.

import os
from sqlalchemy import text
from openai import OpenAI
from dotenv import load_dotenv

import json
import re


load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


STANDARD_COLUMNS = ["date", "product", "category", "quantity", "price", "total", "month", "year"]

def map_columns(uploaded_columns, dataset_id, db):

    mapping = {}
    confidence_scores = {}
    # ai_result = get_ai_mapping(uploaded_columns)
    ai_result = None

    for col in uploaded_columns:
        col_normalized = col.lower().strip()

        # 1. Check in dataset_column_mappings table
        result = db.execute(
            text("""
                SELECT mapped_column, confidence
                FROM dataset_column_mappings
                WHERE dataset_id = :dataset_id
                AND excel_column = :excel_column
                """),
            {"dataset_id": dataset_id, "excel_column": col_normalized}
        ).fetchone()

        if result:
            mapping[col] = result[0]
            confidence_scores[col] = result[1]
            continue

        # 2. Check ai_corrections table for any mapping options
        result = db.execute(
            text("""
                SELECT suggested_value, confidence
                FROM ai_corrections
                WHERE original_value = :excel_column
                """),
            {"excel_column": col_normalized}
        ).fetchone()

        if result:
            mapping[col] = result[0]
            confidence_scores[col] = result[1]
            continue

        # 3. Use AI result
        if ai_result is None:
            ai_result = get_ai_mapping(uploaded_columns)

        ai_mapping = (
            ai_result.get(col) or
            ai_result.get(col.lower()) or
            ai_result.get(col_normalized)
        )
        if ai_mapping and isinstance(ai_mapping, dict):
            mapped_column = ai_mapping.get("mapped_column")
            confidence = ai_mapping.get("confidence", 0)
        else:
            mapped_column = None
            confidence = 0

        mapping[col] = mapped_column
        confidence_scores[col] = confidence

        if mapped_column is not None:
            # Save mapping in dataset_column_mappings
            db.execute(
                text("""
                    INSERT INTO dataset_column_mappings (dataset_id, excel_column, mapped_column, confidence)
                    VALUES (:dataset_id, :excel_column, :mapped_column, :confidence)
                """),
                {"dataset_id": dataset_id, "excel_column": col_normalized, "mapped_column": mapped_column, "confidence": confidence}
            )

            # Save mapping in ai_corrections for future reference
            db.execute(
                text("""
                    INSERT INTO ai_corrections (column_name, original_value, suggested_value, confidence)
                    VALUES (:excel_column, :original_value, :suggested_value, :confidence)
                """),
                {"excel_column": col_normalized, "original_value": col_normalized, "suggested_value": mapped_column, "confidence": confidence}
            )

    db.commit()
    return mapping, confidence_scores

def get_ai_mapping(columns):
    prompt = f"""
You are a data integration assistant.

Map the following Excel columns to database fields.

Excel columns:
{columns}

Database fields:
{STANDARD_COLUMNS}

Rules:
- Match based on semantic meaning
- Return ONLY valid JSON
- Do NOT include markdown
- If no match return null
- Include confidence score

Example format:
{{
  "Sales Date": {{"mapped_column":"date","confidence":0.95}},
  "Product Name": {{"mapped_column":"product","confidence":0.93}}
}}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        messages=[{"role": "user", "content": prompt}]
    )

    content = response.choices[0].message.content.strip()
    print("AI RAW RESPONSE:", content)

    # Remove markdown code block if present
    content = re.sub(r"```json|```", "", content).strip()

    # Try to parse JSON
    try:
        mapping_json = json.loads(content)
    except Exception:
        # Try to extract JSON from string
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            mapping_json = json.loads(match.group(0))
        else:
            mapping_json = {}

    return mapping_json
    