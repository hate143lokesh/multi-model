from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from app.db.session import Base

class SafetyAnalysis(Base):
    __tablename__ = "safety_analyses"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    image_filename = Column(String(255), nullable=True)
    site_area = Column(String(100), default="General Site Area")
    overall_risk = Column(String(50), default="Moderate")  # Low, Moderate, High, Critical
    safety_score = Column(Float, default=75.0)             # 0 to 100
    workers_detected = Column(Integer, default=0)
    ppe_compliance_pct = Column(Float, default=70.0)
    findings_json = Column(Text, default="[]")             # JSON array of detected hazard observations
    recommendations_json = Column(Text, default="[]")      # JSON array of corrective action recommendations
    limitations = Column(Text, default="Visual analysis limited to camera field of view. On-site verification required by a designated Safety Officer.")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
