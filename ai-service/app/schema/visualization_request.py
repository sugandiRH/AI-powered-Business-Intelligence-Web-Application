from pydantic import BaseModel

class VisualizationRequest(BaseModel):
    dataset_id: int