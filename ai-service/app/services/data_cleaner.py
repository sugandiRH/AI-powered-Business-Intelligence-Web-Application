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
import calendar

# from app.services.finalize_dataset import finalize_dataset
from app.services.ai_row_correction import get_ai_row_correction

# check error level
CRITICAL = "critical"
WARNING = "warning"
INFO = "info"

SEVERITY_MAP : dict[str, int] = {
    "invalid_quantity" : CRITICAL,
    "invalid_price" : CRITICAL,
    "missing_product" : CRITICAL,

    "invalid_date" : WARNING,
    "invalid_month" : WARNING,
    "invalid_year" : WARNING,
    "month_date_mismatch" : WARNING,
    "year_date_mismatch" : WARNING,
    "price_outlier" : WARNING,
    "quantity_outlier" : WARNING,

    "total_mismatch" : INFO,
}


# month lookup maps
MONTH_NAME_MAP : dict[str, int] = {
    name.lower(): num 
    for num, name in enumerate(calendar.month_name)
    if name
}

MONTH_ABBR_MAP : dict[str, int] = {
    name.lower(): num 
    for num, name in enumerate(calendar.month_abbr) 
    if name
}

# Minimum number of rows per product before outlier detection is meaningful
OUTLIER_MIN_GROUP_SIZE = 3
 
# Multiplier for the "3× average" outlier rule
OUTLIER_MULTIPLIER = 3
 
# Tolerance for floating-point total mismatch check
TOTAL_TOLERANCE = 0.01


# parse month
def parse_month(value) -> int | None:
    if pd.isna(value):
        return None
    
    # numeric month check (1-12)
    try:
        num = int(float(str(value).strip()))
        if 1 <= num <= 12:
            return num
        # if it's numeric but out of range
        return pd.NA
    except (ValueError, TypeError):
        pass

    cleaned = str(value).strip().lower()

    if cleaned in MONTH_NAME_MAP:
        return MONTH_NAME_MAP[cleaned]
    if cleaned in MONTH_ABBR_MAP:
        return MONTH_ABBR_MAP[cleaned]
    
    # try parsing as date to extract month
    dt = pd.to_datetime(value, errors="coerce")
    if pd.notna(dt):
        return dt.month
    
    return value



# normalize the dataset
def normalize(df : pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df["category"] = df["category"].astype(str).str.strip().str.lower()
    df["product"] = df["product"].astype(str).str.strip().str.lower()

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df["month"] = df["month"].apply(parse_month)
    df["year"] = pd.to_numeric(df["year"], errors="coerce")
    df["total"] = pd.to_numeric(df["total"], errors="coerce")

    df["_errors"] = [[] for _ in range(len(df))]

    return df




# derive columns
def derive_columns(df : pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # fill month and year from date if missing

    if df["month"].isna().any():
        date_month = df["date"].dt.month
        date_year = df["date"].dt.year

        df["month"] = df["month"].where(df["month"].notna(), date_month)
        df["year"] = df["year"].where(df["year"].notna(), date_year)

    # calculate total
    missing_total = df["total"].isna() & df["quantity"].notna() & df["price"].notna() 
    df.loc[missing_total, "total"] = df["quantity"] * df["price"]

    # qty from total and price
    missing_quantity = df["quantity"].isna() & df["price"].notna() & df["total"].notna()
    df.loc[missing_quantity, "quantity"] = df["total"] / df["price"]

    # price from total and quantity
    missing_price = df["price"].isna() & df["quantity"].notna() & df["total"].notna()
    df.loc[missing_price, "price"] = df["total"] / df["quantity"]

    return df



# helper to add error to row
def _add_error(df : pd.DataFrame, mask: pd.Series, error_code : str) -> None:
    df.loc[mask, "_errors"] = df.loc[mask, "_errors"].apply(
        lambda errs: errs + [error_code]
    )

def _safe_int_month(val) -> int | None:
    try:
        n = int(float(str(val)))
        return n if 1 <= n <= 12 else None
    except (ValueError, TypeError):
        return None
    


#validation time columns
def validate_time(df : pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    now = pd.Timestamp.now()
    min_date = pd.Timestamp("2000-01-01")

    has_date = "date" in df.columns and df["date"].notna().any()
    has_month = "month" in df.columns and df["month"].notna().any()
    has_year = "year" in df.columns and df["year"].notna().any()

    # date validation
    if has_date:
        bad_date = df["date"].isna() | (df["date"] < min_date) | (df["date"] > now)
        _add_error(df, bad_date, "invalid_date")

    # month validation
    if has_month:
        def is_invalid_month(val):
            if pd.isna(val):
                return True
            return _safe_int_month(val) is None
        
        bad_month = df["month"].apply(is_invalid_month)
        _add_error(df, bad_month, "invalid_month")

    # year validation
    if has_year:
        bad_year = df["year"].isna()
        _add_error(df, bad_year, "invalid_year")


    # month-date mismatch    
    if has_date and has_month:
        valid_rows = df["date"].notna() & df["month"].notna()
        date_month = df["date"].dt.month
        row_month = df["month"].apply(_safe_int_month)
        month_differs = valid_rows & (date_month != row_month)
        _add_error(df, month_differs, "month_date_mismatch")

    if has_date and has_year:
        valid_rows = df["date"].notna() & df["year"].notna()
        date_year = df["date"].dt.year
        year_differs = valid_rows & (date_year != df["year"])
        _add_error(df, year_differs, "year_date_mismatch")    

    return df



# validation rules for quantity, price, product
def validate_business(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
 
    _add_error(df, df["quantity"].isna() | (df["quantity"] <= 0), "invalid_quantity")
    _add_error(df, df["price"].isna()    | (df["price"]    <= 0), "invalid_price")
    _add_error(df, df["product"] == "",                            "missing_product")
 
    # Total consistency check
    all_present = df["quantity"].notna() & df["price"].notna() & df["total"].notna()
    calculated  = df["quantity"] * df["price"]
    mismatch    = all_present & ((calculated - df["total"]).abs() > TOTAL_TOLERANCE)
    _add_error(df, mismatch, "total_mismatch")
 
    return df


# detect price and quantity outliers based on product averages
def detect_outliers(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

     # Group sizes
    df["_product_count"] = df.groupby("product")["quantity"].transform("count")
 
    # Quantity outliers
    df["_avg_quantity"] = df.groupby("product")["quantity"].transform("mean")
    qty_outlier = (
        df["quantity"].notna() &
        (df["quantity"] > df["_avg_quantity"] * OUTLIER_MULTIPLIER) &
        (df["_product_count"] >= OUTLIER_MIN_GROUP_SIZE)
    )
    _add_error(df, qty_outlier, "quantity_outlier")
 
    # Price outliers
    df["_avg_price"] = df.groupby("product")["price"].transform("mean")
    price_outlier = (
        df["price"].notna() &
        (df["price"] > df["_avg_price"] * OUTLIER_MULTIPLIER) &
        (df["_product_count"] >= OUTLIER_MIN_GROUP_SIZE)
    )
    _add_error(df, price_outlier, "price_outlier")
 
    # Drop helper columns — not stored in DB
    df.drop(columns=["_avg_quantity", "_avg_price", "_product_count"], inplace=True)

    return df


# finalized flag
def finalize_flag(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    def _highest_severity(errors: list[str]) -> str | None:
        if not errors:
            return None
        # priority: critical > warning > info
        for level in (CRITICAL, WARNING, INFO):
            if any(SEVERITY_MAP.get(e) == level for e in errors):
                return level
        return INFO  # fallback — unknown error codes treated as info
 
    df["validation_error"]    = df["_errors"].apply(
        lambda errs: ",".join(errs) if errs else None
    )
    df["validation_severity"] = df["_errors"].apply(_highest_severity)
    df["is_valid"]            = df["_errors"].apply(lambda errs: len(errs) == 0)
 
    df.drop(columns=["_errors"], inplace=True)
 
    return df


# update into database
# ✅ fixed — db.execute must be inside the loop
def persist(df: pd.DataFrame, db) -> None:
    for _, row in df.iterrows():
        month_val = _safe_int_month(row["month"]) if pd.notna(row["month"]) else None

        db.execute(  # ← indented one level in, runs for every row
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
                "month":            month_val,
                "validation_error": row["validation_error"],
                "is_valid":         bool(row["is_valid"]),
                "year":             int(row["year"])   if pd.notna(row["year"])  else None,
                "total":            float(row["total"]) if pd.notna(row["total"]) else None,
                "id":               row["id"]
            }
        )


# main function to clean dataset
def clean_dataset(dataset_id, db) -> None:
    rows = db.execute(
        text("SELECT * FROM temp_business_data WHERE dataset_id=:id"),
        {"id": dataset_id}
    ).fetchall()

    if not rows:
        return
    
    df = pd.DataFrame([row._mapping for row in rows])

    df = normalize(df)
    df = derive_columns(df)
    df = validate_time(df)
    df = validate_business(df)
    df = detect_outliers(df)
    df = finalize_flag(df)

    persist(df, db)
    db.commit()

    get_ai_row_correction(dataset_id, db)









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