from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Schema management
    # Only enable in local development if you want SQLAlchemy to auto-create tables.
    # In production, prefer Alembic migrations.
    AUTO_CREATE_TABLES: bool = False
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days
    
    # CORS
    FRONTEND_URL: str
    
    # File Upload
    MAX_FILE_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: str = "pdf,zip,jpg,jpeg,png"
    
    # X.AI Grok API
    XAI_API_KEY: str = ""
    XAI_MODEL: str = "grok-2-latest"
    
    # Admin
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
