from typing import List, Optional
from pydantic import BaseModel, Field

class SafetyObservationItem(BaseModel):
    id: str
    category: str  # PPE Compliance, Fall Protection, Housekeeping, Equipment Safety, Access Routes, Safe Practices
    severity: str  # Critical, High, Moderate, Low
    confidence: float = Field(ge=0.0, le=1.0)
    description: str
    location_in_image: Optional[str] = "Center foreground"
    probable_contributing_factor: Optional[str] = "Lack of perimeter anchorage or contractor briefing"
    corrective_action: str
    priority: str = "Immediate (Within 1 hour)"  # Immediate, Before Next Shift, Routine
    osha_reference: Optional[str] = "OSHA 1926.501 (Duty to have fall protection)"

class SafetyAnalysisOut(BaseModel):
    analysis_type: str = "Multimodal Construction Site Safety & PPE Audit"
    project_id: Optional[int] = None
    site_area: str = "General Site"
    overall_risk: str  # Low, Moderate, High, Critical
    safety_score: float = Field(ge=0.0, le=100.0)
    workers_detected: int = 0
    ppe_compliance_pct: float = Field(ge=0.0, le=100.0)
    observations: List[SafetyObservationItem] = []
    probable_contributing_factors: List[str] = []
    recommended_corrective_actions: List[str] = []
    suggested_follow_up: str = "Re-inspect within 4 hours following corrective action implementation."
    limitations: str = "Analysis is preliminary decision support derived from visible visual evidence. On-site verification by an OSHA/certified safety professional is required."
    source_model: str = "Gemini 2.5 Flash Vision"
    is_live_ai: bool = False
