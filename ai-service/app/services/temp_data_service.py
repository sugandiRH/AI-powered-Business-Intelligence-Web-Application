from app.models.temp_business_data import TempBusinessData
from sqlalchemy import text

def save_temp_data(df, dataset_id, db):

    db.execute(
        text("DELETE FROM temp_business_data WHERE dataset_id = :dataset_id"),
        {"dataset_id": dataset_id}
    )

    records = df.to_dict(orient="records")

    for r in records:
        r["dataset_id"] = dataset_id
        r.setdefault("total", None)
        r.setdefault("month", None)
        r.setdefault("year", None)

    db.bulk_insert_mappings(TempBusinessData, records)
    db.commit()

    