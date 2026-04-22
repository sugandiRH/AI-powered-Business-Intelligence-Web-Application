from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.validation_pipeline import build_review_queue

router = APIRouter()

@router.get("/error_messages")
async def get_error_messages():
    return build_review_queue