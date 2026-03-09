from fastapi import FastAPI, Depends
# from sqlalchemy.orm import Session
# from app.database import get_db
# from sqlalchemy import text

from app.routers.upload_router import router as upload_router

app = FastAPI()

# for test DB connection
# @app.get("/test-db")
# def test_db(db: Session = Depends(get_db)):
#     try:
#         db.execute(text("SELECT 1"))
#         return {"status": "Database connected successfully"}
#     except Exception as e:
#         return {"error": str(e)}
    
app.include_router(upload_router)