import json
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.estimation import CostEstimate
from app.schemas.estimation import EstimationInput, EstimationOutput
from app.schemas.common import APIResponse
from app.services.estimation_service import EstimationService

router = APIRouter(prefix="/estimation", tags=["Construction Cost & Material Estimator"])

@router.post("/calculate", response_model=APIResponse[EstimationOutput])
def calculate_project_cost(data: EstimationInput, db: Session = Depends(get_db)):
    """
    Calculate transparent material quantities (cement, sand, aggregate, steel, bricks, concrete)
    and financial cost breakdown using verified civil engineering formulas.
    """
    result = EstimationService.calculate_estimate(data)

    # Persist estimate in database
    try:
        cement_qty = next((m.quantity for m in result.materials if "Cement" in m.material), 0.0)
        sand_qty = next((m.quantity for m in result.materials if "Sand" in m.material), 0.0)
        agg_qty = next((m.quantity for m in result.materials if "Aggregate" in m.material), 0.0)
        steel_qty = next((m.quantity for m in result.materials if "Steel" in m.material), 0.0)
        bricks_qty = next((m.quantity for m in result.materials if "Bricks" in m.material), 0.0)

        record = CostEstimate(
            project_name=data.project_name,
            project_type=data.project_type,
            location=data.location,
            built_up_area_sqft=data.built_up_area,
            floors=data.floors,
            quality_tier=data.quality_tier,
            cement_bags=cement_qty,
            sand_tons=sand_qty,
            aggregate_tons=agg_qty,
            steel_kg=steel_qty,
            bricks_count=bricks_qty,
            concrete_cum=result.concrete_volume_cum,
            material_cost=result.breakdown.total_material_cost,
            labor_cost=result.breakdown.total_labor_cost,
            equipment_misc_cost=result.breakdown.total_equipment_cost,
            contingency_allowance=result.breakdown.contingency_cost,
            total_estimated_cost=result.breakdown.total_estimated_cost,
            cost_per_sqft=result.breakdown.cost_per_sqft,
            breakdown_json=json.dumps(result.breakdown.model_dump()),
            assumptions_json=json.dumps(result.assumptions)
        )
        db.add(record)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[ConstructAI Warning] Failed to persist cost estimate: {e}")

    return APIResponse(
        success=True,
        data=result,
        message="Cost and material estimation computed"
    )

@router.get("/history", response_model=APIResponse[List[dict]])
def get_estimation_history(limit: int = 10, db: Session = Depends(get_db)):
    """Retrieve historical cost estimations."""
    records = db.query(CostEstimate).order_by(CostEstimate.created_at.desc()).limit(limit).all()
    items = []
    for r in records:
        items.append({
            "id": r.id,
            "project_name": r.project_name,
            "project_type": r.project_type,
            "location": r.location,
            "built_up_area_sqft": r.built_up_area_sqft,
            "quality_tier": r.quality_tier,
            "total_estimated_cost": r.total_estimated_cost,
            "cost_per_sqft": r.cost_per_sqft,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""
        })
    return APIResponse(
        success=True,
        data=items,
        message=f"Retrieved {len(items)} cost estimate records"
    )
