from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class TaskBase(BaseModel):
    phase: str = "Structural Framework"
    title: str = Field(..., min_length=3)
    description: Optional[str] = ""
    status: str = "Pending"  # Pending, In Progress, Completed, Delayed
    priority: str = "Medium" # Critical, High, Medium, Low
    progress_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    start_date: str = "2025-02-01"
    end_date: str = "2025-03-15"
    assigned_role: str = "Civil Contractor"
    dependencies: Optional[str] = ""

class TaskCreate(TaskBase):
    project_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    phase: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    progress_pct: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    assigned_role: Optional[str] = None
    dependencies: Optional[str] = None

class TaskOut(TaskBase):
    id: int
    project_id: int

    model_config = ConfigDict(from_attributes=True)

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=3)
    code: str = Field(..., min_length=2)
    location: str = "Bangalore, Karnataka"
    project_type: str = "Commercial High-Rise"
    status: str = "In Progress"
    budget: float = Field(default=10000000.0, ge=0.0)
    spent: float = Field(default=0.0, ge=0.0)
    completion_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    start_date: str = "2025-01-01"
    target_end_date: str = "2026-06-30"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[float] = None
    spent: Optional[float] = None
    completion_pct: Optional[float] = None
    target_end_date: Optional[str] = None

class ProjectOut(ProjectBase):
    id: int
    tasks: List[TaskOut] = []

    model_config = ConfigDict(from_attributes=True)

class AIPlanProposalRequest(BaseModel):
    project_type: str = "Commercial High-Rise"
    total_floors: int = Field(default=10, ge=1)
    target_duration_months: int = Field(default=18, ge=1)
    location: str = "Urban Metro"
    custom_notes: Optional[str] = ""
