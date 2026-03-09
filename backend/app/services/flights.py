import json
import requests
from app.core.config import OPENSKY_USERNAME, OPENSKY_PASSWORD, FLIGHT_CACHE_TTL
from app.core.redis_client import cache_get, cache_set

OPENSKY_URL = "https://opensky-network.org/api/states/all"
CACHE_KEY = "flights:all"

def _parse_state(s: list) -> dict:
    return {
        "icao": s[0],
        "callsign": (s[1] or "").strip(),
        "origin_country": s[2],
        "lon": s[5],
        "lat": s[6],
        "altitude": s[7],
        "velocity": s[9],
        "heading": s[10],
        "on_ground": s[8],
    }

async def fetch_flights() -> list:
    cached = await cache_get(CACHE_KEY)
    if cached:
        return json.loads(cached)

    try:
        auth = (OPENSKY_USERNAME, OPENSKY_PASSWORD) if OPENSKY_USERNAME else None
        resp = requests.get(OPENSKY_URL, auth=auth, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        states = data.get("states", []) or []
        flights = [
            _parse_state(s) for s in states
            if s[5] is not None and s[6] is not None and not s[8]
        ]
        # Limit to 3000 flights for performance
        flights = flights[:3000]
        await cache_set(CACHE_KEY, json.dumps(flights), FLIGHT_CACHE_TTL)
        return flights
    except Exception as e:
        print(f"[OpenSky] Error: {e}")
        return []
