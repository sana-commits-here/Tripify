import requests
from app.core.config import settings

# Generic client name for the public OpenStreetMap services (they require a User-Agent).
OSM_HEADERS = {"User-Agent": "Tripify/1.0 (AI travel planner)"}
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"


# --- OpenTripMap (used when OPENTRIPMAP_API_KEY is set) -----------------------

def get_coordinates(city_name: str):
    url = "https://api.opentripmap.com/0.1/en/places/geoname"
    try:
        res = requests.get(url, params={"name": city_name, "apikey": settings.OPENTRIPMAP_API_KEY}, timeout=10).json()
        return res.get("lat"), res.get("lon")
    except Exception:
        return None, None


def _fetch_opentripmap(city_name: str, radius_meters: int, limit: int):
    lat, lon = get_coordinates(city_name)
    if not lat or not lon:
        return [], lat, lon

    url = "https://api.opentripmap.com/0.1/en/places/radius"
    params = {"radius": radius_meters, "lon": lon, "lat": lat, "rate": 2,
              "format": "json", "limit": limit, "apikey": settings.OPENTRIPMAP_API_KEY}
    try:
        res = requests.get(url, params=params, timeout=10).json()
        places = []
        for p in res:
            name = p.get("name")
            point = p.get("point", {})
            if name:
                places.append({
                    "name": name,
                    "lat": point.get("lat", lat),
                    "lon": point.get("lon", lon),
                    "kinds": p.get("kinds", "")
                })
        return places, lat, lon
    except Exception:
        return [], lat, lon


# --- OpenStreetMap fallback (no API key needed) --------------------------------

PHOTON_URL = "https://photon.komoot.io/api"


def _bbox_around(lat, lon, s, w, n, e):
    """Small places get a ~25 km box; very large regions are clamped to ~100 km."""
    half, max_half = 0.25, 1.0
    if n - s < 2 * half:
        s, n = lat - half, lat + half
    if e - w < 2 * half:
        w, e = lon - half, lon + half
    s, n = max(s, lat - max_half), min(n, lat + max_half)
    w, e = max(w, lon - max_half), min(e, lon + max_half)
    return s, w, n, e


def _geocode_osm(city_name: str):
    """Return (lat, lon, (south, west, north, east)) for a destination, or Nones.
    Tries Photon first (no strict rate limit), then Nominatim."""
    try:
        res = requests.get(PHOTON_URL, params={"q": city_name, "limit": 1},
                           headers=OSM_HEADERS, timeout=10)
        res.raise_for_status()
        feats = res.json().get("features", [])
        if feats:
            lon, lat = feats[0]["geometry"]["coordinates"]
            # Photon extent is [west, north, east, south]
            w, n, e, s = feats[0]["properties"].get("extent", [lon, lat, lon, lat])
            return lat, lon, _bbox_around(lat, lon, s, w, n, e)
    except Exception as exc:
        print(f"[places] Photon geocode failed for {city_name!r}: {exc}")

    try:
        res = requests.get(NOMINATIM_URL, params={"q": city_name, "format": "json", "limit": 1},
                           headers=OSM_HEADERS, timeout=10)
        res.raise_for_status()
        hits = res.json()
        if hits:
            lat, lon = float(hits[0]["lat"]), float(hits[0]["lon"])
            s, n, w, e = (float(v) for v in hits[0].get("boundingbox", [lat, lat, lon, lon]))
            return lat, lon, _bbox_around(lat, lon, s, w, n, e)
    except Exception as exc:
        print(f"[places] Nominatim geocode failed for {city_name!r}: {exc}")
    return None, None, None


def _geocode_in_area(name: str, bbox, destination: str):
    """Find one named place inside the destination's area via Photon (OSM data)."""
    params = {"q": name, "limit": 1}
    if bbox:
        s, w, n, e = bbox
        params["bbox"] = f"{w},{s},{e},{n}"
    else:
        params["q"] = f"{name}, {destination}"
    for attempt in range(1):  # single quick try: Photon often rejects cloud IPs
        try:
            res = requests.get(PHOTON_URL, params=params, headers=OSM_HEADERS, timeout=6)
            res.raise_for_status()
            feats = res.json().get("features", [])
            if not feats:
                return None
            lon, lat = feats[0]["geometry"]["coordinates"]
            return lat, lon
        except Exception as exc:
            if attempt == 0:
                print(f"[places] Photon lookup failed for {name!r}: {exc}")
    return None


def geocode_places(destination: str, items: list):
    """Turn [{"name", "kinds"}] into map points located inside the destination."""
    from concurrent.futures import ThreadPoolExecutor

    if not items:
        return []
    _, _, bbox = _geocode_osm(destination)
    with ThreadPoolExecutor(max_workers=4) as pool:
        coords = list(pool.map(lambda it: _geocode_in_area(it["name"], bbox, destination), items))
    places, seen = [], set()
    for it, c in zip(items, coords):
        if c and (round(c[0], 4), round(c[1], 4)) not in seen:
            seen.add((round(c[0], 4), round(c[1], 4)))
            places.append({"name": it["name"], "lat": c[0], "lon": c[1], "kinds": it.get("kinds", "")})
    print(f"[places] {destination!r}: {len(items)} extracted, {len(places)} located")
    return places


def fetch_attractions(city_name: str, radius_meters: int = 10000, limit: int = 20):
    """OpenTripMap attractions when a key is configured; otherwise none (the itinerary's
    own recommended places are geocoded after generation instead)."""
    if settings.OPENTRIPMAP_API_KEY:
        return _fetch_opentripmap(city_name, radius_meters, limit)
    return [], None, None
