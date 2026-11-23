import os
from app.core.config import settings

# In-memory document store fallback
_in_memory_docs = []

def populate_knowledge_base(places: list):
    global _in_memory_docs
    _in_memory_docs = []  # one destination at a time; don't leak POIs between trips
    for p in places:
        if p.get("name"):
            _in_memory_docs.append({
                "content": f"Point of Interest: {p['name']}. Category/Features: {p.get('kinds', '')}.",
                "name": p["name"],
                "lat": p.get("lat"),
                "lon": p.get("lon")
            })

def query_travel_context(query: str, k: int = 6):
    if not _in_memory_docs:
        return "Standard city highlights and cultural spots."
    # Return top k matched/stored POIs
    selected = _in_memory_docs[:k]
    return "\n".join([d["content"] for d in selected])