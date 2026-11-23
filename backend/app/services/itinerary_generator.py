import json
import math
import re

from app.services.llm import complete
from app.services.places_service import fetch_attractions, geocode_places
from app.services.rag_engine import populate_knowledge_base, query_travel_context

FORMAT_RULES = """
Formatting rules (Markdown, follow exactly):
- Start with a one-line summary, then a short bullet list: travel style, budget per day, best area to stay.
- One section per day with the heading "## Day N: <short theme>".
- Inside each day use "### Morning", "### Afternoon" and "### Evening", each with 2-4 short bullets.
  Start every bullet with the bolded place name only, then a brief tip and approximate cost, e.g.
  "- **Fort Aguada**: 17th-century Portuguese fort with sea views. Free entry."
- End each day with a line "**Day N estimate:** <amount>".
- After the days, add "## Budget Summary" as one small Markdown table (Category | Estimate),
  then "## Travel Tips" with 4-6 bullets.
- Do not use tables anywhere else, no HTML tags (no <br>), and no emojis.

Map data (required): after the Travel Tips, output one fenced code block tagged json containing an
array of the real places you bolded (at most 15), with their actual coordinates:
```json
[{{"name": "Fort Aguada", "kind": "historic", "lat": 15.4920, "lon": 73.7735}}]
```
"kind" is one of: beaches, historic, cultural, religion, food, nature. Use accurate coordinates;
leave out any place whose location you are unsure of.
"""

itinerary_prompt = """
You are Tripify, an expert AI travel planner. Create an optimized day-wise itinerary for a trip to {destination}.

Trip Constraints:
- Duration: {days} days
- Budget Level: {budget}
- Travel Style: {style}
- User Interests: {interests}

Verified Local Attractions:
{context}

Use real, specific, named places. Keep each day geographically sensible.
""" + FORMAT_RULES

modify_prompt = """
You are Tripify, an expert AI travel planner. The user wants to adjust their existing itinerary.

Existing Itinerary:
{existing_itinerary}

User Requested Modifications:
{user_feedback}

Updated Context/POIs:
{context}

Return the full refined itinerary incorporating their feedback while keeping realistic scheduling and budget.
""" + FORMAT_RULES

_KINDS = {"beaches", "historic", "cultural", "religion", "food", "nature"}
_KIND_WORDS = (
    ("beaches", ("beach", "island", "bay", "cove", "lagoon")),
    ("religion", ("church", "basilica", "cathedral", "temple", "mosque", "chapel", "shrine", "monastery", "gurudwara", "mandir", "masjid")),
    ("historic", ("fort", "palace", "castle", "ruins", "monument", "tower", "gate", "mahal", "old town", "heritage", "tomb", "memorial")),
    ("cultural", ("museum", "gallery", "theatre", "theater", "art", "quarter", "opera")),
    ("food", ("market", "bazaar", "restaurant", "cafe", "café", "bistro", "shack", "kitchen", "bar", "bakery", "corner")),
    ("nature", ("park", "garden", "falls", "waterfall", "lake", "hill", "sanctuary", "reserve", "viewpoint", "river")),
)
_GENERIC = {"breakfast", "lunch", "dinner", "brunch", "check-in", "check in", "check-out", "hotel",
            "rest", "free time", "travel", "transfer", "arrival", "departure", "sunset", "sunrise", "nightlife"}
_JSON_BLOCK = re.compile(r"```(?:json)?\s*(\[.*?\])\s*```", re.S | re.I)


def _kind_of(name: str) -> str:
    low = name.lower()
    for kind, words in _KIND_WORDS:
        if any(re.search(rf"\b{re.escape(w)}", low) for w in words):
            return kind
    return "cultural"


def _distance_km(a, b):
    lat1, lon1, lat2, lon2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


def _split_map_data(text: str):
    """Separate the itinerary Markdown from the trailing JSON map block."""
    places = []
    match = None
    for match in _JSON_BLOCK.finditer(text):
        pass  # keep the last block
    if match:
        text = (text[:match.start()] + text[match.end():]).rstrip()
        try:
            for p in json.loads(match.group(1)):
                lat, lon = float(p["lat"]), float(p["lon"])
                name = str(p["name"]).strip()
                if name and -90 <= lat <= 90 and -180 <= lon <= 180:
                    kind = str(p.get("kind", "")).strip().lower()
                    places.append({"name": name, "lat": lat, "lon": lon,
                                   "kinds": kind if kind in _KINDS else _kind_of(name)})
        except (ValueError, KeyError, TypeError) as exc:
            print(f"[places] map block unreadable: {exc}")
    # A leftover "Map data" heading would look odd once the block is removed.
    text = re.sub(r"\n#+\s*Map data\s*$", "", text, flags=re.I).rstrip()
    return text, _drop_outliers(places)


def _drop_outliers(places, max_km=150):
    """Remove points far from the group (likely wrong coordinates)."""
    if len(places) < 3:
        return places
    lats = sorted(p["lat"] for p in places)
    lons = sorted(p["lon"] for p in places)
    center = (lats[len(lats) // 2], lons[len(lons) // 2])
    return [p for p in places if _distance_km(center, (p["lat"], p["lon"])) <= max_km]


def _names_from_markdown(itinerary: str):
    """Bold names at the start of day bullets, e.g. '- **Fort Aguada**: ...'."""
    items, seen = [], set()
    for m in re.finditer(r"^\s*[-*]\s+\*\*([^*]{3,80})\*\*", itinerary, re.M):
        if m.group(1).strip().endswith(":"):  # a label like "**Budget per day:**", not a place
            continue
        name = re.sub(r"\s*\(.*?\)\s*", " ", m.group(1)).strip(" :–-")
        low = name.lower()
        if (not name or low in seen or low in _GENERIC or low.startswith("day ")
                or "estimate" in low or re.search(r"\b(at|in|to|near)$", low)):
            continue
        seen.add(low)
        items.append({"name": name, "kinds": _kind_of(name)})
    return items[:15]


def _places_for(destination: str, raw: str):
    """Return (clean itinerary, map places). Coordinates come from the model's map block;
    if that's missing, fall back to geocoding the bolded place names."""
    text, places = _split_map_data(raw)
    if len(places) < 3:
        try:
            located = geocode_places(destination, _names_from_markdown(text))
            if len(located) > len(places):
                places = located
        except Exception as exc:
            print(f"[places] geocoding fallback failed: {exc}")
    print(f"[places] {destination!r}: {len(places)} map points")
    return text, places


def create_full_itinerary(destination: str, days: int, budget: str, style: str, interests: str):
    poi_places, _, _ = fetch_attractions(destination)
    populate_knowledge_base(poi_places)

    context = query_travel_context(f"{style} attractions and {interests} in {destination}")
    raw = complete(itinerary_prompt.format(
        destination=destination,
        days=days,
        budget=budget,
        style=style,
        interests=interests,
        context=context if poi_places else "Standard city highlights and attractions.",
    ))
    text, places = _places_for(destination, raw)
    return text, poi_places or places


def modify_existing_itinerary(destination: str, existing_itinerary: str, feedback: str):
    context = query_travel_context(f"attractions in {destination} related to {feedback}")
    raw = complete(modify_prompt.format(
        existing_itinerary=existing_itinerary,
        user_feedback=feedback,
        context=context if context else "Standard city highlights.",
    ))
    return _places_for(destination, raw)
