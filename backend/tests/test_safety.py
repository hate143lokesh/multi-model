from app.services.ai_service import AIService
from app.schemas.safety import SafetyAnalysisOut
from app.schemas.crack import CrackAnalysisOut

def test_safety_simulator_contract():
    result = AIService._simulate_safety_analysis(site_area="Basement Level 2", worker_count=5)
    assert isinstance(result, SafetyAnalysisOut)
    assert result.site_area == "Basement Level 2"
    assert result.workers_detected == 5
    assert len(result.observations) > 0
    assert result.overall_risk in ["Low", "Moderate", "High", "Critical"]
    assert 0.0 <= result.safety_score <= 100.0

def test_crack_simulator_contract():
    result = AIService._simulate_crack_analysis(structural_element="Transfer Girder TG-01", scale_reference=True)
    assert isinstance(result, CrackAnalysisOut)
    assert result.crack_detected is True
    assert result.estimated_width_mm is not None
    assert result.visual_severity in ["Low", "Moderate", "High", "Critical"]
    assert len(result.possible_causes_hypotheses) > 0
    assert result.escalation_required is True
