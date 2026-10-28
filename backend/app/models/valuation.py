from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.db.session import Base

class PropertyValuation(Base):
    __tablename__ = "property_valuations"

    id = Column(Integer, primary_key=True, index=True)
    property_name = Column(String(255), default="Subject Property")
    property_type = Column(String(100), default="Residential Apartment")
    location = Column(String(255), nullable=False)
    built_up_area_sqft = Column(Float, nullable=False)
    bedrooms = Column(Integer, default=3)
    bathrooms = Column(Integer, default=2)
    property_age_years = Column(Float, default=2.0)
    construction_quality = Column(String(50), default="Grade A")
    condition = Column(String(50), default="Good")
    
    estimated_price_min = Column(Float, default=0.0)
    estimated_price_max = Column(Float, default=0.0)
    estimated_price_avg = Column(Float, default=0.0)
    price_per_sqft = Column(Float, default=0.0)
    
    valuation_factors_json = Column(Text, default="[]")
    comparables_json = Column(Text, default="[]")
    disclaimers = Column(Text, default="Indicative estimate based on statistical valuation heuristics and user parameters. Not a certified bank appraisal.")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
