import json
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.safety import SafetyAnalysis
from app.schemas.safety import SafetyAnalysisOut, SafetyObservationItem
from app.schemas.common import APIResponse
from app.services.image_service import ImageService
from app.services.ai_service import AIService

router = APIRouter(prefix="/safety", tags=["Construction Safety & PPE"])

@router.post("/analyze", response_model=APIResponse[SafetyAnalysisOut])
async def analyze_site_safety(
    file: UploadFile = File(...),
    site_area: str = Form("Active Construction Zone"),
    project_id: Optional[int] = Form(None),
    worker_count: Optional[int] = Form(None),
    site_description: Optional[str] = Form(""),
    db: Session = Depends(get_db)
):
    """
    Multimodal site safety analysis:
    Processes uploaded photograph, validates image format/integrity,
    scans for missing PPE, fall hazards, and housekeeping violations.
    """
    # 1. Validate image
    contents, mime_type, meta = await ImageService.validate_and_process_upload(file)

    # 2. Run multimodal AI analysis
    area_with_desc = f"{site_area} ({site_description})" if site_description else site_area
    result = AIService.analyze_site_safety(
        image_bytes=contents,
        mime_type=mime_type,
        site_area=area_with_desc,
        worker_count_hint=worker_count
    )
    result.project_id = project_id

    # 3. Persist record in database
    try:
        findings_payload = [obs.model_dump() for obs in result.observations]
        record = SafetyAnalysis(
            project_id=project_id,
            image_filename=file.filename or "site_photo.jpg",
            site_area=site_area,
            overall_risk=result.overall_risk,
            safety_score=result.safety_score,
            workers_detected=result.workers_detected,
            ppe_compliance_pct=result.ppe_compliance_pct,
            findings_json=json.dumps(findings_payload),
            recommendations_json=json.dumps(result.recommended_corrective_actions),
            limitations=result.limitations
        )
        db.add(record)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[ConstructAI Warning] Failed to persist safety audit record: {e}")

    return APIResponse(
        success=True,
        data=result,
        message="Safety audit completed successfully"
    )

@router.get("/history", response_model=APIResponse[List[dict]])
def get_safety_history(project_id: Optional[int] = None, limit: int = 10, db: Session = Depends(get_db)):
    """Retrieve historical safety inspection audits."""
    query = db.query(SafetyAnalysis)
    if project_id:
        query = query.filter(SafetyAnalysis.project_id == project_id)
    records = query.order_by(SafetyAnalysis.created_at.desc()).limit(limit).all()

    items = []
    for r in records:
        try:
            findings = json.loads(r.findings_json) if r.findings_json else []
        except Exception:
            findings = []
        try:
            recs = json.loads(r.recommendations_json) if r.recommendations_json else []
        except Exception:
            recs = []

        items.append({
            "id": r.id,
            "project_id": r.project_id,
            "image_filename": r.image_filename,
            "site_area": r.site_area,
            "overall_risk": r.overall_risk,
            "safety_score": r.safety_score,
            "workers_detected": r.workers_detected,
            "ppe_compliance_pct": r.ppe_compliance_pct,
            "findings_count": len(findings),
            "findings": findings,
            "recommendations": recs,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""
        })

    return APIResponse(
        success=True,
        data=items,
        message=f"Retrieved {len(items)} safety inspection records"
    )
