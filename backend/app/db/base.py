import json
from app.db.session import engine, SessionLocal, Base
from app.models import (
    User, Project, ProjectTask, SafetyAnalysis, CrackAnalysis,
    CostEstimate, PropertyValuation, DailySiteReport
)
from app.core.security import hash_password

def init_db():
    """Create database tables and seed baseline data if empty."""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Default Admin User if none exists
        existing_user = db.query(User).filter(User.email == "admin@constructai.io").first()
        if not existing_user:
            admin_user = User(
                email="admin@constructai.io",
                hashed_password=hash_password("constructai123"),
                full_name="Chief Site Engineer",
                role="Principal Project Manager",
                is_active=True
            )
            db.add(admin_user)
            db.commit()

        # 2. Seed Default Projects if none exist
        if db.query(Project).count() == 0:
            p1 = Project(
                name="Metro Heights Tech Park — Phase 2",
                code="PRJ-METRO-02",
                location="Whitefield, Bangalore",
                project_type="Commercial High-Rise",
                status="In Progress",
                budget=245000000.0,
                spent=112000000.0,
                completion_pct=45.8,
                start_date="2024-09-01",
                target_end_date="2026-08-30"
            )
            p2 = Project(
                name="Aura Lakeview Residences",
                code="PRJ-AURA-01",
                location="Sector 62, Gurgaon",
                project_type="Residential Towers",
                status="In Progress",
                budget=142000000.0,
                spent=89000000.0,
                completion_pct=62.4,
                start_date="2024-03-15",
                target_end_date="2025-11-20"
            )
            db.add_all([p1, p2])
            db.commit()
            db.refresh(p1)
            db.refresh(p2)

            # Seed Tasks for Project 1
            tasks = [
                ProjectTask(
                    project_id=p1.id,
                    phase="Site Preparation & Excavation",
                    title="Deep basement piling & shoring wall installation",
                    status="Completed",
                    priority="High",
                    progress_pct=100.0,
                    start_date="2024-09-01",
                    end_date="2024-11-15",
                    assigned_role="Geotechnical Specialist",
                    dependencies=""
                ),
                ProjectTask(
                    project_id=p1.id,
                    phase="Foundation & Substructure",
                    title="Raft foundation rebar tying & M40 grade concrete pour",
                    status="Completed",
                    priority="Critical",
                    progress_pct=100.0,
                    start_date="2024-11-16",
                    end_date="2025-01-20",
                    assigned_role="Civil Contractor",
                    dependencies="Task-1"
                ),
                ProjectTask(
                    project_id=p1.id,
                    phase="Structural Framework",
                    title="Level 4 to 8 column shuttering & PT slab casting",
                    status="In Progress",
                    priority="Critical",
                    progress_pct=60.0,
                    start_date="2025-01-25",
                    end_date="2025-04-10",
                    assigned_role="Structural Engineer",
                    dependencies="Task-2"
                ),
                ProjectTask(
                    project_id=p1.id,
                    phase="Masonry & Core Walls",
                    title="AAC block masonry work on lower mechanical floors",
                    status="Pending",
                    priority="Medium",
                    progress_pct=15.0,
                    start_date="2025-04-15",
                    end_date="2025-06-30",
                    assigned_role="Masonry Lead",
                    dependencies="Task-3"
                ),
                ProjectTask(
                    project_id=p1.id,
                    phase="MEP Services",
                    title="HVAC vertical risers and fire-sprinkler piping",
                    status="Pending",
                    priority="High",
                    progress_pct=0.0,
                    start_date="2025-06-01",
                    end_date="2025-09-30",
                    assigned_role="MEP Consultant",
                    dependencies="Task-4"
                ),
            ]
            db.add_all(tasks)

            # Seed sample initial safety audit
            s1 = SafetyAnalysis(
                project_id=p1.id,
                site_area="Floor 6 Pouring Deck",
                overall_risk="Moderate",
                safety_score=82.0,
                workers_detected=6,
                ppe_compliance_pct=83.3,
                findings_json=json.dumps([
                    {
                        "id": "OBS-01",
                        "category": "PPE Compliance",
                        "severity": "Low",
                        "confidence": 0.94,
                        "description": "5 of 6 workers observed wearing safety hardhats and high-visibility vests.",
                        "location": "Upper staging platform",
                        "corrective_action": "Issue high-visibility vest to worker at rebar bending bench."
                    },
                    {
                        "id": "OBS-02",
                        "category": "Fall Protection",
                        "severity": "High",
                        "confidence": 0.89,
                        "description": "Perimeter slab edge guardrail missing toe-boards along northern elevation.",
                        "location": "Northern cantilever slab edge",
                        "corrective_action": "Install OSHA-compliant 4-inch toe-boards and mid-rails immediately."
                    }
                ]),
                recommendations_json=json.dumps([
                    "Halt perimeter work on Floor 6 until toe-boards are anchored.",
                    "Conduct toolbox briefing on edge protection prior to next shift."
                ])
            )
            db.add(s1)

            # Seed sample initial crack audit
            c1 = CrackAnalysis(
                project_id=p1.id,
                structural_element="Basement Shear Wall SW-04",
                crack_detected=True,
                crack_type="Diagonal Shear Crack",
                visual_severity="Moderate",
                estimated_width_mm=1.2,
                confidence=0.87,
                image_quality="High resolution, uniform lighting",
                causes_json=json.dumps([
                    "Differential foundation settlement stress",
                    "Early-age concrete thermal shrinkage",
                    "Transient structural loading during crane repositioning"
                ]),
                recommendations_json=json.dumps([
                    "Install calibrated tell-tale crack monitoring gauges to record movement.",
                    "Non-destructive ultrasonic pulse velocity (UPV) test recommended.",
                    "If width exceeds 1.5mm, execute low-pressure epoxy injection grouting."
                ])
            )
            db.add(c1)

            db.commit()
    except Exception as e:
        db.rollback()
        print(f"[ConstructAI] Database init warning: {e}")
    finally:
        db.close()
