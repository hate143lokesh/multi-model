import json
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import (
    Project, ProjectTask, SafetyAnalysis, CrackAnalysis, CostEstimate, DailySiteReport
)
from app.schemas.common import APIResponse

router = APIRouter(prefix="/reports", tags=["Executive Reports & Analytics"])

@router.get("/summary", response_model=APIResponse[Dict[str, Any]])
def get_executive_summary(db: Session = Depends(get_db)):
    """
    Consolidated executive summary of all active projects,
    safety hazard distribution, crack assessments, and budget utilization.
    """
    total_projects = db.query(Project).count()
    projects = db.query(Project).all()
    
    total_budget = sum(p.budget for p in projects)
    total_spent = sum(p.spent for p in projects)
    avg_completion = (sum(p.completion_pct for p in projects) / total_projects) if total_projects else 0.0

    safety_count = db.query(SafetyAnalysis).count()
    recent_safety = db.query(SafetyAnalysis).order_by(SafetyAnalysis.created_at.desc()).limit(5).all()

    # Safety severity distribution
    high_critical_hazards = db.query(SafetyAnalysis).filter(SafetyAnalysis.overall_risk.in_(["High", "Critical"])).count()
    moderate_hazards = db.query(SafetyAnalysis).filter(SafetyAnalysis.overall_risk == "Moderate").count()
    low_hazards = db.query(SafetyAnalysis).filter(SafetyAnalysis.overall_risk == "Low").count()

    # Crack audits
    crack_count = db.query(CrackAnalysis).count()
    recent_cracks = db.query(CrackAnalysis).order_by(CrackAnalysis.created_at.desc()).limit(5).all()

    # Tasks
    tasks_pending = db.query(ProjectTask).filter(ProjectTask.status != "Completed").count()
    tasks_completed = db.query(ProjectTask).filter(ProjectTask.status == "Completed").count()

    summary_data = {
        "kpis": {
            "total_active_projects": total_projects,
            "overall_completion_pct": round(avg_completion, 1),
            "total_portfolio_budget": total_budget,
            "total_budget_spent": total_spent,
            "budget_utilization_pct": round((total_spent / total_budget * 100), 1) if total_budget else 0.0,
            "total_safety_audits": safety_count,
            "total_crack_inspections": crack_count,
            "pending_tasks": tasks_pending,
            "completed_tasks": tasks_completed
        },
        "safety_distribution": [
            {"severity": "Critical & High", "count": high_critical_hazards, "color": "#EF4444"},
            {"severity": "Moderate", "count": moderate_hazards, "color": "#F59E0B"},
            {"severity": "Low / Safe", "count": low_hazards, "color": "#10B981"}
        ],
        "project_summaries": [
            {
                "id": p.id,
                "name": p.name,
                "code": p.code,
                "location": p.location,
                "status": p.status,
                "completion_pct": p.completion_pct,
                "budget": p.budget,
                "spent": p.spent
            }
            for p in projects
        ],
        "recent_safety_logs": [
            {
                "id": s.id,
                "site_area": s.site_area,
                "overall_risk": s.overall_risk,
                "safety_score": s.safety_score,
                "date": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else ""
            }
            for s in recent_safety
        ],
        "recent_crack_logs": [
            {
                "id": c.id,
                "structural_element": c.structural_element,
                "crack_type": c.crack_type,
                "visual_severity": c.visual_severity,
                "date": c.created_at.strftime("%Y-%m-%d %H:%M") if c.created_at else ""
            }
            for c in recent_cracks
        ]
    }

    return APIResponse(
        success=True,
        data=summary_data,
        message="Executive analytics summary retrieved"
    )
