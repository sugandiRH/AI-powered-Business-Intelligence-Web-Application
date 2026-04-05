# this code for data cleaning and validation.
# convert month name to month number, 
# validate date, quantity, price, product columns
# derive month and year from date if missing
# calculate total if missing
# detect anomalies in price and quantity based on product averages
# mark rows with validation errors and update database
# data and month mismatch checks
# after cleaning, call ai service to correct invalid rows and update database again


from __future__ import annotations

from sqlalchemy import text
import pandas as pd

# from app.services.finalize_dataset import finalize_dataset
# from app.services.ai_row_correction import get_ai_row_correction

# import validation function
from app.services.validation_pipeline import (
    normalize,
    derive_columns,
    detect_outliers,
    validate_business,
    validate_time,
    detect_date_period_outliers,
    finalize_flag,
    persist,
)

# main function to clean dataset
def clean_dataset(dataset_id, db) -> None:
    rows = db.execute(
        text("SELECT * FROM temp_business_data_sample WHERE dataset_id=:id"),
        {"id": dataset_id}
    ).fetchall()

    if not rows:
        return
    
    df = pd.DataFrame([row._mapping for row in rows])

    df = normalize(df)
    df = derive_columns(df)
    df = validate_time(df)
    df = detect_date_period_outliers(df)
    df = validate_business(df)
    df = detect_outliers(df)
    df = finalize_flag(df)

    persist(df, db)
    db.commit()

    # get_ai_row_correction(dataset_id, db)









# from sqlalchemy import text
# import pandas as pd
# import calendar
# from scipy import stats

# from app.services.finalize_dataset import finalize_dataset
# from app.services.ai_row_correction import get_ai_row_correction

# # Month name mappings — built once at module level
# MONTH_NAME_MAP = {name.lower(): num for num, name in enumerate(calendar.month_name) if name}
# MONTH_ABBR_MAP = {name.lower(): num for num, name in enumerate(calendar.month_abbr) if name}

# def parse_month(value):
#     if pd.isna(value):
#         return pd.NA
#     try:
#         num = int(float(str(value).strip()))
#         if 1 <= num <= 12:
#             return num
#     except (ValueError, TypeError):
#         pass

#     cleaned = str(value).strip().lower()

#     if cleaned in MONTH_NAME_MAP:
#         return MONTH_NAME_MAP[cleaned]
#     if cleaned in MONTH_ABBR_MAP:
#         return MONTH_ABBR_MAP[cleaned]
    
#     dt = pd.to_datetime(value, errors="coerce")
#     if pd.notna(dt):
#         return dt.month
    
#     return value


# def clean_dataset(dataset_id, db):

#     rows = db.execute(
#         text("SELECT * FROM temp_business_data WHERE dataset_id=:id"),
#         {"id": dataset_id}
#     ).fetchall()

#     if not rows:
#         return
    
#     df = pd.DataFrame([row._mapping for row in rows])

#     df["category"] = df["category"].astype(str).str.strip().str.lower()
#     df["product"] = df["product"].astype(str).str.strip().str.lower()

#     # convert types
#     df["date"] = pd.to_datetime(df["date"], errors="coerce")
#     df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")
#     df["price"] = pd.to_numeric(df["price"], errors="coerce")

#     df["month"] = df["month"].apply(parse_month)
#     df["year"] = pd.to_numeric(df["year"], errors="coerce")
#     df["total"] = pd.to_numeric(df["total"], errors="coerce")


#     # derived columns
#     if df["month"].isna().any():
#         df["month"] = df["month"].fillna(df["date"].dt.month)
#     if df["year"].isna().any():
#         df["year"] = df["year"].fillna(df["date"].dt.year)

#     # calculate total if not present
#     df.loc[
#         df["total"].isna() & df["quantity"].notna() & df["price"].notna(),
#         "total"
#     ] = df["quantity"] * df["price"]

    
    

#     # create validation column
#     df["validation_error"] = None

#     # validation rules for time columns
#     if "date" in df.columns and df["date"].notna().any():
#         df.loc[
#             df["date"].isna() | (df["date"] < pd.Timestamp("2000-01-01")) | (df["date"] > pd.Timestamp.now()),
#             "validation_error"
#         ] = "invalid_date"

#     elif "month" in df.columns and df["month"].notna().any():
#         # If only month exists, mark row invalid if month is missing
#         def is_invalid_month(val):
#             if pd.isna(val):
#                 return True
#             try:
#                 num = int(float(str(val)))
#                 return not (1 <= num <= 12)
#             except (ValueError, TypeError):
#                 return True  # non-numeric string like "abcd"

#         df.loc[df["month"].apply(is_invalid_month), "validation_error"] = "invalid_month"


#     elif "year" in df.columns and df["year"].notna().any():
#         df.loc[df["year"].isna(), "validation_error"] = "invalid_year"


#     # After the elif chain, add a mismatch check:
#     if "date" in df.columns and df["date"].notna().any():
    
#         # Month mismatch
#         if "month" in df.columns:
#             month_mismatch = (
#                 df["date"].notna() &
#                 df["month"].notna() &
#                 (df["date"].dt.month != df["month"].apply(
#                     lambda x: int(x) if str(x).lstrip('-').isdigit() else None
#                 ))
#             )
#             df.loc[month_mismatch, "validation_error"] = "month_date_mismatch"

#         # Year mismatch — catches your 2023 in a 2025/2026 dataset
#         if "year" in df.columns:
#             year_mismatch = (
#                 df["date"].notna() &
#                 df["year"].notna() &
#                 (df["date"].dt.year != df["year"])
#             )
#             df.loc[year_mismatch, "validation_error"] = "year_date_mismatch"

#     # validation rules
    
#     df.loc[
#         df["quantity"].isna() | (df["quantity"] <= 0), "validation_error"
#         ] = "invalid_quantity"
#     df.loc[
#         df["price"].isna() | (df["price"] <= 0), "validation_error"
#         ] = "invalid_price"
#     df.loc[
#         df["product"] == "", "validation_error"
#         ] = "missing_product"



#     #if quantity row null, calculate quantity and price from total
#     df.loc[df["quantity"].isna() & df["price"].notna() & df["total"].notna(), "quantity"] = df["total"] / df["price"] 

#     # if price row null, calculate price from total and quantity
#     df.loc[df["price"].isna() & df["quantity"].notna() & df["total"].notna(), "price"] = df["total"] / df["quantity"]

#     # price anomaly detection
#     df["avg_price"] = df.groupby("product")["price"].transform("mean")

#     # check price outliers 
#     df.loc[
#         df["price"] > df["avg_price"] * 3,
#         "validation_error"
#     ] = "price_outlier"


#     # quantity anomaly detection
#     df["avg_quantity"] = df.groupby("product")["quantity"].transform("mean")

#     df.loc[
#         df["quantity"] > df["avg_quantity"] * 3,
#         "validation_error"
#     ] = "quantity_outlier"

#     # final valid flag
#     df["is_valid"] = df["validation_error"].isna()

#     # update database
#     for _, row in df.iterrows():

#         db.execute(
#             text("""
#             UPDATE temp_business_data
#             SET
#                 validation_error = :validation_error,
#                 month = :month,
#                 year = :year,
#                 total = :total,  
#                 is_valid = :is_valid
#             WHERE id = :id
#             """),
#             {
#                 "validation_error": row["validation_error"],
#                 "is_valid": bool(row["is_valid"]),
#                 "month": int(row["month"]) if pd.notna(row["month"]) and str(row["month"]).lstrip('-').isdigit() else None,
#                 "year": int(row["year"]) if pd.notna(row["year"]) else None,
#                 "total": float(row["total"]) if pd.notna(row["total"]) else None,
#                 "id": row["id"]
#             }
#         )

#     # df = finalize_dataset(dataset_id, db)

#     # call ai for invalid rows
#     get_ai_row_correction(dataset_id, db)

#     db.commit()