from pydantic import BaseModel

class TransactionCreate(BaseModel):
    title: str
    amount: float
    category: str
    type: str
    
class TransactionResponse(TransactionCreate):
    id: int

    class Config:
        orm_mode = True
        
class SubscriptionCreate(BaseModel):
    service_name: str
    amount: float
    billing_day: int
    category: str

class SubscriptionResponse(SubscriptionCreate):
    id: int

    class Config:
        from_attributes = True