from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_returns_200():
    response = client.get("/api/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "data" in json_data
    assert json_data["data"]["status"] == "healthy"
    assert "ai_engine" in json_data["data"]
    assert "database" in json_data["data"]

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
