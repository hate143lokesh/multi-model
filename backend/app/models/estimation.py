from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from app.db.session import Base

class CostEstimate(Base):
    __tablename__ = "cost_estimates"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    project_name = Column(String(255), nullable=False)
    project_type = Column(String(100), default="Residential")
    location = Column(String(255), default="Urban Metro")
    built_up_area_sqft = Column(Float, nullable=False)
    floors = Column(Integer, default=1)
    quality_tier = Column(String(50), default="Standard")  # Economy, Standard, Premium, Luxury
    
    # Material quantities
    cement_bags = Column(Float, default=0.0)
    sand_tons = Column(Float, default=0.0)
    aggregate_tons = Column(Float, default=0.0)
    steel_kg = Column(Float, default=0.0)
    bricks_count = Column(Float, default=0.0)
    concrete_cum = Column(Float, default=0.0)
    
    # Financial breakdown
    material_cost = Column(Float, default=0.0)
    labor_cost = Column(Float, default=0.0)
    equipment_misc_cost = Column(Float, default=0.0)
    contingency_allowance = Column(Float, default=0.0)
    total_estimated_cost = Column(Float, default=0.0)
    cost_per_sqft = Column(Float, default=0.0)
    
    breakdown_json = Column(Text, default="{}")
    assumptions_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
