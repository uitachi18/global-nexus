import json
import requests
from app.core.redis_client import cache_get, cache_set

BASE_URL = "https://restcountries.com/v3.1"
CACHE_TTL = 3600  # 1 hour – country data rarely changes

def _format_country(data: dict) -> dict:
    """Flatten the REST Countries v3.1 response into something clean."""
    name = data.get("name", {})
    currencies = data.get("currencies", {})
    currency_info = next(iter(currencies.values()), {}) if currencies else {}
    languages = list(data.get("languages", {}).values())
    capital = data.get("capital", ["—"])
    latlng = data.get("latlng", [0, 0])
    maps = data.get("maps", {})
    flags = data.get("flags", {})
    timezones = data.get("timezones", [])
    borders = data.get("borders", [])

    return {
        "name": name.get("common", "Unknown"),
        "official": name.get("official", ""),
        "cca2": data.get("cca2", ""),
        "cca3": data.get("cca3", ""),
        "region": data.get("region", ""),
        "subregion": data.get("subregion", ""),
        "capital": capital[0] if capital else "—",
        "population": data.get("population", 0),
        "area": data.get("area", 0),
        "currencies": f"{currency_info.get('name', '—')} ({currency_info.get('symbol', '')})",
        "languages": languages,
        "timezones": timezones[:2],
        "borders": borders[:6],
        "flag_svg": flags.get("svg", ""),
        "flag_png": flags.get("png", ""),
        "flag_alt": flags.get("alt", ""),
        "lat": latlng[0] if len(latlng) > 0 else 0,
        "lon": latlng[1] if len(latlng) > 1 else 0,
        "map_url": maps.get("openStreetMaps", ""),
        "independent": data.get("independent", False),
        "un_member": data.get("unMember", False),
        "gini": list(data.get("gini", {}).values())[-1] if data.get("gini") else None,
        "calling_code": "+" + (data.get("idd", {}).get("root", "") + (data.get("idd", {}).get("suffixes", [""])[0] if data.get("idd", {}).get("suffixes") else "")).lstrip("+"),
    }

async def fetch_country_by_code(code: str) -> dict | None:
    code = code.upper()
    cache_key = f"country:{code}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)

    try:
        resp = requests.get(f"{BASE_URL}/alpha/{code}", timeout=8)
        resp.raise_for_status()
        raw = resp.json()
        if isinstance(raw, list) and len(raw) > 0:
            result = _format_country(raw[0])
            await cache_set(cache_key, json.dumps(result), CACHE_TTL)
            return result
    except Exception as e:
        print(f"[Countries] Error fetching {code}: {e}")
    return None

async def search_country_by_name(name: str) -> dict | None:
    try:
        resp = requests.get(f"{BASE_URL}/name/{requests.utils.quote(name)}?fullText=false", timeout=8)
        resp.raise_for_status()
        raw = resp.json()
        if isinstance(raw, list) and len(raw) > 0:
            return _format_country(raw[0])
    except Exception as e:
        print(f"[Countries] Error searching '{name}': {e}")
    return None
