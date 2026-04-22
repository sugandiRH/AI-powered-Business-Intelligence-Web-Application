from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

from app.schema.chatbot_request import ChatbotRequest
from app.services.chatbot_service import chatbot_response

router = APIRouter()
@router.post("/chatbot_quection")

async def get_summary(
    data: ChatbotRequest,
    db: Session = Depends(get_db)
):
    try:
        dataset_id = data.dataset_id
        quection = data.quection
        result = chatbot_response(dataset_id, quection, db)

        return {
            "message": " AI answer ",
            "dataset_id": dataset_id,
            "data": result          
        }
        

    except Exception as e:

        print("ERROR:", e)
        return {"error": str(e)}    
    


