import json
import os
import requests
from app.core.redis_client import cache_get, cache_set

NEWSDATA_API_KEY = os.getenv("NEWSDATA_API_KEY", "")
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY", "")
NEWS_CACHE_TTL = 300  # 5 minutes

def _fetch_newsdata(country_code: str, keywords: str) -> list:
    """Newsdata.io API – requires free API key."""
    if not NEWSDATA_API_KEY:
        return []
    try:
        url = (
            f"https://newsdata.io/api/1/news"
            f"?apikey={NEWSDATA_API_KEY}"
            f"&country={country_code.lower()}"
            f"&language=en"
            f"&category=top"
            f"&size=5"
        )
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        items = resp.json().get("results", [])
        return [
            {
                "title": item.get("title", ""),
                "description": item.get("description", ""),
                "url": item.get("link", ""),
                "source": item.get("source_id", ""),
                "published": item.get("pubDate", ""),
                "image": item.get("image_url", None),
            }
            for item in items if item.get("title")
        ]
    except Exception as e:
        print(f"[News/Newsdata] Error: {e}")
        return []

def _fetch_gnews(country_name: str) -> list:
    """GNews.io API – 100 free requests/day with key."""
    if not GNEWS_API_KEY:
        return []
    try:
        url = (
            f"https://gnews.io/api/v4/search"
            f"?q={requests.utils.quote(country_name)}"
            f"&lang=en&max=5"
            f"&apikey={GNEWS_API_KEY}"
        )
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        articles = resp.json().get("articles", [])
        return [
            {
                "title": a.get("title", ""),
                "description": a.get("description", ""),
                "url": a.get("url", ""),
                "source": a.get("source", {}).get("name", ""),
                "published": a.get("publishedAt", ""),
                "image": a.get("image", None),
            }
            for a in articles if a.get("title")
        ]
    except Exception as e:
        print(f"[News/GNews] Error: {e}")
        return []

def _fetch_rss_fallback(country_name: str) -> list:
    """BBC World News RSS as keyless fallback (limited but always available)."""
    try:
        import xml.etree.ElementTree as ET
        url = f"https://feeds.bbci.co.uk/news/world/rss.xml"
        resp = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
        root = ET.fromstring(resp.content)
        items = root.findall(".//item")[:5]
        return [
            {
                "title": (el.find("title").text or "") if el.find("title") is not None else "",
                "description": (el.find("description").text or "") if el.find("description") is not None else "",
                "url": (el.find("link").text or "") if el.find("link") is not None else "",
                "source": "BBC News",
                "published": (el.find("pubDate").text or "") if el.find("pubDate") is not None else "",
                "image": None,
            }
            for el in items
        ]
    except Exception as e:
        print(f"[News/RSS] Error: {e}")
        return []

async def fetch_country_news(country_code: str, country_name: str) -> list:
    cache_key = f"news:{country_code.lower()}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)

    # Try Newsdata first, then GNews, then BBC RSS fallback
    articles = _fetch_newsdata(country_code, country_name)
    if not articles:
        articles = _fetch_gnews(country_name)
    if not articles:
        articles = _fetch_rss_fallback(country_name)

    if articles:
        await cache_set(cache_key, json.dumps(articles), NEWS_CACHE_TTL)
    return articles
