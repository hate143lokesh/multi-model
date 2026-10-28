from typing import List, Optional
from pydantic import BaseModel, Field

class ComparablePropertyItem(BaseModel):
    property_title: str
    locality: str
    area_sqft: float
    price: float
    price_per_sqft: float
    property_type: str
    age_years: float
    source: str = "Configured Regional Sample Benchmark"

class ValuationInput(BaseModel):
    property_name: str = "Subject Property"
    property_type: str = "Residential Apartment"  # Residential Apartment, Independent Villa, Commercial Office, Retail Shop
    location: str = "Whitefield / IT Corridor, Bangalore"
    built_up_area_sqft: float = Field(..., gt=0)
    bedrooms: int = Field(default=3, ge=1)
    bathrooms: int = Field(default=2, ge=1)
    property_age_years: float = Field(default=2.0, ge=0.0)
    construction_quality: str = "Grade A"  # Grade A, Grade B, Grade C
    condition: str = "Good"                # New, Excellent, Good, Fair, Needs Renovation
    has_parking: bool = True
    has_lift: bool = True
    has_clubhouse: bool = True

class ValuationFactor(BaseModel):
    factor_name: str
    impact: str  # Positive, Neutral, Negative
    weight_pct: float
    rationale: str

class ValuationOutput(BaseModel):
    property_name: str
    property_type: str
    location: str
    built_up_area_sqft: float
    estimated_price_min: float
    estimated_price_max: float
    estimated_price_mid: float
    price_per_sqft_mid: float
    valuation_factors: List[ValuationFactor]
    comparable_benchmark_summary: List[ComparablePropertyItem]
    assumptions_limitations: List[str]
    disclaimer: str = "This output is an algorithmic indicative valuation based on parametric heuristics and regional benchmark indicators. It does NOT constitute a certified bank appraisal or legal property title valuation."
