import redis
from app.core.config import settings

class InMemoryRedisFallback:
    def __init__(self):
        self.store = {}
    
    def get(self, key):
        return self.store.get(key)
    
    def set(self, key, value, ex=None):
        self.store[key] = str(value)
        return True
    
    def delete(self, key):
        if key in self.store:
            del self.store[key]
            return 1
        return 0

try:
    redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_timeout=2)
    redis_client.ping()
    print("Successfully connected to Redis.")
except Exception as e:
    print(f"Redis not available ({e}). Using in-memory cache fallback.")
    redis_client = InMemoryRedisFallback()
