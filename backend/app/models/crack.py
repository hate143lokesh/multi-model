from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from app.db.session import Base

class CrackAnalysis(Base):
    __tablename__ = "crack_analyses"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    image_filename = Column(String(255), nullable=True)
    structural_element = Column(String(100), default="Concrete Beam / Column")
    crack_detected = Column(Boolean, default=True)
    crack_type = Column(String(100), default="Diagonal Shear Crack")  # Longitudinal, Transverse, Diagonal, Branching, Hairline, None
    visual_severity = Column(String(50), default="Moderate")           # Low, Moderate, High, Critical
    estimated_width_mm = Column(Float, nullable=True)                  # Only if scale reference present
    confidence = Column(Float, default=0.88)
    image_quality = Column(String(50), default="Adequate for visual triage")
    causes_json = Column(Text, default="[]")                           # List of hypothesis causes
    recommendations_json = Column(Text, default="[]")                  # List of recommended actions
    limitations = Column(Text, default="Preliminary visual triage. Does not constitute a certified structural engineering diagnosis.")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
