from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.core.database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String, index=True)
    days = Column(Integer)
    budget = Column(String)
    travel_style = Column(String)
    interests = Column(String)
    itinerary_data = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)