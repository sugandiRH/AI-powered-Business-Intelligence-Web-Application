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
    
    "invalid_quantity":      CRITICAL,   # missing or non-positive quantity
    "invalid_price":         CRITICAL,   # missing or non-positive price
    "missing_product":       CRITICAL,   # blank / null product name
    "unresolvable_row":      CRITICAL,   # can't derive any of qty/price/total
 
    "invalid_date":          WARNING,    # null, future, or pre-2000 date
    "invalid_month":         WARNING,    # month doesn't parse to 1–12
    "invalid_year":          WARNING,    # year null or out of range
    "month_date_mismatch":   WARNING,    # month column ≠ month in date col
    "year_date_mismatch":    WARNING,    # year column ≠ year in date col
    "price_outlier":         WARNING,    # price > 3× product average
    "quantity_outlier":      WARNING,    # quantity > 3× product average
    "price_inconsistency":   WARNING,    # same product has different prices
    "missing_category":      WARNING,    # category blank or null
    "duplicate_row":         WARNING,    # exact duplicate of another row

    "total_mismatch":        INFO,       # total ≠ quantity × price (small diff)
    "derived_month":         INFO,       # month was missing; filled from date
    "derived_year":          INFO,       # year was missing; filled from date
    "derived_total":         INFO,       # total was missing; calculated
    "derived_quantity":      INFO,       # quantity was missing; back-calculated
    "derived_price":         INFO,       # price was missing; back-calculated
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

OUTLIER_MIN_GROUP_SIZE         = 3
OUTLIER_MULTIPLIER             = 3
TOTAL_TOLERANCE                = 0.01
MIN_DATE                       = pd.Timestamp("2015-01-01")
MAX_YEAR                       = pd.Timestamp.now().year
DATE_PERIOD_OUTLIER_YEARS      = 1
DATE_PERIOD_DOMINANT_THRESHOLD = 0.6




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




# normalize the dataset
def normalize(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    REQUIRED_COLUMNS = ["date", "product", "category", "quantity", "price", "total"]
    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            df[col] = None

    for col in ("product", "category"):
        if col in df.columns:
            df[col] = (
                df[col].astype(str).str.strip().str.lower()
                .replace({"nan": None, "none": None, "": None})
            )
        else:
              df[col] = None   

    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
 
    for col in ("quantity", "price", "total"):
        if col in df.columns:
            df[col] = (
                df[col].astype(str)
                .str.replace(r"[^\d.\-]", "", regex=True)
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
 
    for col in ("suggested_month", "suggested_year"):
        df[col] = pd.array([pd.NA] * len(df), dtype="Int64")

    for col in (
        "suggested_total", "suggested_quantity", "suggested_price",
        "mean_quantity", "mean_price",
    ):
        df[col] = np.nan  # float64 from the start, not object


    df["_errors"] = [[] for _ in range(len(df))]
 
    return df





# derive columns
def derive_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    has_date = df["date"].notna()

    df.loc[has_date, "suggested_month"] = df.loc[has_date, "date"].dt.month
 
    missing_month = df["month"].isna() & has_date
    if missing_month.any():
        df.loc[missing_month, "month"] = df.loc[missing_month, "date"].dt.month
        _add_error(df, missing_month, "derived_month")


    df.loc[has_date, "suggested_year"] = df.loc[has_date, "date"].dt.year    

    missing_year = df["year"].isna() & has_date
    if missing_year.any():
        df.loc[missing_year, "year"] = df.loc[missing_year, "date"].dt.year
        _add_error(df, missing_year, "derived_year")
 

    valid_total = df["total"].notna() & (df["total"] > 0)
    valid_qty   = df["quantity"].notna() & (df["quantity"] > 0)
    valid_price = df["price"].notna() & (df["price"] > 0)


    can_calc_total = valid_qty & valid_price
    df.loc[can_calc_total, "suggested_total"] = (
        df.loc[can_calc_total, "quantity"] * df.loc[can_calc_total, "price"]
    )
 
    can_calc_qty = valid_total & valid_price
    df.loc[can_calc_qty, "suggested_quantity"] = (
        df.loc[can_calc_qty, "total"] / df.loc[can_calc_qty, "price"]
    )
 
    can_calc_price = valid_total & valid_qty
    df.loc[can_calc_price, "suggested_price"] = (
        df.loc[can_calc_price, "total"] / df.loc[can_calc_price, "quantity"]
    )
 
    # fill missing values
    derive_total = df["total"].isna() & can_calc_total
    if derive_total.any():
        df.loc[derive_total, "total"] = df.loc[derive_total, "suggested_total"]
        _add_error(df, derive_total, "derived_total")
 
    derive_qty = df["quantity"].isna() & can_calc_qty
    if derive_qty.any():
        df.loc[derive_qty, "quantity"] = df.loc[derive_qty, "suggested_quantity"]
        _add_error(df, derive_qty, "derived_quantity")
 
    derive_price = df["price"].isna() & can_calc_price
    if derive_price.any():
        df.loc[derive_price, "price"] = df.loc[derive_price, "suggested_price"]
        _add_error(df, derive_price, "derived_price")
 
    still_empty = df["quantity"].isna() & df["price"].isna() & df["total"].isna()
    _add_error(df, still_empty, "unresolvable_row")

    return df

    


#validation time columns
def validate_time(df : pd.DataFrame) -> pd.DataFrame:
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
    if has_month:
        def is_invalid_month(val):
            if pd.isna(val):
                return True
            return _safe_int_month(val) is None
        
        bad_month = df["month"].apply(is_invalid_month)
        _add_error(df, bad_month, "invalid_month")

    # year validation
    if has_year:
        bad_year = df["year"].isna() | (df["year"] < 2000) | (df["year"] > MAX_YEAR)
        _add_error(df, bad_year, "invalid_year")


    # month-date mismatch    
    if has_date and has_month:
        valid = df["date"].notna() & df["month"].notna()
        mismatch = valid & (df["date"].dt.month != df["month"].apply(_safe_int_month))
        _add_error(df, mismatch, "month_date_mismatch")

    if has_date and has_year:
        valid = df["date"].notna() & df["year"].notna()
        mismatch = valid & (df["date"].dt.year != df["year"])
        _add_error(df, mismatch, "year_date_mismatch")    

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
    _add_error(df, df["product"].isna(), "missing_product")
    _add_error(df, df["category"].isna(), "missing_category")
 
    # Total consistency check
    all_present = df["quantity"].notna() & df["price"].notna() & df["total"].notna()
    calculated  = df["quantity"] * df["price"]
    mismatch    = all_present & ((calculated - df["total"]).abs() > TOTAL_TOLERANCE)
    _add_error(df, mismatch, "total_mismatch")

    if df["product"].notna().any():
        price_counts = (
            df[df["price"].notna()]
            .groupby("product")["price"]
            .nunique()
        )
        multi_price_products = price_counts[price_counts > 1].index
        price_inconsistency = df["product"].isin(multi_price_products) & df["price"].notna()
        _add_error(df, price_inconsistency, "price_inconsistency")
 
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
    avg_qty = df.groupby("product")["quantity"].transform("mean")
    large_group = group_size >= OUTLIER_MIN_GROUP_SIZE
 
    qty_high = df["quantity"].notna() & large_group & (
        df["quantity"] > avg_qty * OUTLIER_MULTIPLIER
    )
    qty_low  = df["quantity"].notna() & large_group & avg_qty.notna() & (avg_qty > 0) & (
        df["quantity"] < avg_qty / OUTLIER_MULTIPLIER
    )
    _add_error(df, qty_high | qty_low, "quantity_outlier")
 
    # ── price ─────────────────────────────────────────────────────────────────
    avg_price = df.groupby("product")["price"].transform("mean")
 
    price_high = df["price"].notna() & large_group & (
        df["price"] > avg_price * OUTLIER_MULTIPLIER
    )
    price_low  = df["price"].notna() & large_group & avg_price.notna() & (avg_price > 0) & (
        df["price"] < avg_price / OUTLIER_MULTIPLIER
    )
    _add_error(df, price_high | price_low, "price_outlier")

    qty_outlier = qty_high | qty_low
    _add_error(df, qty_outlier, "quantity_outlier")
    df.loc[qty_outlier, "mean_quantity"] = avg_qty[qty_outlier].round(2).values  # ← .values fixes the array error

    price_outlier = price_high | price_low
    _add_error(df, price_outlier, "price_outlier")
    df.loc[price_outlier, "mean_price"] = avg_price[price_outlier].round(2).values  # ← .values fixes the array error

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
 
        codes = row["validation_error"].split(",")
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
            "suggested_month":     int(row["suggested_month"]) if pd.notna(row.get("suggested_month")) else None,
            "suggested_year":      int(row["suggested_year"])  if pd.notna(row.get("suggested_year"))  else None,
            "suggested_total":     _float_or_none(row.get("suggested_total")),
            "suggested_quantity":  _float_or_none(row.get("suggested_quantity")),
            "suggested_price":     _float_or_none(row.get("suggested_price")),
            "mean_quantity":       _float_or_none(row.get("mean_quantity")),
            "mean_price":          _float_or_none(row.get("mean_price")),
            "validation_errors":   json.dumps(row["validation_error"].split(",")) if row.get("validation_error") else json.dumps([]),
            
            "error_level":         row.get("error_level"),
            "needs_review":        bool(row["needs_review"]),
            "is_valid":            bool(row["is_valid"]),
        })
 
    
    db.execute(
            text("""
                UPDATE temp_business_data SET
                    month               = :month,
                    year                = :year,
                    total               = :total,
                    quantity            = :quantity,
                    price               = :price,
                    suggested_month     = :suggested_month,
                    suggested_year      = :suggested_year,
                    suggested_total     = :suggested_total,
                    suggested_quantity  = :suggested_quantity,
                    suggested_price     = :suggested_price,
                    mean_quantity       = :mean_quantity,
                    mean_price          = :mean_price,
                    validation_errors    = :validation_errors,
                    error_level         = :error_level,
                    needs_review        = :needs_review,
                    is_valid            = :is_valid
                WHERE id = :id
            """),
            rows,
        )