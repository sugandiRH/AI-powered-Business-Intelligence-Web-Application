from sqlalchemy import Column, BigInteger, Integer, Float, String, Date, Boolean, Text, DateTime
from app.database import Base
import datetime

class TempBusinessDataSample(Base):
    __tablename__ = "temp_business_data_sample"

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
    error_level = Column(String, nullable=True)

    suggested_date = Column(Date, nullable=True)
    suggested_month = Column(Integer, nullable=True)
    suggested_year = Column(Integer, nullable=True)
    suggested_category = Column(String, nullable=True)
    suggested_product = Column(String, nullable=True)
    suggested_price = Column(Float, nullable=True)
    suggested_quantity = Column(Float, nullable=True)
    suggested_total = Column(Float, nullable=True)

    user_confirmed = Column(Boolean, default=False)
    ai_correction = Column(Boolean, default=False)
    corrected_field_by_ai = Column(Text, nullable=True)
    corrected_data = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)