from __future__ import annotations
import json

from sqlalchemy import text
import pandas as pd
import calendar
import numpy as np

# check error level
CRITICAL = "critical"
WARNING = "warning"
INFO = "info"

SEVERITY_MAP : dict[str, int] = {

    "missing_product":       CRITICAL,
    "unresolvable_row":      CRITICAL,   # can't derive any of qty/price/total  
    "invalid_quantity":      CRITICAL, 
    "invalid_price":         CRITICAL,  
    "invalid_date":          CRITICAL,
    
    "missing_date":          WARNING,
    "month_date_mismatch":   WARNING,    # month column ≠ month in date col 
    "year_date_mismatch":    WARNING,    # year column ≠ year in date col
    "date_period_outlier":   WARNING,
    "price_outlier":         WARNING,    # price > 2× product average
    "quantity_outlier":      WARNING,    # quantity > 2× product average
    "missing_quantity":      WARNING,      
    "missing_price":         WARNING, 
    "duplicate_row":         WARNING,   
    "missing_category":      WARNING,

    "derived_month":         INFO,    # month derived from date
    "derived_year":          INFO,    # year derived from date
    "derived_total":         INFO,    
    "derived_price":         INFO,
    "derived_quantity":      INFO,
    "total_mismatch":        INFO,    
    "invalid_month":         INFO,    
    "invalid_year":          INFO,    # year null or out of range
    
}

USER_MESSAGES: dict[str, str] = {
    "invalid_quantity":    "Quantity is missing or zero — please enter a valid quantity.",
    "invalid_price":       "Price is missing or zero — please enter a valid price.",
    "missing_product":     "Product name is missing — this field is required.",
    "unresolvable_row":    "Cannot determine quantity, price, or total — at least two of these are needed.",
    "invalid_date":        "Date is missing, in the future, or before the allowed minimum date.",
    "invalid_month":       "Month is not a valid value (expected 1–12 or a month name).",
    "invalid_year":        "Year is missing or outside the valid range.",
    "month_date_mismatch": "The month column doesn't match the month in the date column.",
    "year_date_mismatch":  "The year column doesn't match the year in the date column.",
    "price_inconsistency": "This product has different prices across rows — please confirm which is correct.",
    "price_outlier":       "Price looks unusually high or low compared to other rows for this product.",
    "quantity_outlier":    "Quantity looks unusually high or low compared to other rows for this product.",
    "missing_category":    "Category is missing — assigning a category improves reporting.",
    "duplicate_row":       "This row appears to be a duplicate of another row in this upload.",
    "date_period_outlier": "This date is far from the period of most other rows — please confirm it is correct.",
    "total_mismatch":      "Total doesn't exactly match quantity × price.",
    "derived_month":       "Month was not provided — filled automatically from the date column.",
    "derived_year":        "Year was not provided — filled automatically from the date column.",
    "derived_total":       "Total was not provided — calculated as quantity × price.",
    "derived_quantity":    "Quantity was not provided — calculated as total ÷ price.",
    "derived_price":       "Price was not provided — calculated as total ÷ quantity.",
}



OUTLIER_MIN_GROUP_SIZE         = 2
OUTLIER_MULTIPLIER             = 2
TOTAL_TOLERANCE                = 0.01
MIN_DATE                       = pd.Timestamp("2015-12-30")
MAX_YEAR                       = pd.Timestamp.now().year
DATE_PERIOD_OUTLIER_YEARS      = 1
DATE_PERIOD_DOMINANT_THRESHOLD = 0.6



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

# parse month
def parse_month(value) -> int | None:
    if pd.isna(value):
        return None
    
    # numeric month check (1-12)
    try:
        num = int(float(str(value).strip()))
        return num if 1 <= num <= 12 else None
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


# helper to add error to row
def _add_error(df : pd.DataFrame, mask: pd.Series, error_code : str) -> None:
    if not mask.any():
        return
    df.loc[mask, "_errors"] = df.loc[mask, "_errors"].apply(
        lambda errs: errs + [error_code]
    )
   

def _float_or_none(val) -> float | None:
    try:
        return float(val) if pd.notna(val) else None
    except (ValueError, TypeError):
        return None


def _safe_int_month(val) -> int | None:
    
    if pd.isna(val):
        return None
    try:
        n = int(float(str(val)))
        return n if 1 <= n <= 12 else None
    except (ValueError, TypeError):
        pass
    cleaned = str(val).strip().lower()
    return MONTH_NAME_MAP.get(cleaned) or MONTH_ABBR_MAP.get(cleaned)






# normalize the dataset
def normalize(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    for col in ("product", "category"):
        if col in df.columns:
            df[col] = (
                df[col].astype(str).str.strip().str.lower()
                .replace({"nan": None, "none": None, "": None})
            )

    if "date" in df.columns:

        # test
        # print("BEFORE:", df["date"].head(5).tolist(), flush=True)
        # df["date"] = pd.to_datetime(df["date"], errors="coerce")
        # print("AFTER:", df["date"].head(5).tolist(), flush=True)

        df["date"] = (
            df["date"]
            .astype(str)
            .str.strip()
            .replace({"": None, "nan": None})
        )
        # Use infer_datetime_format for flexible parsing, handles '2026 Jan 06' correctly
        df["date"] = pd.to_datetime(df["date"], errors="coerce", dayfirst=False, format="mixed")


    for col in ("quantity", "price", "total"):
        if col in df.columns:
            df[col] = (
                df[col].astype(str)
                .replace("", None)
                .pipe(pd.to_numeric, errors="coerce")
            )
        else:
            df[col] = None  

    df["month"] = df["month"].apply(parse_month) if "month" in df.columns else None
    df["year"] = (
        pd.to_numeric(df["year"], errors="coerce").astype("Int64")
        if "year" in df.columns else None
    )
 
    df["_errors"] = [[] for _ in range(len(df))]
 
    return df


# derive columns
def derive_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    has_date = df["date"].notna()

    # month derive
    missing_month = df["month"].isna() & has_date
    df.loc[missing_month, "month"] = df.loc[missing_month, "date"].dt.month
    _add_error(df, missing_month, "derived_month")

    # year derive
    missing_year = df["year"].isna() & has_date
    df.loc[missing_year, "year"] = df.loc[missing_year, "date"].dt.year
    _add_error(df, missing_year, "derived_year")

    # total derive
    valid = df["quantity"].notna() & df["price"].notna()
    missing_total = df["total"].isna() & valid
    _add_error(df, df["total"].isna() & ~valid, "unresolvable_row")

    df.loc[missing_total, "total"] = df["quantity"] * df["price"]
    _add_error(df, missing_total, "derived_total")

    _add_error(df, df["date"].isna(), "missing_date")
    _add_error(df, df["product"] == "", "missing_product")

    return df


def validate_time(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    now = pd.Timestamp.now()

    has_date = "date" in df.columns and df["date"].notna().any()
    has_month = "month" in df.columns and df["month"].notna().any()
    has_year = "year" in df.columns and df["year"].notna().any()

    # date validation
    if has_date:
        bad_date = df["date"].isna() | (df["date"] < MIN_DATE) | (df["date"] > now)
        _add_error(df, bad_date, "invalid_date")
        

    # month validation
    # 
    if has_month:
        bad_month = df["month"].apply(lambda v: pd.isna(v) or _safe_int_month(v) is None)
        # if date exists, month was already derived — just INFO
        has_date_col = df["date"].notna()
        _add_error(df,  bad_month & has_date_col,  "invalid_month")   # INFO in SEVERITY_MAP
        _add_error(df,  bad_month & ~has_date_col, "invalid_month")   # stays WARNING (no recovery)

    
    # year validation
    if has_year:
        bad_year = df["year"].isna() | (df["year"] < 2000) | (df["year"] > MAX_YEAR)
        _add_error(df, bad_year, "invalid_year")



    #month date mismatch 
    if has_date and has_month:
        month_mismatch = (
            df["date"].notna() &
            df["month"].notna() &
            (df["date"].dt.month != df["month"].apply(
                lambda x: int(x) if str(x).lstrip('-').isdigit() else None
            ))
        )
        # add suggestion to fix month if date is valid
        df.loc[month_mismatch, "suggested_month"] = df.loc[month_mismatch, "date"].dt.month
        _add_error(df, month_mismatch, "month_date_mismatch")

    if has_date and has_year:
        valid = df["date"].notna() & df["year"].notna()
        mismatch = valid & (df["date"].dt.year != df["year"])
        df.loc[mismatch, "suggested_year"] = df.loc[mismatch, "date"].dt.year
        _add_error(df, mismatch, "year_date_mismatch")    

    _add_error(df, df["category"].isna(), "missing_category")   

    _add_error(df, df["quantity"].isna(), "missing_quantity")
    _add_error(df, df["quantity"] <= 0, "invalid_quantity")

    _add_error(df, df["price"].isna(), "missing_price")
    _add_error(df, df["price"] <= 0, "invalid_price") 

    return df
   

# daye period outlier detection
def detect_date_period_outliers(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
 
    if "date" not in df.columns:
        return df
 
    valid_dates = df["date"].dropna()
    if valid_dates.empty:
        return df
 
    year_counts   = valid_dates.dt.year.value_counts(normalize=True)
    dominant_year = next(
        (yr for yr, frac in year_counts.items() if frac >= DATE_PERIOD_DOMINANT_THRESHOLD),
        None
    )
 
    if dominant_year is None:
        return df
 
    row_year = df["date"].dt.year
    outlier  = df["date"].notna() & (
        (row_year < dominant_year - DATE_PERIOD_OUTLIER_YEARS) |
        (row_year > dominant_year + DATE_PERIOD_OUTLIER_YEARS)
    )
    _add_error(df, outlier, "date_period_outlier")
    df.attrs["dominant_year"] = int(dominant_year)
 
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
    df.loc[mismatch, "suggested_total"] = calculated[mismatch]
    _add_error(df, mismatch, "total_mismatch")

    # if df["product"].notna().any():
    #     price_counts = (
    #         df[df["price"].notna()]
    #         .groupby("product")["price"]
    #         .nunique()
    #     )
    #     multi_price_products = price_counts[price_counts > 1].index
    #     price_inconsistency = df["product"].isin(multi_price_products) & df["price"].notna()
    #     _add_error(df, price_inconsistency, "price_inconsistency")
 
    # ── duplicate rows ────────────────────────────────────────────────────────
    dup_cols = [c for c in ("date", "product", "quantity", "price") if c in df.columns]
    if dup_cols:
        is_dup = df.duplicated(subset=dup_cols, keep=False)
        _add_error(df, is_dup, "duplicate_row")
 
    return df


# detect price and quantity outliers based on product averages
def detect_outliers(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
 
    group_size = df.groupby("product")["quantity"].transform("count")
 
    # ── quantity ──────────────────────────────────────────────────────────────
    avg_qty = df.groupby("product")["quantity"].transform("median")
    large_group = group_size >= OUTLIER_MIN_GROUP_SIZE
 
    qty_high = df["quantity"].notna() & large_group & (
        df["quantity"] > avg_qty * OUTLIER_MULTIPLIER
    )
    qty_low  = df["quantity"].notna() & large_group & avg_qty.notna() & (avg_qty > 0) & (
        df["quantity"] < avg_qty / OUTLIER_MULTIPLIER
    )
    # _add_error(df, qty_high | qty_low, "quantity_outlier")
 
    # ── price ─────────────────────────────────────────────────────────────────
    avg_price = df.groupby("product")["price"].transform("median")
 
    price_high = df["price"].notna() & large_group & (
        df["price"] > avg_price * OUTLIER_MULTIPLIER
    )
    price_low  = df["price"].notna() & large_group & avg_price.notna() & (avg_price > 0) & (
        df["price"] < avg_price / OUTLIER_MULTIPLIER
    )
    # _add_error(df, price_high | price_low, "price_outlier")

    qty_outlier = qty_high | qty_low
    _add_error(df, qty_outlier, "quantity_outlier")
    # df.loc[qty_outlier, "mean_quantity"] = avg_qty[qty_outlier].round(2)
    df.loc[qty_outlier,   "mean_quantity"] = df.groupby("product")["quantity"].transform("mean")[qty_outlier].round(2).values

    price_outlier = price_high | price_low
    _add_error(df, price_outlier, "price_outlier")
    # df.loc[price_outlier, "mean_price"] = avg_price[price_outlier].round(2)
    df.loc[price_outlier,   "mean_price"] = df.groupby("product")["price"].transform("mean")[price_outlier].round(2).values

    return df




# finalized flag
def finalize_flag(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
 
    def _highest_severity(errors: list[str]) -> str | None:
        if not errors:
            return None
        for level in (CRITICAL, WARNING, INFO):
            if any(SEVERITY_MAP.get(e) == level for e in errors):
                return level
        return INFO
 
    df["validation_error"]    = df["_errors"].apply(lambda e: ",".join(e) if e else None)
    
    df["error_level"]         = df["_errors"].apply(_highest_severity)
    df["needs_review"]        = df["error_level"].isin([CRITICAL, WARNING])
    df["is_valid"]            = df["_errors"].apply(lambda e: len(e) == 0)
 
    df.drop(columns=["_errors"], inplace=True)
    return df



def build_review_queue(df: pd.DataFrame) -> list[dict]:
    """
    Returns one dict per flagged row for the front-end correction UI.
    Each dict has:
      raw       — the values from the upload
      suggested — what the system thinks the correct values are
      context   — product group averages (for outlier rows)
      issues    — list of error details with user messages
      notice    — plain-English summary for date period outliers
    """
    dominant_year = df.attrs.get("dominant_year")
    queue = []
 
    for _, row in df[df["needs_review"] == True].iterrows():
        if not row.get("validation_error"):
            continue
 
        val_err = row["validation_error"]
        if isinstance(val_err, str):
            codes = val_err.split(",")
        else:
            codes = []
        issues, requires_fix = [], False
 
        for code in codes:
            level = SEVERITY_MAP.get(code, INFO)
            if level == CRITICAL:
                requires_fix = True
            issues.append({
                "code":      code,
                "message":   USER_MESSAGES.get(code, f"Unknown issue: {code}"),
                "level":     level,
                "needs_fix": level == CRITICAL,
            })
 
        notice = None
        if "date_period_outlier" in codes and dominant_year:
            notice = (
                f"Most rows in this upload are from {dominant_year}. "
                f"This row has a date outside that period — please confirm it is correct."
            )
 
        queue.append({
            "id":           row.get("id"),
            "error_level":  row["error_level"],
            "requires_fix": requires_fix,
            "issues":       issues,
            "notice":       notice,
            "raw": {
                "date":     str(row["date"]) if pd.notna(row.get("date")) else None,
                "month":    row.get("month"),
                "year":     row.get("year"),
                "product":  row.get("product"),
                "category": row.get("category"),
                "quantity": _float_or_none(row.get("quantity")),
                "price":    _float_or_none(row.get("price")),
                "total":    _float_or_none(row.get("total")),
            },
            "suggested": {
                "month":    row.get("suggested_month"),
                "year":     row.get("suggested_year"),
                "total":    _float_or_none(row.get("suggested_total")),
                "quantity": _float_or_none(row.get("suggested_quantity")),
                "price":    _float_or_none(row.get("suggested_price")),
            },
            "context": {
                "mean_quantity": _float_or_none(row.get("mean_quantity")),
                "mean_price":    _float_or_none(row.get("mean_price")),
            },
        })
 
    return queue





# update into database
def persist(df: pd.DataFrame, db) -> None:

    rows = []
    for _, row in df.iterrows():
        rows.append({
            "id":                  row["id"],
            "month":               _safe_int_month(row.get("month")) if pd.notna(row.get("month")) else None,
            "year":                int(row["year"])  if pd.notna(row.get("year"))  else None,
            "total":               _float_or_none(row.get("total")),
            "quantity":            _float_or_none(row.get("quantity")),
            "price":               _float_or_none(row.get("price")),
            "validation_errors":   json.dumps(row["validation_error"].split(",")) if isinstance(row.get("validation_error"), str) else json.dumps([]),
            
            "error_level":         row.get("error_level"),
            "is_valid":            bool(row["is_valid"]),
        })
 
    
    db.execute(
            text("""
                UPDATE temp_business_data_sample SET
                    month               = :month,
                    year                = :year,
                    total               = :total,
                    quantity            = :quantity,
                    price               = :price,
                    validation_errors    = :validation_errors,
                    error_level         = :error_level,
                    is_valid            = :is_valid
                WHERE id = :id
            """),
            rows,
        )