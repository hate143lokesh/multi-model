from fastapi import APIRouter, Query
from app.schemas.weather import WeatherAdvisoryResponse
from app.schemas.common import APIResponse
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["Weather Advisory"])

@router.get("/advisory", response_model=APIResponse[WeatherAdvisoryResponse])
def get_site_weather_advisory(location: str = Query("Bangalore, Karnataka", description="Construction site city or locality")):
    """
    Fetch real-time weather conditions and evaluate engineering hazard rules
    (crane wind limits, precipitation risks, ACI 305 hot-weather concreting precautions).
    """
    advisory = WeatherService.get_weather_advisory(location=location)
    return APIResponse(
        success=True,
        data=advisory,
        message=f"Weather advisory compiled for {location}"
    )
