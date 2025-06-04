import os
from typing import Any, Optional
from loguru import logger

class RedisAdapter:
    def __init__(self, url: Optional[str] = None):
        try:
            import redis.asyncio as redis
            self._redis = redis.from_url(url or os.getenv("REDIS_URL", "redis://localhost:6379"))
        except ModuleNotFoundError:
            self._redis = None

    async def get(self, key: str) -> Optional[str]:
        if self._redis is None:
            return None
        val = await self._redis.get(key)
        logger.debug("Redis GET {}", key)
        return val

    async def set(self, key: str, value: Any, ttl: int | None = None):
        if self._redis is None:
            return
        await self._redis.set(key, value, ex=ttl)
        logger.debug("Redis SET {}", key)
