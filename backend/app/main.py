from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.db.base import init_db

# Modular routers
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.projects import router as projects_router
from app.api.routes.safety import router as safety_router
from app.api.routes.cracks import router as cracks_router
from app.api.routes.estimation import router as estimation_router
from app.api.routes.valuation import router as valuation_router
from app.api.routes.assistant import router as assistant_router
from app.api.routes.weather import router as weather_router
from app.api.routes.reports import router as reports_router

# Ensure tables & baseline records exist immediately on load
try:
    init_db()
except Exception as e:
    print(f"[ConstructAI Warning] DB init on module load: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables and baseline records exist
    init_db()
    print("[ConstructAI] Backend started successfully.")
    yield
    print("[ConstructAI] Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade Multimodal Construction Intelligence Platform API powered by Gemini 2.5 Flash and domain engineering models.",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global validation error handler ensuring consistent error envelope
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_msg = errors[0].get("msg") if errors else "Validation error"
    loc = " -> ".join([str(x) for x in errors[0].get("loc", [])]) if errors else ""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "detail": f"{first_msg} at {loc}",
            "errors": errors,
            "message": "Input validation failed. Please check submitted parameters."
        }
    )

# Include API Routers under /api
api_prefix = "/api"
app.include_router(health_router, prefix=api_prefix)
app.include_router(auth_router, prefix=api_prefix)
app.include_router(projects_router, prefix=api_prefix)
app.include_router(safety_router, prefix=api_prefix)
app.include_router(cracks_router, prefix=api_prefix)
app.include_router(estimation_router, prefix=api_prefix)
app.include_router(valuation_router, prefix=api_prefix)
app.include_router(assistant_router, prefix=api_prefix)
app.include_router(weather_router, prefix=api_prefix)
app.include_router(reports_router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "api_docs": "/api/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
