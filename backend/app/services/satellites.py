import json
import requests
from app.core.redis_client import cache_get, cache_set

# ISS TLE from CelesTrak
ISS_URL = "https://celestrak.org/satcat/tle.php?CATNR=25544"
CACHE_KEY = "satellites:iss"
TTL = 300

async def fetch_iss_position() -> dict | None:
    """
    Returns a simplified ISS position dict using TLE propagation.
    For a production build, use sgp4 library for accurate propagation.
    This provides a live data placeholder.
    """
    cached = await cache_get(CACHE_KEY)
    if cached:
        return json.loads(cached)

    try:
        # Fallback: use Open Notify API for ISS position
        resp = requests.get("http://api.open-notify.org/iss-now.json", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        pos = data.get("iss_position", {})
        iss = {
            "id": "ISS",
            "name": "ISS (ZARYA)",
            "lat": float(pos.get("latitude", 0)),
            "lon": float(pos.get("longitude", 0)),
            "altitude": 408,
            "type": "STATION",
        }
        await cache_set(CACHE_KEY, json.dumps(iss), 15)
        return iss
    except Exception as e:
        print(f"[Satellites] Error: {e}")
        return None
