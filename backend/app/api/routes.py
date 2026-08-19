from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Trip
from app.schemas.itinerary import TripRequest, TripModifyRequest, TripResponse
from app.services.itinerary_generator import create_full_itinerary, modify_existing_itinerary

router = APIRouter()

@router.post("/generate", response_model=TripResponse)
def generate_trip(req: TripRequest, db: Session = Depends(get_db)):
    itinerary_text, places = create_full_itinerary(
        req.destination, req.days, req.budget, req.travel_style, req.interests
    )
    
    db_trip = Trip(
        destination=req.destination,
        days=req.days,
        budget=req.budget,
        travel_style=req.travel_style,
        interests=req.interests,
        itinerary_data=itinerary_text
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    
    return TripResponse(
        id=db_trip.id,
        destination=db_trip.destination,
        days=db_trip.days,
        itinerary=itinerary_text,
        places=places
    )

@router.post("/modify", response_model=TripResponse)
def modify_trip(req: TripModifyRequest, db: Session = Depends(get_db)):
    db_trip = db.query(Trip).filter(Trip.id == req.trip_id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    updated_itinerary = modify_existing_itinerary(
        destination=db_trip.destination,
        existing_itinerary=db_trip.itinerary_data,
        feedback=req.user_feedback
    )
    
    db_trip.itinerary_data = updated_itinerary
    db.commit()
    db.refresh(db_trip)
    
    return TripResponse(
        id=db_trip.id,
        destination=db_trip.destination,
        days=db_trip.days,
        itinerary=updated_itinerary,
        places=[]
    )

@router.get("/history")
def get_trip_history(db: Session = Depends(get_db)):
    return db.query(Trip).order_by(Trip.created_at.desc()).all()