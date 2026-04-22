from sqlalchemy import Column, BigInteger,Integer, Float, String, Date
from app.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BigInteger, nullable=False)
    file_name = Column(String, nullable=False)
    file_hash = Column(String, nullable=False)
    total_rows = Column(Integer, nullable=False)
    valid_rows = Column(Integer, nullable=False)
    invalid_rows = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    error_message = Column(String, nullable=True)
    combination   = Column(String, nullable=True, default="unknown")
    active_charts = Column(String, nullable=True)
    active_kpis   = Column(String, nullable=True)
