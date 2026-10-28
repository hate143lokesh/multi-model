from typing import List, Optional
from pydantic import BaseModel

class WeatherCondition(BaseModel):
    temperature_c: float
    feels_like_c: float
    humidity_pct: float
    wind_speed_kmh: float
    condition_text: str
    precipitation_prob_pct: float
    uv_index: float

class WeatherAlert(BaseModel):
    severity: str  # Warning, Advisory, Safe
    category: str  # Wind, Rain, Extreme Heat, Concreting Alert
    headline: str
    description: str
    engineering_standard: str  # e.g., "ACI 305R Hot Weather Concreting", "OSHA 1926.1431 Crane Wind Threshold"
    recommended_action: str

class ConstructionImpactItem(BaseModel):
    activity_name: str  # Crane Operations, Concrete Pouring, Painting/Plastering, High-Elevation Roofing
    is_safe: bool
    status_label: str   # Safe to Proceed, Proceed with Precautions, Postpone / Reschedule
    rationale: str

class WeatherAdvisoryResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    timestamp: str
    provider: str
    is_live_data: bool
    current: WeatherCondition
    alerts: List[WeatherAlert]
    activity_impacts: List[ConstructionImpactItem]
    concrete_curing_recommendation: str
