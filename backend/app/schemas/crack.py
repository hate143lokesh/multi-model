from typing import List, Optional
from pydantic import BaseModel, Field

class CrackAnalysisOut(BaseModel):
    analysis_type: str = "Structural Element Visual Crack Triage"
    project_id: Optional[int] = None
    structural_element: str = "Reinforced Concrete Member"
    image_quality: str = "Acceptable for visual screening"
    crack_detected: bool = True
    crack_pattern: str = "Diagonal Shear Crack"  # Longitudinal, Transverse, Diagonal, Branching, Map/Crazing, None
    visual_severity: str = "Moderate"             # Low, Moderate, High, Critical
    estimated_width_mm: Optional[float] = None    # Null if no scale reference in image
    width_confidence_note: str = "Approximate estimate; calibrate with optical crack-width gauge on site."
    confidence: float = Field(ge=0.0, le=1.0)
    visible_location: str = "Mid-span web junction"
    possible_causes_hypotheses: List[str] = []
    recommended_inspection_actions: List[str] = []
    recommended_maintenance_actions: List[str] = []
    escalation_required: bool = False
    escalation_reason: Optional[str] = None
    limitations: str = "Preliminary visual triage only. Does NOT constitute a certified structural engineering diagnosis. Contact a licensed structural engineer for load capacity assessment."
    source_model: str = "Gemini 2.5 Flash Vision"
    is_live_ai: bool = False
