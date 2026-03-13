from pydantic import BaseModel

class ConfirmUploadRequest(BaseModel):
    dataset_id: int