import json
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.crack import CrackAnalysis
from app.schemas.crack import CrackAnalysisOut
from app.schemas.common import APIResponse
from app.services.image_service import ImageService
from app.services.ai_service import AIService

router = APIRouter(prefix="/cracks", tags=["Crack Detection & Structural Triage"])

@router.post("/analyze", response_model=APIResponse[CrackAnalysisOut])
async def analyze_structural_crack(
    file: UploadFile = File(...),
    structural_element: str = Form("Reinforced Concrete Beam / Column"),
    scale_reference: bool = Form(False),
    project_id: Optional[int] = Form(None),
    notes: Optional[str] = Form(""),
    db: Session = Depends(get_db)
):
    """
    Multimodal structural crack inspection:
    Performs image validation, crack pattern classification (shear, flexural, shrinkage),
    visual severity triage, and hypothesis analysis.
    """
    # 1. Validate image format and quality
    contents, mime_type, meta = await ImageService.validate_and_process_upload(file)

    # 2. Run structural triage
    elem_str = f"{structural_element} ({notes})" if notes else structural_element
    result = AIService.analyze_structural_crack(
        image_bytes=contents,
        mime_type=mime_type,
        structural_element=elem_str,
        scale_reference_present=scale_reference
    )
    result.project_id = project_id
    result.image_quality = meta.get("quality_rating", "Acceptable for visual screening")

    # 3. Persist in database for historical comparison
    try:
        record = CrackAnalysis(
            project_id=project_id,
            image_filename=file.filename or "crack_photo.jpg",
            structural_element=structural_element,
            crack_detected=result.crack_detected,
            crack_type=result.crack_pattern,
            visual_severity=result.visual_severity,
            estimated_width_mm=result.estimated_width_mm,
            confidence=result.confidence,
            image_quality=result.image_quality,
            causes_json=json.dumps(result.possible_causes_hypotheses),
            recommendations_json=json.dumps(result.recommended_inspection_actions + result.recommended_maintenance_actions),
            limitations=result.limitations
        )
        db.add(record)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[ConstructAI Warning] Failed to persist crack assessment: {e}")

    return APIResponse(
        success=True,
        data=result,
        message="Crack assessment and triage completed"
    )

@router.get("/history", response_model=APIResponse[List[dict]])
def get_crack_history(project_id: Optional[int] = None, limit: int = 10, db: Session = Depends(get_db)):
    """Retrieve historical crack inspections for condition comparison."""
    query = db.query(CrackAnalysis)
    if project_id:
        query = query.filter(CrackAnalysis.project_id == project_id)
    records = query.order_by(CrackAnalysis.created_at.desc()).limit(limit).all()

    items = []
    for r in records:
        try:
            causes = json.loads(r.causes_json) if r.causes_json else []
        except Exception:
            causes = []
        try:
            recs = json.loads(r.recommendations_json) if r.recommendations_json else []
        except Exception:
            recs = []

        items.append({
            "id": r.id,
            "project_id": r.project_id,
            "image_filename": r.image_filename,
            "structural_element": r.structural_element,
            "crack_detected": r.crack_detected,
            "crack_type": r.crack_type,
            "visual_severity": r.visual_severity,
            "estimated_width_mm": r.estimated_width_mm,
            "confidence": r.confidence,
            "image_quality": r.image_quality,
            "causes": causes,
            "recommendations": recs,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""
        })

    return APIResponse(
        success=True,
        data=items,
        message=f"Retrieved {len(items)} structural crack inspection records"
    )
