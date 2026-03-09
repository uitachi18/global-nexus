from fastapi import APIRouter, HTTPException
from app.services.flights import fetch_flights
from app.services.disasters import fetch_disasters
from app.services.satellites import fetch_iss_position
from app.services.countries import fetch_country_by_code, search_country_by_name
from app.services.news import fetch_country_news

router = APIRouter(prefix="/api/v1")

@router.get("/flights")
async def get_flights():
    flights = await fetch_flights()
    return {"count": len(flights), "data": flights}

@router.get("/disasters")
async def get_disasters():
    events = await fetch_disasters()
    return {"count": len(events), "data": events}

@router.get("/satellites/iss")
async def get_iss():
    iss = await fetch_iss_position()
    return iss or {"error": "ISS position unavailable"}

@router.get("/country/{code}")
async def get_country(code: str):
    """Country info by ISO 2-letter or 3-letter code (e.g., US, USA, IN, IND)."""
    if len(code) not in (2, 3):
        raise HTTPException(status_code=400, detail="Provide a 2 or 3 letter ISO country code")
    data = await fetch_country_by_code(code)
    if not data:
        raise HTTPException(status_code=404, detail=f"Country '{code}' not found")
    return data

@router.get("/country/search/{name}")
async def search_country(name: str):
    """Country info by name search (e.g., 'Germany', 'United States')."""
    data = await search_country_by_name(name)
    if not data:
        raise HTTPException(status_code=404, detail=f"Country '{name}' not found")
    return data

@router.get("/news/{country_code}")
async def get_country_news(country_code: str, country_name: str = ""):
    """Latest news for a country. Pass country_name for better results."""
    articles = await fetch_country_news(country_code, country_name)
    return {"count": len(articles), "data": articles}

@router.get("/health")
async def health():
    return {"status": "ok", "service": "Global Nexus Tracker API"}
