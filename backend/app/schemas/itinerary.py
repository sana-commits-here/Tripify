from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: str
    travel_style: str
    interests: Optional[str] = "sightseeing, food, culture"

class TripModifyRequest(BaseModel):
    trip_id: int
    user_feedback: str
    # Sent by the client so edits still work if the serverless DB was reset
    destination: Optional[str] = None
    existing_itinerary: Optional[str] = None
    days: Optional[int] = None

class PlaceItem(BaseModel):
    name: str
    lat: float
    lon: float
    kinds: Optional[str] = ""

class TripResponse(BaseModel):
    id: Optional[int] = None
    destination: str
    days: int
    itinerary: str
    places: List[PlaceItem] = []
