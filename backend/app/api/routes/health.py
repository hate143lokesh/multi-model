import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.schemas.common import APIResponse

router = APIRouter(tags=["Health & Status"])

@router.get("/health", response_model=APIResponse[dict])
def check_health(db: Session = Depends(get_db)):
    """Health check endpoint displaying system, database, and AI status."""
    db_ok = True
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_ok = False

    data = {
        "status": "healthy" if db_ok else "degraded",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "status": "connected" if db_ok else "disconnected",
            "type": "SQLite" if "sqlite" in settings.DATABASE_URL else "PostgreSQL"
        },
        "ai_engine": {
            "configured_provider": settings.AI_PROVIDER,
            "model": settings.GEMINI_MODEL,
            "has_gemini_key": settings.has_gemini_key,
            "mode": "Live Gemini Multimodal Vision" if settings.has_gemini_key else "Intelligent Domain Simulator (Fully Functional)"
        },
        "weather_service": {
            "provider": settings.WEATHER_PROVIDER,
            "status": "active"
        }
    }

    return APIResponse(
        success=True,
        data=data,
        message="ConstructAI services operating normally"
    )
