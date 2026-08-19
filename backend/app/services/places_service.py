import requests
from app.core.config import settings

def get_coordinates(city_name: str):
    url = f"https://api.opentripmap.com/0.1/en/places/geoname?name={city_name}&apikey={settings.OPENTRIPMAP_API_KEY}"
    try:
        res = requests.get(url, timeout=10).json()
        return res.get("lat"), res.get("lon")
    except Exception:
        return None, None

def fetch_attractions(city_name: str, radius_meters: int = 10000, limit: int = 15):
    lat, lon = get_coordinates(city_name)
    if not lat or not lon:
        return [], lat, lon
    
    url = f"https://api.opentripmap.com/0.1/en/places/radius?radius={radius_meters}&lon={lon}&lat={lat}&rate=2&format=json&limit={limit}&apikey={settings.OPENTRIPMAP_API_KEY}"
    try:
        res = requests.get(url, timeout=10).json()
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