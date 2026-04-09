# from app.models.temp_business_data import TempBusinessData
from app.models.temp_business_data_sample import TempBusinessDataSample
from sqlalchemy import text
import pandas as pd

def save_temp_data(df, dataset_id, db):

    df = df.astype(object).where(pd.notnull(df), None)

    db.execute(
        text("DELETE FROM temp_business_data_sample WHERE dataset_id = :dataset_id"),
        {"dataset_id": dataset_id}
    )

    records = df.to_dict(orient="records")

    for r in records:
        r["dataset_id"] = dataset_id
        r.setdefault("total", None)
        r.setdefault("month", None)
        r.setdefault("year", None)
        r.setdefault("error_level", None)
        r.setdefault("suggested_date", None)
        r.setdefault("suggested_month", None)
        r.setdefault("suggested_year", None)
        r.setdefault("suggested_category", None)
        r.setdefault("suggested_product", None)
        r.setdefault("suggested_price", None)
        r.setdefault("suggested_quantity", None)
        r.setdefault("suggested_total", None)
        r.setdefault("user_confirmed", False)
        r.setdefault("ai_correction", False)
        r.setdefault("corrected_field_by_ai", None)
        r.setdefault("corrected_data", None)

    db.bulk_insert_mappings(TempBusinessDataSample, records)
    db.commit()

    