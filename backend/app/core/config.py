import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Voice Command Shopping Assistant"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment & Keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # Database & Redis
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./voice_shopping.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # ML & Voice Settings
    CONFIDENCE_THRESHOLD: float = 0.65
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    
    class Config:
        case_sensitive = True

settings = Settings()
