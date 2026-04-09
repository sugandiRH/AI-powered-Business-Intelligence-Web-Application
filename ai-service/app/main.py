from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.database import get_db

from app.routers.upload_router import router as upload_router
from app.routers.confirm_upload import router as confirm_upload
from app.routers.error_message import router as error_message_router
from app.routers.warning_correction import router as warning_correction

app = FastAPI()

app.include_router(upload_router)
app.include_router(confirm_upload)
app.include_router(error_message_router)
app.include_router(warning_correction)

