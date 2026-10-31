from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    qdrant_url: str | None = None
    qdrant_api_key: str | None = None
    qdrant_collection: str = "matchlens_cricket_knowledge"
    qdrant_timeout: int = 10
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    intent_model_path: str | None = None
    frontend_origin: str = "http://localhost:5173"
    data_dir: str = "app/data/matches"
    port: int = 8000
    log_level: str = "INFO"
    model_config = SettingsConfigDict(env_file=".env", env_prefix="", extra="ignore")

    @property
    def resolved_data_dir(self) -> Path:
        path = Path(self.data_dir)
        return path if path.is_absolute() else Path(__file__).parent / "data" / "matches"


@lru_cache
def get_settings() -> Settings:
    return Settings()
