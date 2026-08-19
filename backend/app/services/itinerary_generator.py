from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings
from app.services.places_service import fetch_attractions
from app.services.rag_engine import populate_knowledge_base, query_travel_context

# Initialize Ollama
llm = Ollama(base_url=settings.OLLAMA_BASE_URL, model=settings.OLLAMA_MODEL)

itinerary_prompt = ChatPromptTemplate.from_template("""
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
""")

modify_prompt = ChatPromptTemplate.from_template("""
You are Tripify, an expert AI travel planner. The user wants to adjust their existing itinerary.

Existing Itinerary:
{existing_itinerary}

User Requested Modifications:
{user_feedback}

Updated Context/POIs:
{context}

Provide the refined, updated day-wise itinerary incorporating their feedback while maintaining realistic scheduling and budget constraints.
""")

def create_full_itinerary(destination: str, days: int, budget: str, style: str, interests: str):
    places, _, _ = fetch_attractions(destination)
    if places:
        populate_knowledge_base(places)
    
    context = query_travel_context(f"{style} attractions and {interests} in {destination}")
    chain = itinerary_prompt | llm
    
    result = chain.invoke({
        "destination": destination,
        "days": days,
        "budget": budget,
        "style": style,
        "interests": interests,
        "context": context if context else "Standard city highlights and attractions."
    })
    return result, places

def modify_existing_itinerary(destination: str, existing_itinerary: str, feedback: str):
    context = query_travel_context(f"attractions in {destination} related to {feedback}")
    chain = modify_prompt | llm
    
    result = chain.invoke({
        "existing_itinerary": existing_itinerary,
        "user_feedback": feedback,
        "context": context if context else "Standard city highlights."
    })
    return result