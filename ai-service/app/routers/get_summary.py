from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

from app.schema.sammary_with_ai_request import SammaryWithAIRequest
from app.services.ai_visual_summary import getSummary

router = APIRouter()
@router.post("/get_summary")

async def get_summary(
    data: SammaryWithAIRequest,
    db: Session = Depends(get_db)
):
    try:
        dataset_id = data.dataset_id
        result = getSummary(dataset_id, db)

        return {
            "message": "Summary generated successfully",
            "dataset_id": dataset_id,
            "data": result          
        }
        

    except Exception as e:

        print("ERROR:", e)
        return {"error": str(e)}    
    


