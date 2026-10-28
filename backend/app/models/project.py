from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    location = Column(String(255), default="Bangalore, Karnataka")
    project_type = Column(String(100), default="Commercial Tower")
    status = Column(String(50), default="In Progress")
    budget = Column(Float, default=12500000.0)
    spent = Column(Float, default=4850000.0)
    completion_pct = Column(Float, default=38.5)
    start_date = Column(String(50), default="2025-01-15")
    target_end_date = Column(String(50), default="2026-06-30")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tasks = relationship("ProjectTask", back_populates="project", cascade="all, delete-orphan")


class ProjectTask(Base):
    __tablename__ = "project_tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    phase = Column(String(100), default="Structural Framework")
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="In Progress")  # Pending, In Progress, Completed, Delayed
    priority = Column(String(20), default="Medium")     # Critical, High, Medium, Low
    progress_pct = Column(Float, default=0.0)
    start_date = Column(String(50), default="2025-02-01")
    end_date = Column(String(50), default="2025-03-15")
    assigned_role = Column(String(100), default="Structural Contractor")
    dependencies = Column(String(255), default="")      # Comma-separated task IDs or codes
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="tasks")
