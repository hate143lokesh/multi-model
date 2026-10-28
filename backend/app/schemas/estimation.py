from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class MaterialRateConfig(BaseModel):
    cement_per_bag: float = Field(default=380.0, description="Rate per 50kg bag (INR or user currency)")
    sand_per_ton: float = Field(default=1200.0, description="Rate per metric ton")
    aggregate_per_ton: float = Field(default=950.0, description="Rate per metric ton")
    steel_per_kg: float = Field(default=68.0, description="Rate per kg of TMT rebar")
    bricks_per_piece: float = Field(default=9.5, description="Rate per standard clay brick or block unit")
    labor_rate_sqft: float = Field(default=320.0, description="Composite labor rate per sq ft built-up area")
    equipment_rate_sqft: float = Field(default=90.0, description="Equipment, scaffolding & shuttering per sq ft")

class EstimationInput(BaseModel):
    project_name: str = "Residential Villa / Multi-Story"
    project_type: str = "Residential"  # Residential, Commercial, Industrial, Institutional
    location: str = "Urban Metro Area"
    built_up_area: float = Field(..., gt=0, description="Built up area in sq ft")
    floors: int = Field(default=2, ge=1, le=100)
    quality_tier: str = "Standard"  # Economy, Standard, Premium, Luxury
    custom_rates: Optional[MaterialRateConfig] = None
    contingency_pct: float = Field(default=5.0, ge=0.0, le=25.0)

class MaterialQuantityItem(BaseModel):
    material: str
    quantity: float
    unit: str
    unit_rate: float
    total_amount: float
    estimation_formula: str

class CostBreakdown(BaseModel):
    total_material_cost: float
    total_labor_cost: float
    total_equipment_cost: float
    contingency_cost: float
    total_estimated_cost: float
    cost_per_sqft: float
    uncertainty_range_min: float
    uncertainty_range_max: float

class EstimationOutput(BaseModel):
    project_name: str
    project_type: str
    location: str
    built_up_area_sqft: float
    floors: int
    quality_tier: str
    materials: List[MaterialQuantityItem]
    concrete_volume_cum: float
    breakdown: CostBreakdown
    assumptions: List[str]
    exclusions: List[str]
    disclaimer: str = "Conceptual thumb-rule estimate (±10% to 15% range). Not a formal certified Bill of Quantities (BOQ) or detailed structural design calculation."
