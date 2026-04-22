from pydantic import BaseModel

class SammaryWithAIRequest(BaseModel):
    dataset_id: int