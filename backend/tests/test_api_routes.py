import io
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_test_image_bytes():
    """Create a minimal valid JPEG image in memory for testing."""
    img = Image.new("RGB", (400, 300), color=(100, 120, 150))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()

def test_list_projects_and_detail():
    resp = client.get("/api/projects")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1

    project_id = data["data"][0]["id"]
    detail_resp = client.get(f"/api/projects/{project_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["data"]["id"] == project_id

def test_cost_estimation_endpoint():
    payload = {
        "project_name": "API Test Project",
        "project_type": "Commercial",
        "location": "Bangalore",
        "built_up_area": 10000.0,
        "floors": 4,
        "quality_tier": "Standard",
        "contingency_pct": 5.0
    }
    resp = client.post("/api/estimation/calculate", json=payload)
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["success"] is True
    assert res_data["data"]["breakdown"]["total_estimated_cost"] > 0
    assert len(res_data["data"]["materials"]) == 5

def test_valuation_endpoint():
    payload = {
        "property_name": "Test Residence",
        "property_type": "Residential Apartment",
        "location": "Whitefield, Bangalore",
        "built_up_area_sqft": 1500.0,
        "bedrooms": 3,
        "bathrooms": 2,
        "property_age_years": 1.5,
        "construction_quality": "Grade A",
        "condition": "Excellent",
        "has_parking": True,
        "has_lift": True,
        "has_clubhouse": True
    }
    resp = client.post("/api/valuation/calculate", json=payload)
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["success"] is True
    assert res_data["data"]["estimated_price_mid"] > 0
    assert len(res_data["data"]["valuation_factors"]) > 0

def test_weather_advisory_endpoint():
    resp = client.get("/api/weather/advisory?location=Bangalore")
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["success"] is True
    assert "current" in res_data["data"]
    assert "activity_impacts" in res_data["data"]
    assert len(res_data["data"]["activity_impacts"]) > 0

def test_reports_summary_endpoint():
    resp = client.get("/api/reports/summary")
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["success"] is True
    assert "kpis" in res_data["data"]
    assert res_data["data"]["kpis"]["total_active_projects"] >= 1

def test_safety_multipart_image_upload():
    img_bytes = create_test_image_bytes()
    files = {"file": ("test_site.jpg", img_bytes, "image/jpeg")}
    data = {
        "site_area": "Floor 4 Slab",
        "worker_count": "5",
        "site_description": "Active formwork setup"
    }
    resp = client.post("/api/safety/analyze", files=files, data=data)
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["success"] is True
    assert res_data["data"]["overall_risk"] in ["Low", "Moderate", "High", "Critical"]
    assert len(res_data["data"]["observations"]) > 0

def test_cracks_multipart_image_upload():
    img_bytes = create_test_image_bytes()
    files = {"file": ("test_beam.jpg", img_bytes, "image/jpeg")}
    data = {
        "structural_element": "Reinforced Concrete Beam",
        "scale_reference": "true",
        "notes": "Shear zone check"
    }
    resp = client.post("/api/cracks/analyze", files=files, data=data)
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["success"] is True
    assert res_data["data"]["crack_detected"] is True
    assert res_data["data"]["visual_severity"] in ["Low", "Moderate", "High", "Critical"]
