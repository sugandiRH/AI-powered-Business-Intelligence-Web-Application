from sqlalchemy import Column, BigInteger,Integer, Float, String, Date
from app.database import Base

class BusinessData(Base):
    __tablename__ = "business_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BigInteger, nullable=False)
    dataset_id = Column(BigInteger, nullable=False)

    date = Column(Date, nullable=False)
    product = Column(String, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    