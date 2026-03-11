# This module provides functionality to read Excel files and return a DataFrame.

import pandas as pd

def read_excel(file_path: str):

    try:
        df = pd.read_excel(file_path)

        # remove empty columns
        df = df.dropna(axis=1, how="all")


    except Exception as e:
        raise ValueError(f"Error reading Excel file: {e}")

    return df