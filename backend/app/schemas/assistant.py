from typing import List, Optional
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str
    image_base64: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    project_id: Optional[int] = None
    task_category: Optional[str] = "Daily Operations"  # Daily Operations, Safety Briefing, Snag List, Engineering Standards, Requisition
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    suggested_followups: List[str] = []
    actionable_items: List[str] = []
    category: str = "Construction Engineering"
    model_used: str = "Gemini 2.5 Flash / Domain Knowledge Engine"

class DailyReportGenerateRequest(BaseModel):
    project_id: Optional[int] = None
    date: str
    weather_summary: str = "Clear, 28°C"
    workforce_count: int = 40
    work_completed_notes: str
    delays_notes: Optional[str] = "None"
    materials_received_notes: Optional[str] = "Standard supply"
    safety_notes: Optional[str] = "Full PPE compliance verified"

class DailyReportOut(BaseModel):
    id: Optional[int] = None
    project_id: Optional[int] = None
    report_date: str
    weather_summary: str
    workforce_count: int
    executive_summary: str
    work_completed: str
    delays_or_impediments: str
    materials_received: str
    safety_observations: str
    equipment_on_site: str
    snag_list: str
    created_at: str
