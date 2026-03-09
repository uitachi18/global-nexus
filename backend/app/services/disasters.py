import json
import requests
from app.core.config import DISASTER_CACHE_TTL
from app.core.redis_client import cache_get, cache_set

USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
GDACS_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/GDACS?eventlist=EQ,TC,FL,VO,DR,WF"
CACHE_KEY = "disasters:all"

def _severity_from_mag(mag: float) -> str:
    if mag >= 6.0:
        return "HIGH"
    elif mag >= 4.5:
        return "MEDIUM"
    return "LOW"

def _color_from_severity(severity: str) -> list:
    return {"HIGH": [255, 51, 51], "MEDIUM": [255, 204, 0], "LOW": [204, 255, 0]}.get(severity, [200, 200, 200])

async def fetch_disasters() -> list:
    cached = await cache_get(CACHE_KEY)
    if cached:
        return json.loads(cached)

    events = []

    # USGS Earthquakes
    try:
        resp = requests.get(USGS_URL, timeout=10)
        resp.raise_for_status()
        quakes = resp.json().get("features", [])
        for q in quakes:
            coords = q["geometry"]["coordinates"]
            props = q["properties"]
            mag = props.get("mag", 0) or 0
            severity = _severity_from_mag(mag)
            events.append({
                "id": q["id"],
                "type": "EARTHQUAKE",
                "title": props.get("title", f"M {mag} Earthquake"),
                "lon": coords[0],
                "lat": coords[1],
                "magnitude": mag,
                "severity": severity,
                "color": _color_from_severity(severity),
                "url": props.get("url", ""),
                "time": props.get("time", 0),
            })
    except Exception as e:
        print(f"[USGS] Error: {e}")

    await cache_set(CACHE_KEY, json.dumps(events), DISASTER_CACHE_TTL)
    return events
