from app.services.llm import complete
from app.services.places_service import fetch_attractions
from app.services.rag_engine import populate_knowledge_base, query_travel_context

itinerary_prompt = """
You are Tripify, an expert AI travel planner. Create an optimized day-wise itinerary for a trip to {destination}.

Trip Constraints:
- Duration: {days} days
- Budget Level: {budget}
- Travel Style: {style}
- User Interests: {interests}

Verified Local Attractions:
{context}

Format the response cleanly:
- Daily Breakdown (Day 1, Day 2, etc.) with Morning, Afternoon, and Evening activities.
- Highlight recommended spots from verified attractions.
- Provide estimated daily expenses and transportation recommendations.
"""

modify_prompt = """
You are Tripify, an expert AI travel planner. The user wants to adjust their existing itinerary.

Existing Itinerary:
{existing_itinerary}

User Requested Modifications:
{user_feedback}

Updated Context/POIs:
{context}

Provide the refined, updated day-wise itinerary incorporating their feedback while maintaining realistic scheduling and budget constraints.
"""

def create_full_itinerary(destination: str, days: int, budget: str, style: str, interests: str):
    places, _, _ = fetch_attractions(destination)
    if places:
        populate_knowledge_base(places)
    
    context = query_travel_context(f"{style} attractions and {interests} in {destination}")
    result = complete(itinerary_prompt.format(
        destination=destination,
        days=days,
        budget=budget,
        style=style,
        interests=interests,
        context=context if context else "Standard city highlights and attractions.",
    ))
    return result, places

def modify_existing_itinerary(destination: str, existing_itinerary: str, feedback: str):
    context = query_travel_context(f"attractions in {destination} related to {feedback}")
    result = complete(modify_prompt.format(
        existing_itinerary=existing_itinerary,
        user_feedback=feedback,
        context=context if context else "Standard city highlights.",
    ))
    return result