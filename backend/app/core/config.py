import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
OPENSKY_USERNAME = os.getenv("OPENSKY_USERNAME", "")
OPENSKY_PASSWORD = os.getenv("OPENSKY_PASSWORD", "")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
NEWSDATA_API_KEY = os.getenv("NEWSDATA_API_KEY", "")

# Cache TTLs in seconds
FLIGHT_CACHE_TTL = 15        # Refresh flights every 15s
DISASTER_CACHE_TTL = 60      # Refresh disasters every 60s
WEATHER_CACHE_TTL = 300      # Refresh weather every 5min
