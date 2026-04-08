from pydantic import BaseModel

class WarningCorrectionRequest(BaseModel):
    dataset_id: int