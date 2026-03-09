import redis.asyncio as aioredis
from .config import REDIS_URL

_redis_client = None

async def get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = await aioredis.from_url(
                REDIS_URL, encoding="utf-8", decode_responses=True
            )
            await _redis_client.ping()
            print("[Redis] Connected successfully.")
        except Exception as e:
            print(f"[Redis] Connection failed: {e}. Caching disabled.")
            _redis_client = None
    return _redis_client

async def cache_get(key: str) -> str | None:
    client = await get_redis()
    if client is None:
        return None
    try:
        return await client.get(key)
    except Exception:
        return None

async def cache_set(key: str, value: str, ttl: int = 60):
    client = await get_redis()
    if client is None:
        return
    try:
        await client.setex(key, ttl, value)
    except Exception:
        pass
