from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
import shutil
import os
import uuid

from app.database import get_db
from app.models.business_data import BusinessData
from app.models.temp_business_data import TempBusinessData


from app.services.excel_reader import read_excel
from app.services.ai_column_mapper import map_columns, STANDARD_COLUMNS
from app.services.temp_data_service import save_temp_data
# from app.services.data_cleaner import clean_data


router = APIRouter()

@router.post("/upload")
async def upload_file(
    user_id: int = Form(...),
    dataset_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:

        # Save file temporarily
        os.makedirs("upload", exist_ok=True)

        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_location = os.path.join("upload", unique_filename)

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process Excel
        df = read_excel(file_location)

        # ai column mapping
        column_mapping, confidence = map_columns(
            df.columns.to_list(),
            dataset_id,
            db
        )

        # rename dataframe columns
        df = df.rename(columns=column_mapping)
        df = df[[col for col in df.columns if col in STANDARD_COLUMNS]]

        # insert into temp_business_data table
        save_temp_data(df, dataset_id, db)
    
        # Clean data and move to main table
        # df = clean_data(df)

        # Return response
        return {
            "status": "success",
            "rows_inserted": len(df),
            "columns_detected": df.columns.tolist(),
            "column_mapping": column_mapping,
            'confidence_scores': confidence
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
    
