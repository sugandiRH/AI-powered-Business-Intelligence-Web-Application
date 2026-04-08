from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.ai_warning_correction import warning_confirm
from app.schema.warning_correction import WarningCorrectionRequest

router = APIRouter()

@router.post("/confirm_warning_ai")

async def warning_confirm_endpoint(
    data: WarningCorrectionRequest,
    db: Session = Depends(get_db)
):

    try:

        dataset_id = data.dataset_id
        print("Dataset ID:", dataset_id)

        result = warning_confirm(dataset_id, db)

        return {
            "message": "Warning confirmation completed successfully",
            "dataset_id": dataset_id,
            "corrected_data" : len(result) if result else 0
        }

    except Exception as e:

        print("ERROR:", e)
        return {"error": str(e)}