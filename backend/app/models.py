from sqlalchemy import Column, Integer, String, Float
from .database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    amount = Column(Float)
    category = Column(String)
    type = Column(String)
    
class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)

    service_name = Column(String, nullable=False)

    amount = Column(Float, nullable=False)

    billing_day = Column(Integer, nullable=False)

    category = Column(String, nullable=True)