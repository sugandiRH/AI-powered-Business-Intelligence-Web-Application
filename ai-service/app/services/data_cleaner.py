from sqlalchemy import text
import pandas as pd

from app.services.finalize_dataset import finalize_dataset


def clean_dataset(dataset_id, db):

    rows = db.execute(
        text("SELECT * FROM temp_business_data WHERE dataset_id=:id"),
        {"id": dataset_id}
    ).fetchall()

    if not rows:
        return

    df = pd.DataFrame([row._mapping for row in rows])

    # normalize text
    df["product"] = df["product"].astype(str).str.strip().str.lower()
    df["category"] = df["category"].astype(str).str.strip().str.lower()

    # convert types
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")
    df["price"] = pd.to_numeric(df["price"], errors="coerce")

    df["month"] = pd.to_numeric(df["month"], errors="coerce")
    df["year"] = pd.to_numeric(df["year"], errors="coerce")
    df["total"] = pd.to_numeric(df["total"], errors="coerce")


    # derived columns
    df["month"] = df["month"].fillna(df["date"].dt.month)
    df["year"] = df["year"].fillna(df["date"].dt.year)
    

    # calculate total if not present
    df.loc[
        df["total"].isna() & df["quantity"].notna() & df["price"].notna(),
        "total"
    ] = df["quantity"] * df["price"]
    

    # create validation column
    df["validation_error"] = None

    # validation rules
    df.loc[df["date"].isna(), "validation_error"] = "invalid_date"
    df.loc[df["quantity"].isna() | (df["quantity"] <= 0), "validation_error"] = "invalid_quantity"
    df.loc[df["price"].isna() | (df["price"] <= 0), "validation_error"] = "invalid_price"
    df.loc[df["product"] == "", "validation_error"] = "missing_product"

    # quantity anomaly detection
    df["avg_quantity"] = df.groupby("product")["quantity"].transform("mean")

    df.loc[
        df["quantity"] > df["avg_quantity"] * 3,
        "validation_error"
    ] = "quantity_outlier"

    # price anomaly detection
    df["avg_price"] = df.groupby("product")["price"].transform("mean")

    #if quantity row null, calculate quantity and price from total
    df.loc[df["quantity"].isna() & df["price"].notna() & df["total"].notna(), "quantity"] = df["total"] / df["price"] 

    # if price row null, calculate price from total and quantity
    df.loc[df["price"].isna() & df["quantity"].notna() & df["total"].notna(), "price"] = df["total"] / df["quantity"]

    # check price outliers 
    df.loc[
        df["price"] > df["avg_price"] * 3,
        "validation_error"
    ] = "price_outlier"

    # final valid flag
    df["is_valid"] = df["validation_error"].isna()

    # update database
    for _, row in df.iterrows():

        db.execute(
            text("""
            UPDATE temp_business_data
            SET
                validation_error = :validation_error,
                month = :month,
                year = :year,
                total = :total,  
                is_valid = :is_valid
            WHERE id = :id
            """),
            {
                "validation_error": row["validation_error"],
                "is_valid": bool(row["is_valid"]),
                "month": int(row["month"]) if pd.notna(row["month"]) else None,
                "year": int(row["year"]) if pd.notna(row["year"]) else None,
                "total": float(row["total"]) if pd.notna(row["total"]) else None,
                "id": row["id"]
            }
        )

    df = finalize_dataset(dataset_id, db)
    # valid_rows = df[df["is_valid"]]
    # invalid_rows = df[~df["is_valid"]]

    # for _, row in valid_rows.iterrows():

    #     db.execute(
    #         text("""
    #         INSERT INTO business_data
    #         (dataset_id, date, month, year, product, category, quantity, price, total)
    #         VALUES
    #         (:dataset_id, :date, :month, :year, :product, :category, :quantity, :price, :total)
    #         """),
    #         {
    #             "dataset_id": row["dataset_id"],
    #             "date": row["date"],
    #             "month": row["month"],
    #             "year": row["year"],
    #             "product": row["product"],
    #             "category": row["category"],
    #             "quantity": row["quantity"],
    #             "price": row["price"],
    #             "total": row["total"]
    #         }
    #     )

    # valid_ids = valid_rows["id"].tolist()

    # if valid_ids:

    #     db.execute(
    #         text("DELETE FROM temp_business_data WHERE id IN (:ids)"),
    #         {"ids": tuple(valid_ids)}
    #     )

    # for _, row in invalid_rows.iterrows():

    #     db.execute(
    #         text("""
    #         UPDATE temp_business_data
    #         SET
    #             validation_error = :validation_error,
    #             is_valid = false
    #         WHERE id = :id
    #         """),
    #         {
    #             "validation_error": row["validation_error"],
    #             "id": row["id"]
    #         }
    #     )  

    
    # db.execute(
    #     text("""
    #     UPDATE datasets
    #     SET
    #         valid_rows = :valid,
    #         invalid_rows = :invalid,
    #         status = 'completed'
    #     WHERE id = :dataset_id
    #     """),
    #     {
    #         "valid": len(valid_rows),
    #         "invalid": len(invalid_rows),
    #         "dataset_id": dataset_id
    #     }
    # )      

    db.commit()