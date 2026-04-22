from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.data_cleaner import clean_dataset
from app.schema.confirm_upload import ConfirmUploadRequest

router = APIRouter()

# @router.post("/confirm_upload")
# async def confirm_upload(
#     data: ConfirmUploadRequest,
#     db: Session = Depends(get_db)
# ):

#     dataset_id = data.dataset_id

#     clean_dataset(dataset_id, db)

#     return {
#         "status": "success",
#         "message": "Data cleaning completed"
#     }

@router.post("/confirm_upload")
async def confirm_upload(
    data: ConfirmUploadRequest,
    db: Session = Depends(get_db)
):

    try:

        dataset_id = data.dataset_id
        print("Dataset ID:", dataset_id)

        clean_dataset(dataset_id, db)

        return {
            "message": "Cleaning Start",
            "dataset_id": dataset_id
        }

    except Exception as e:

        print("ERROR:", e)

        return {"error": str(e)}