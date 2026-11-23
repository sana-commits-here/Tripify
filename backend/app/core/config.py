import os
from dotenv import load_dotenv

load_dotenv()

# Vercel's filesystem is read-only except /tmp, so the SQLite file lives there in production.
_default_db = "sqlite:////tmp/tripify.db" if os.getenv("VERCEL") else "sqlite:///./tripify.db"


class Settings:
    OPENTRIPMAP_API_KEY: str = os.getenv("OPENTRIPMAP_API_KEY", "")
    # Hosted LLM (used when GROQ_API_KEY is set, e.g. on Vercel)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    # Local LLM fallback for development
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db)


settings = Settings()
