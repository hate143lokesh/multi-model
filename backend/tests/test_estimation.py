from app.schemas.estimation import EstimationInput
from app.services.estimation_service import EstimationService

def test_estimation_service_calculation():
    input_data = EstimationInput(
        project_name="Test Residential Villa",
        project_type="Residential",
        location="Bangalore",
        built_up_area=2000.0,
        floors=2,
        quality_tier="Standard",
        contingency_pct=5.0
    )

    result = EstimationService.calculate_estimate(input_data)
    assert result.built_up_area_sqft == 2000.0
    assert result.floors == 2
    assert result.quality_tier == "Standard"
    
    # 2000 sqft * 0.40 = 800 bags cement
    cement_item = next(m for m in result.materials if "Cement" in m.material)
    assert cement_item.quantity == 800.0

    # Total cost should be positive and realistic
    assert result.breakdown.total_estimated_cost > 0
    assert result.breakdown.total_material_cost > 0
    assert result.breakdown.total_labor_cost > 0
    assert result.breakdown.cost_per_sqft > 1000.0

    # Uncertainty range verification
    assert result.breakdown.uncertainty_range_min < result.breakdown.total_estimated_cost
    assert result.breakdown.uncertainty_range_max > result.breakdown.total_estimated_cost
