"""
ai_row_correction.py
====================
Sends invalid rows to Claude AI for correction, then re-validates
the corrected values and writes results back to temp_business_data.

Flow:
  1. Fetch all is_valid=false rows for the dataset
  2. Batch them into a single AI prompt (one API call)
  3. Apply corrections back to temp_business_data
  4. Re-run validation pipeline on corrected rows
  5. Update is_valid, validation_error, ai_correction flags
"""

from __future__ import annotations

import json
import logging
import os

import anthropic
import pandas as pd
from sqlalchemy import text

from app.services.validation_pipeline import (
    normalize,
    derive_columns,
    validate_time,
    validate_business,
    detect_outliers,
    persist,
)

logger = logging.getLogger(__name__)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Fields the AI is allowed to correct
CORRECTABLE_FIELDS = ["date", "month", "year", "quantity", "price", "total"]

# System prompt — tells AI exactly what to do and how to respond
SYSTEM_PROMPT = """
You are a data correction assistant for business sales data.

You will receive a JSON array of rows that failed validation.
Each row contains: id, date, month, year, product, category, quantity, price, total, validation_error.

Your job:
- Look at the validation_error field to understand what is wrong
- Correct only the fields that are broken
- Use context clues from other fields to infer correct values
  (e.g. if total=15750 and quantity=15, price should be 1050)
- Do NOT change product, category, or any field that is already correct
- If a field cannot be reasonably corrected, leave it as null

Respond ONLY with a valid JSON array. No explanation, no markdown, no extra text.
Format:
[
  {
    "id": 123,
    "date": "2026-03-15",
    "month": 3,
    "year": 2026,
    "quantity": 10,
    "price": 150.00,
    "total": 1500.00,
    "corrected_fields": ["price", "total"]
  }
]

Rules:
- date format must be YYYY-MM-DD or null
- month must be integer 1-12 or null
- year must be a 4-digit integer or null
- quantity, price, total must be positive numbers or null
- corrected_fields must list only the fields you actually changed
- Return every row you received, even if you made no changes (corrected_fields = [])
"""


def get_ai_row_correction(dataset_id: int, db) -> None:
    """
    Main entry point. Fetches invalid rows, sends to AI,
    applies corrections, re-validates, persists.
    """
    # 1. Fetch invalid rows
    rows = db.execute(
        text("""
            SELECT id, date, month, year, product, category,
                   quantity, price, total, validation_error
            FROM temp_business_data
            WHERE dataset_id = :id
            AND is_valid = false
        """),
        {"id": dataset_id}
    ).fetchall()

    if not rows:
        logger.info(f"No invalid rows found for dataset {dataset_id}, skipping AI correction.")
        return

    logger.info(f"Sending {len(rows)} invalid rows to AI for correction.")

    # 2. Build payload for AI
    payload = [
        {
            "id":               row.id,
            "date":             str(row.date)     if row.date     else None,
            "month":            row.month,
            "year":             row.year,
            "product":          row.product,
            "category":         row.category,
            "quantity":         row.quantity,
            "price":            row.price,
            "total":            row.total,
            "validation_error": row.validation_error,
        }
        for row in rows
    ]

    # 3. Call AI
    corrections = _call_ai(payload)

    if not corrections:
        logger.warning("AI returned no corrections.")
        return

    # 4. Apply corrections and re-validate
    _apply_corrections(corrections, dataset_id, db)


def _call_ai(payload: list[dict]) -> list[dict] | None:
    """
    Send rows to Claude and parse the JSON response.
    Returns list of correction dicts, or None on failure.
    """
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": json.dumps(payload, default=str)
                }
            ]
        )

        raw = response.content[0].text.strip()

        # Strip markdown code fences if AI wraps in ```json
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        corrections = json.loads(raw)

        if not isinstance(corrections, list):
            logger.error("AI response is not a list.")
            return None

        return corrections

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {e}")
        return None
    except anthropic.APIError as e:
        logger.error(f"Anthropic API error: {e}")
        return None


def _apply_corrections(corrections: list[dict], dataset_id: int, db) -> None:
    """
    For each corrected row:
      - Write the AI-corrected field values to temp_business_data
      - Re-run the full validation pipeline on that row
      - Update ai_correction flag and ai_field_corrected
    """
    for correction in corrections:
        row_id           = correction.get("id")
        corrected_fields = correction.get("corrected_fields", [])

        if not row_id:
            continue

        # Skip rows where AI made no changes
        if not corrected_fields:
            logger.debug(f"Row {row_id}: AI made no corrections.")
            continue

        # Only apply fields that are in our allowed list
        safe_fields = [f for f in corrected_fields if f in CORRECTABLE_FIELDS]

        if not safe_fields:
            continue

        # Write AI-corrected values back to temp table
        set_clauses = ", ".join([f"{field} = :{field}" for field in safe_fields])
        params = {field: correction.get(field) for field in safe_fields}
        params["id"] = row_id

        db.execute(
            text(f"UPDATE temp_business_data SET {set_clauses} WHERE id = :id"),
            params
        )

        # Mark the row as AI-corrected with which fields were changed
        db.execute(
            text("""
                UPDATE temp_business_data
                SET
                    ai_correction       = true,
                    ai_field_corrected  = :fields
                WHERE id = :id
            """),
            {
                "fields": ",".join(safe_fields),
                "id":     row_id
            }
        )

        logger.info(f"Row {row_id}: AI corrected fields {safe_fields}")

    db.commit()

    # 5. Re-validate all AI-corrected rows using the full pipeline
    _revalidate_corrected_rows(dataset_id, db)


def _revalidate_corrected_rows(dataset_id: int, db) -> None:
    """
    Re-run the full validation pipeline on rows that were AI-corrected.
    This ensures is_valid reflects the corrected state — not the old broken state.
    """
    rows = db.execute(
        text("""
            SELECT * FROM temp_business_data
            WHERE dataset_id = :id
            AND ai_correction = true
        """),
        {"id": dataset_id}
    ).fetchall()

    if not rows:
        return

    df = pd.DataFrame([row._mapping for row in rows])

    # Run full pipeline on corrected rows only
    df = normalize(df)
    df = derive_columns(df)
    df = validate_time(df)
    df = validate_business(df)
    df = detect_outliers(df)
    # df = finalize_flags(df)

    # Persist re-validated results
    persist(df, db)
    db.commit()

    fixed_count = df["is_valid"].sum()
    total_count = len(df)
    logger.info(
        f"Re-validation complete: {fixed_count}/{total_count} "
        f"AI-corrected rows are now valid."
    )