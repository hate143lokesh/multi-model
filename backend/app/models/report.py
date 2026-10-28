from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from app.db.session import Base

class DailySiteReport(Base):
    __tablename__ = "daily_site_reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    report_date = Column(String(50), nullable=False)
    author = Column(String(100), default="Site Project Engineer")
    weather_summary = Column(String(255), default="Clear, 28°C, Humidity 45%")
    workforce_count = Column(Integer, default=45)
    
    work_completed = Column(Text, nullable=False)
    delays_or_impediments = Column(Text, default="None")
    materials_received = Column(Text, default="500 bags OPC 53 Cement, 10 metric tons TMT 16mm rebar")
    safety_observations = Column(Text, default="100% PPE compliance observed at Floor 4 slab casting.")
    equipment_on_site = Column(Text, default="1x Tower Crane, 2x Transit Mixers, 1x Concrete Pump")
    snag_list = Column(Text, default="Curing compound spray verification pending on column C12.")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
