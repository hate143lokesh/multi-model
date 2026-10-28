from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.report import DailySiteReport
from app.schemas.assistant import (
    ChatRequest, ChatResponse, DailyReportGenerateRequest, DailyReportOut
)
from app.schemas.common import APIResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/assistant", tags=["Daily Site Assistant & Knowledge QA"])

@router.post("/chat", response_model=APIResponse[ChatResponse])
def chat_with_copilot(req: ChatRequest):
    """
    Multimodal construction engineering copilot.
    Provides answers on IS/ACI/OSHA standards, methods of construction,
    quantity estimation formulas, and daily site troubleshooting.
    """
    response = AIService.answer_construction_question(
        question=req.message,
        history=req.history
    )
    return APIResponse(
        success=True,
        data=response,
        message="Copilot advisory generated"
    )

@router.post("/daily-report", response_model=APIResponse[DailyReportOut])
def generate_and_save_daily_report(req: DailyReportGenerateRequest, db: Session = Depends(get_db)):
    """
    Generate and persist a formal Daily Construction Site Report.
    """
    exec_summary = (
        f"Site operations on {req.date} proceeded with {req.workforce_count} personnel on duty under {req.weather_summary}. "
        f"Key activities completed: {req.work_completed_notes}. Safety status: {req.safety_notes}."
    )

    record = DailySiteReport(
        project_id=req.project_id,
        report_date=req.date,
        weather_summary=req.weather_summary,
        workforce_count=req.workforce_count,
        work_completed=req.work_completed_notes,
        delays_or_impediments=req.delays_notes or "None reported",
        materials_received=req.materials_received_notes or "Standard deliveries logged",
        safety_observations=req.safety_notes or "Safe working conditions maintained",
        equipment_on_site="1x Tower Crane, 2x Transit Mixers, 1x Diesel Generator (active)",
        snag_list="Verify cure compound coverage on exterior shear wall SW-02."
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    out = DailyReportOut(
        id=record.id,
        project_id=record.project_id,
        report_date=record.report_date,
        weather_summary=record.weather_summary,
        workforce_count=record.workforce_count,
        executive_summary=exec_summary,
        work_completed=record.work_completed,
        delays_or_impediments=record.delays_or_impediments,
        materials_received=record.materials_received,
        safety_observations=record.safety_observations,
        equipment_on_site=record.equipment_on_site,
        snag_list=record.snag_list,
        created_at=record.created_at.strftime("%Y-%m-%d %H:%M") if record.created_at else ""
    )

    return APIResponse(
        success=True,
        data=out,
        message="Daily site report generated and archived"
    )

@router.get("/daily-reports", response_model=APIResponse[List[dict]])
def list_daily_reports(project_id: Optional[int] = None, limit: int = 15, db: Session = Depends(get_db)):
    """Retrieve archived daily site reports."""
    query = db.query(DailySiteReport)
    if project_id:
        query = query.filter(DailySiteReport.project_id == project_id)
    records = query.order_by(DailySiteReport.created_at.desc()).limit(limit).all()

    items = [
        {
            "id": r.id,
            "project_id": r.project_id,
            "report_date": r.report_date,
            "author": r.author,
            "weather_summary": r.weather_summary,
            "workforce_count": r.workforce_count,
            "work_completed": r.work_completed,
            "safety_observations": r.safety_observations,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""
        }
        for r in records
    ]
    return APIResponse(
        success=True,
        data=items,
        message=f"Retrieved {len(items)} daily site reports"
    )
