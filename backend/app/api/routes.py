from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Trip
from app.schemas.itinerary import TripRequest, TripModifyRequest, TripResponse
from app.services.itinerary_generator import create_full_itinerary, modify_existing_itinerary

router = APIRouter()

@router.post("/generate", response_model=TripResponse)
def generate_trip(req: TripRequest, db: Session = Depends(get_db)):
    try:
        itinerary_text, places = create_full_itinerary(
            req.destination, req.days, req.budget, req.travel_style, req.interests
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service unavailable: {exc}")
    
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
    if not db_trip and not (req.destination and req.existing_itinerary):
        raise HTTPException(status_code=404, detail="Trip not found")

    destination = db_trip.destination if db_trip else req.destination
    existing = db_trip.itinerary_data if db_trip else req.existing_itinerary

    try:
        updated_itinerary, new_places = modify_existing_itinerary(
            destination=destination,
            existing_itinerary=existing,
            feedback=req.user_feedback
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service unavailable: {exc}")

    if db_trip:
        db_trip.itinerary_data = updated_itinerary
        db.commit()

    return TripResponse(
        id=req.trip_id,
        destination=destination,
        days=db_trip.days if db_trip else (req.days or 1),
        itinerary=updated_itinerary,
        places=new_places
    )

@router.get("/history")
def get_trip_history(db: Session = Depends(get_db)):
    return db.query(Trip).order_by(Trip.created_at.desc()).all()


@router.get("/health")
def health():
    """Which AI backend and model the API is using (no secrets)."""
    from app.core.config import settings
    from app.services.llm import current_model
    if not settings.GROQ_API_KEY:
        return {"llm": "ollama", "model": settings.OLLAMA_MODEL}
    try:
        return {"llm": "groq", "model": current_model()}
    except Exception as exc:
        return {"llm": "groq", "model": None, "error": str(exc)[:200]}
