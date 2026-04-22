from sqlalchemy import Column, BigInteger, Integer, Float, String, Date, Boolean, Text, DateTime
from app.database import Base
import datetime

class TempBusinessData(Base):
    __tablename__ = "temp_business_data"

    id = Column(BigInteger, primary_key=True, index=True)

    dataset_id = Column(BigInteger, nullable=False)

    product = Column(String, nullable=True)
    category = Column(String, nullable=True)

    quantity = Column(Integer, nullable=True)
    price = Column(Float, nullable=True)
    total = Column(Float, nullable=True)

    date = Column(Date, nullable=True)
    month = Column(Integer, nullable=True)
    year = Column(Integer, nullable=True)

    is_valid = Column(Boolean, default=False)
    validation_error = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)