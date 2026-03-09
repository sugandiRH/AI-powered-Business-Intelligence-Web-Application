from fastapi import APIRouter, UploadFile, File, Form, Depends
from app.services.excel_service import process_excel
from app.database import get_db
from sqlalchemy.orm import Session
import shutil
import os
from app.models.business_data import BusinessData
from sqlalchemy import text

# for modify upload
from fastapi import HTTPException
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_file(
    user_id: int = Form(...),
    dataset_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:

        # 1. Save file temporarily
        os.makedirs("upload", exist_ok=True)

        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_location = os.path.join("upload", unique_filename)

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Process Excel
        df = process_excel(file_location)

        # 3. Insert into DB
        db.execute(
            text("DELETE FROM business_data WHERE dataset_id = :dataset_id"),
            {"dataset_id": dataset_id}
        )

        # Prepare bulk records
        records = df.to_dict(orient="records")

        for record in records:
            record["user_id"] = user_id
            record["dataset_id"] = dataset_id

        db.bulk_insert_mappings(BusinessData, records)
        db.commit()

        # 4. Return response
        return {
            "status": "success",
            "rows_inserted": len(df),
            "dataset_id": dataset_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))