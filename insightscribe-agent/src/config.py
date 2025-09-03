from pydantic import BaseSettings
import os

class Settings(BaseSettings):
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "insightscribe")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "your_openai_api_key")
    SESSION_TTL_HOURS: int = os.getenv("SESSION_TTL_HOURS", 24) # Default to 24 hours

    class Config:
        env_file = ".env"
        case_sensitive = True # Environment variables are case-sensitive

settings = Settings()
