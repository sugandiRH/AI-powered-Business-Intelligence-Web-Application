from pydantic import BaseModel

class ChatbotRequest(BaseModel):
    dataset_id: int
    quection:str