import pandas as pd

def process_excel(file):

    try:
        df = pd.read_excel(file)
    except Exception as e:
        raise ValueError(f"Error reading Excel file: {e}")

    # 1️⃣ Check Required Columns
    required_columns = ["date", "product", "category", "quantity", "price"]

    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing columns: {missing_cols}")

    # 2️⃣ Handle Missing Values (NO inplace)
    df = df.dropna(subset=["date", "product"])
    df["price"] = df["price"].fillna(0)
    df["quantity"] = df["quantity"].fillna(0)

    # 3️⃣ Remove Duplicates (NO inplace)
    df = df.drop_duplicates()

    # 4️⃣ Convert Data Types
    df["date"] = pd.to_datetime(df["date"])
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")
    df["price"] = pd.to_numeric(df["price"], errors="coerce")

    df = df.dropna(subset=["quantity", "price"])

    return df