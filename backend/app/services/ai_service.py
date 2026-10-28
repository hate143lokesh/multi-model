import json
import re
import requests
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.schemas.safety import SafetyAnalysisOut, SafetyObservationItem
from app.schemas.crack import CrackAnalysisOut
from app.schemas.assistant import ChatResponse
from app.schemas.project import TaskOut

class AIService:
    @classmethod
    def _call_gemini_api(cls, prompt: str, image_bytes: Optional[bytes] = None, mime_type: str = "image/jpeg") -> Optional[str]:
        """
        Calls Google Gemini Multimodal REST API.
        Returns the raw generated text response, or None if unconfigured / failed.
        """
        if not settings.has_gemini_key:
            return None

        model = settings.GEMINI_MODEL or "gemini-2.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"

        parts: List[Dict[str, Any]] = [{"text": prompt}]

        if image_bytes:
            import base64
            b64_data = base64.b64encode(image_bytes).decode("utf-8")
            parts.append({
                "inline_data": {
                    "mime_type": mime_type,
                    "data": b64_data
                }
            })

        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        }

        try:
            resp = requests.post(url, json=payload, timeout=25.0)
            if resp.status_code == 200:
                result_json = resp.json()
                candidates = result_json.get("candidates", [])
                if candidates:
                    content = candidates[0].get("content", {})
                    candidate_parts = content.get("parts", [])
                    if candidate_parts:
                        return candidate_parts[0].get("text", "")
            else:
                print(f"[ConstructAI Warning] Gemini API responded with status {resp.status_code}: {resp.text[:200]}")
                return None
        except Exception as e:
            print(f"[ConstructAI Warning] Gemini API connection failure: {e}")
            return None

    @classmethod
    def analyze_site_safety(
        cls, 
        image_bytes: bytes, 
        mime_type: str = "image/jpeg", 
        site_area: str = "Active Construction Zone",
        worker_count_hint: Optional[int] = None
    ) -> SafetyAnalysisOut:
        """
        Performs multimodal construction safety and PPE compliance analysis.
        Uses live Gemini Vision if configured; otherwise invokes intelligent simulator.
        """
        prompt = f"""
You are a Principal Construction Safety Auditor and OSHA Compliance Officer.
Analyze the provided construction site image carefully. Site area: '{site_area}'.
Report on:
1. Missing or inadequate Personal Protective Equipment (Hard hats, high-vis vests, steel-toe boots, eye protection, safety harnesses).
2. Visible fall hazards (open edges, missing toe-boards, unprotected floor openings, unstable scaffolding).
3. Housekeeping and access hazards (tripping hazards, cluttered walkways, protruding rebar).
4. Unsafe equipment usage or heavy machinery positioning.

Return ONLY a valid JSON object with EXACTLY this structure:
{{
  "overall_risk": "Low" | "Moderate" | "High" | "Critical",
  "safety_score": 0.0 to 100.0,
  "workers_detected": integer,
  "ppe_compliance_pct": 0.0 to 100.0,
  "observations": [
    {{
      "id": "OBS-01",
      "category": "PPE Compliance" | "Fall Protection" | "Housekeeping" | "Equipment Safety" | "Access Routes",
      "severity": "Critical" | "High" | "Moderate" | "Low",
      "confidence": 0.0 to 1.0,
      "description": "Specific observation seen in photo",
      "location_in_image": "Where in the photo",
      "probable_contributing_factor": "Probable cause",
      "corrective_action": "Mandatory mitigation action",
      "priority": "Immediate (Within 1 hour)" | "Before Next Shift" | "Routine",
      "osha_reference": "OSHA standard reference if applicable"
    }}
  ],
  "probable_contributing_factors": ["string"],
  "recommended_corrective_actions": ["string"],
  "suggested_follow_up": "string"
}}
"""
        raw_response = cls._call_gemini_api(prompt, image_bytes=image_bytes, mime_type=mime_type)
        if raw_response:
            try:
                data = json.loads(raw_response)
                observations = [
                    SafetyObservationItem(
                        id=obs.get("id", f"OBS-0{i+1}"),
                        category=obs.get("category", "General Safety"),
                        severity=obs.get("severity", "Moderate"),
                        confidence=float(obs.get("confidence", 0.85)),
                        description=obs.get("description", "Safety observation recorded."),
                        location_in_image=obs.get("location_in_image", "Visible area"),
                        probable_contributing_factor=obs.get("probable_contributing_factor", "Site condition"),
                        corrective_action=obs.get("corrective_action", "Address hazard immediately"),
                        priority=obs.get("priority", "Immediate (Within 1 hour)"),
                        osha_reference=obs.get("osha_reference", "OSHA 1926 Safety Standard")
                    )
                    for i, obs in enumerate(data.get("observations", []))
                ]
                return SafetyAnalysisOut(
                    analysis_type="Multimodal Construction Site Safety & PPE Audit",
                    site_area=site_area,
                    overall_risk=data.get("overall_risk", "Moderate"),
                    safety_score=float(data.get("safety_score", 75.0)),
                    workers_detected=int(data.get("workers_detected", 4)),
                    ppe_compliance_pct=float(data.get("ppe_compliance_pct", 80.0)),
                    observations=observations,
                    probable_contributing_factors=data.get("probable_contributing_factors", []),
                    recommended_corrective_actions=data.get("recommended_corrective_actions", []),
                    suggested_follow_up=data.get("suggested_follow_up", "Re-inspect before resumption of high-risk work."),
                    source_model=f"Gemini ({settings.GEMINI_MODEL}) Live Vision",
                    is_live_ai=True
                )
            except Exception as parse_err:
                print(f"[ConstructAI] Failed parsing live Gemini JSON: {parse_err}")

        # Intelligent Simulation Mode Fallback
        return cls._simulate_safety_analysis(site_area, worker_count_hint)

    @classmethod
    def _simulate_safety_analysis(cls, site_area: str, worker_count: Optional[int]) -> SafetyAnalysisOut:
        """High-fidelity civil engineering safety audit simulator."""
        workers = worker_count or 6
        obs = [
            SafetyObservationItem(
                id="OBS-01",
                category="PPE Compliance",
                severity="High",
                confidence=0.92,
                description=f"2 out of {workers} workers observed without Type I/II industrial safety hardhats near upper staging area.",
                location_in_image="Upper left staging platform near rebar bundles",
                probable_contributing_factor="Insufficient morning toolbox briefing and lax subcontractor PPE enforcement",
                corrective_action="Immediately halt overhead staging access; issue certified EN 397 / ANSI Z89.1 hardhats.",
                priority="Immediate (Within 1 hour)",
                osha_reference="OSHA 1926.100 (Head protection)"
            ),
            SafetyObservationItem(
                id="OBS-02",
                category="Fall Protection",
                severity="Critical",
                confidence=0.88,
                description="Perimeter floor slab edge lacks intermediate mid-rail and 4-inch toe-board on western elevation.",
                location_in_image="Western perimeter cantilever edge",
                probable_contributing_factor="Temporary guardrail removed during formwork stripping and not reinstated",
                corrective_action="Install 42-inch top-rail, 21-inch mid-rail, and toe-boards capable of withstanding 200 lbs lateral force.",
                priority="Immediate (Within 1 hour)",
                osha_reference="OSHA 1926.502 (Fall protection systems criteria)"
            ),
            SafetyObservationItem(
                id="OBS-03",
                category="Housekeeping",
                severity="Moderate",
                confidence=0.85,
                description="Uncapped vertical starter rebar dowels protruding along the primary pedestrian access walkway.",
                location_in_image="Central corridor access path",
                probable_contributing_factor="Storage of rebars adjacent to active pedestrian transit corridor",
                corrective_action="Install certified square rebar impalement protection caps (OSHA approved steel reinforced).",
                priority="Before Next Shift",
                osha_reference="OSHA 1926.701(b) (Concrete and masonry impalement protection)"
            ),
            SafetyObservationItem(
                id="OBS-04",
                category="Equipment Safety",
                severity="Low",
                confidence=0.91,
                description="Portable electrical distribution box positioned directly on damp floor without elevated mounting.",
                location_in_image="Floor deck adjacent to column C-14",
                probable_contributing_factor="Lack of dedicated equipment stands on wet curing deck",
                corrective_action="Elevate power distribution panel 150mm above slab level and verify GFCI circuit breaker tripping test.",
                priority="Before Next Shift",
                osha_reference="OSHA 1926.404 (Wiring design and protection)"
            )
        ]

        return SafetyAnalysisOut(
            analysis_type="Multimodal Construction Site Safety & PPE Audit",
            site_area=site_area,
            overall_risk="High",
            safety_score=68.5,
            workers_detected=workers,
            ppe_compliance_pct=66.7,
            observations=obs,
            probable_contributing_factors=[
                "Subcontractor shift handover lacked formal safety supervisor sign-off",
                "Formwork stripping crew removed perimeter edge barriers without temporary netting",
                "Material staging overflow into designated personnel walking routes"
            ],
            recommended_corrective_actions=[
                "Issue stop-work order on western perimeter until OSHA-compliant guardrail is bolted.",
                "Verify impalement caps across all protruding starter bars on floor level.",
                "Conduct mandatory 15-minute PPE and fall-hazard toolbox talk with all site personnel."
            ],
            suggested_follow_up="Re-inspect site area at 14:00 hours today with Site Safety Officer present.",
            limitations="Analysis derived from visible camera perspective. Blind spots, anchor tensile strength, and harness tether attachment points require physical physical verification.",
            source_model="ConstructAI Intelligent Domain Simulator (Configure GEMINI_API_KEY for Live Gemini Vision)",
            is_live_ai=False
        )

    @classmethod
    def analyze_structural_crack(
        cls, 
        image_bytes: bytes, 
        mime_type: str = "image/jpeg", 
        structural_element: str = "Reinforced Concrete Beam / Slab",
        scale_reference_present: bool = False
    ) -> CrackAnalysisOut:
        """
        Structural crack triage and visual assessment.
        Distinguishes visual triage from certified structural diagnosis.
        """
        prompt = f"""
You are a Senior Structural Forensic Engineer inspecting a concrete crack photograph.
Structural element: '{structural_element}'. Scale reference present: {scale_reference_present}.

Analyze the image and return a strict JSON object:
{{
  "crack_detected": true | false,
  "crack_pattern": "Longitudinal" | "Transverse" | "Diagonal Shear" | "Branching / Map Cracking" | "Hairline Surface Crazing",
  "visual_severity": "Low" | "Moderate" | "High" | "Critical",
  "estimated_width_mm": number or null (ONLY provide a number if a clear scale/coin/ruler is visible),
  "width_confidence_note": "string explaining width estimation method",
  "confidence": 0.0 to 1.0,
  "visible_location": "string",
  "possible_causes_hypotheses": ["hypothesis 1", "hypothesis 2"],
  "recommended_inspection_actions": ["action 1", "action 2"],
  "recommended_maintenance_actions": ["action 1", "action 2"],
  "escalation_required": true | false,
  "escalation_reason": "string or null",
  "limitations": "string"
}}
"""
        raw_response = cls._call_gemini_api(prompt, image_bytes=image_bytes, mime_type=mime_type)
        if raw_response:
            try:
                data = json.loads(raw_response)
                return CrackAnalysisOut(
                    analysis_type="Structural Element Visual Crack Triage",
                    structural_element=structural_element,
                    image_quality="Validated via Gemini Vision",
                    crack_detected=bool(data.get("crack_detected", True)),
                    crack_pattern=data.get("crack_pattern", "Diagonal Shear Crack"),
                    visual_severity=data.get("visual_severity", "Moderate"),
                    estimated_width_mm=data.get("estimated_width_mm"),
                    width_confidence_note=data.get("width_confidence_note", "Visual approximation; scale verification recommended."),
                    confidence=float(data.get("confidence", 0.88)),
                    visible_location=data.get("visible_location", "Main tension/shear boundary"),
                    possible_causes_hypotheses=data.get("possible_causes_hypotheses", []),
                    recommended_inspection_actions=data.get("recommended_inspection_actions", []),
                    recommended_maintenance_actions=data.get("recommended_maintenance_actions", []),
                    escalation_required=bool(data.get("escalation_required", False)),
                    escalation_reason=data.get("escalation_reason"),
                    limitations="Visual triage only. A licensed structural engineer must verify load conditions, rebar layout, and concrete core strength.",
                    source_model=f"Gemini ({settings.GEMINI_MODEL}) Live Vision",
                    is_live_ai=True
                )
            except Exception as parse_err:
                print(f"[ConstructAI] Failed parsing live crack analysis JSON: {parse_err}")

        # Simulator fallback
        return cls._simulate_crack_analysis(structural_element, scale_reference_present)

    @classmethod
    def _simulate_crack_analysis(cls, structural_element: str, scale_reference: bool) -> CrackAnalysisOut:
        return CrackAnalysisOut(
            analysis_type="Structural Element Visual Crack Triage",
            structural_element=structural_element,
            image_quality="High resolution, uniform contrast, adequate for visual triage",
            crack_detected=True,
            crack_pattern="Diagonal Shear Crack (45-degree angle)",
            visual_severity="Moderate",
            estimated_width_mm=1.4 if scale_reference else None,
            width_confidence_note="Scale reference visible: estimated width ~1.4mm. Calibrate with optical crack comparator on site." if scale_reference else "No calibrated scale reference detected in photo; numerical width withheld to prevent unverified assumptions.",
            confidence=0.89,
            visible_location="Near quarter-span beam web support region",
            possible_causes_hypotheses=[
                "High diagonal shear stress exceeding shear reinforcement capacity (stirrups).",
                "Differential structural settlement causing rotational shear distortion.",
                "Thermal contraction constraint coupled with early-age loading."
            ],
            recommended_inspection_actions=[
                "Install optical tell-tale crack motion monitors across crack lip to record active widening.",
                "Perform Non-Destructive Ultrasonic Pulse Velocity (UPV) test to map crack penetration depth.",
                "Review structural load logs to verify whether recent heavy construction material staging exceeded slab design limits."
            ],
            recommended_maintenance_actions=[
                "If crack is dormant (< 1.5mm): Low-pressure structural epoxy injection (ASTM C881).",
                "If active crack due to shear deficiency: Install carbon fiber reinforced polymer (CFRP) shear wrap laminate.",
                "Chisel loose concrete debris along crack lips and vacuum clean prior to resin placement."
            ],
            escalation_required=True,
            escalation_reason="Crack angle (approx. 45 degrees) and web proximity indicate potential shear mechanism rather than purely superficial shrinkage.",
            limitations="Preliminary visual triage screening only. Does NOT constitute a certified structural engineering diagnosis. A licensed professional engineer must evaluate load redistribution and structural safety.",
            source_model="ConstructAI Intelligent Domain Simulator (Configure GEMINI_API_KEY for Live Gemini Vision)",
            is_live_ai=False
        )

    @classmethod
    def answer_construction_question(cls, question: str, history: List[Any], image_bytes: Optional[bytes] = None) -> ChatResponse:
        """
        Multimodal construction copilot.
        Answers engineering, code standards (IS, ACI, OSHA, IBC), site operations, and materials QA.
        """
        prompt = f"""
You are ConstructAI Copilot, a senior construction manager and licensed civil engineer.
Answer the following construction inquiry accurately, citing practical site procedures and standard codes (e.g. ACI, IS, OSHA) where relevant:
Inquiry: {question}

Return a valid JSON object:
{{
  "reply": "Comprehensive, technical, professional answer formatted with clear markdown paragraphs, bullets, and steps.",
  "suggested_followups": ["followup question 1", "followup question 2", "followup question 3"],
  "actionable_items": ["action 1", "action 2"],
  "category": "Structural Engineering" | "Concrete Technology" | "Safety & OSHA" | "Project Scheduling" | "Material Estimation"
}}
"""
        raw = cls._call_gemini_api(prompt, image_bytes=image_bytes)
        if raw:
            try:
                data = json.loads(raw)
                return ChatResponse(
                    reply=data.get("reply", "Here is the engineering assessment."),
                    suggested_followups=data.get("suggested_followups", []),
                    actionable_items=data.get("actionable_items", []),
                    category=data.get("category", "Construction Engineering"),
                    model_used=f"Gemini ({settings.GEMINI_MODEL}) Live"
                )
            except Exception:
                pass

        # Domain Knowledge Simulator
        q_lower = question.lower()
        if "curing" in q_lower or "concrete" in q_lower:
            reply = """### Concrete Curing Protocol & Quality Control (IS 456 / ACI 308R)

Proper curing maintains adequate moisture and temperature in fresh concrete to allow continuous hydration of cement, ensuring compressive strength gain and minimizing shrinkage cracking.

#### 1. Minimum Curing Durations
- **Ordinary Portland Cement (OPC)**: Minimum **7 days** of continuous moist curing.
- **Blended Cements (PPC / Slag / Fly Ash mixes)**: Minimum **10 to 14 days** due to slower pozzolanic secondary hydration.
- **Hot Weather Concreting (> 35°C)**: Extend curing by at least **3 additional days** with wet burlap ponding.

#### 2. Approved Methods for Slabs and Columns
- **Horizontal Slabs**: Water ponding using clay bunds (mortar bunds of 50mm height). Keep pond submerged continuously.
- **Vertical Columns & Shear Walls**: Wrap tightly in wet hessian (burlap) cloth and spray water at least 3-4 times daily, or apply an ASTM C309 compliant curing compound immediately upon formwork stripping.

> **Caution**: Avoid thermal shock by spraying cold water onto hot concrete during peak afternoon solar radiation, as surface tensile cracking will result."""
            followups = [
                "What is the required stripping time for beam soffits and props?",
                "How do chemical curing compounds compare to water ponding?",
                "What cube compressive strength is required before de-shuttering columns?"
            ]
            actions = [
                "Verify water ponding bund integrity on newly poured level.",
                "Log curing water temperature twice daily during summer ambient peaks."
            ]
            cat = "Concrete Technology"
        elif "safety" in q_lower or "osha" in q_lower or "ppe" in q_lower:
            reply = """### Site Safety & OSHA PPE Compliance Framework (OSHA 1926)

Every active construction site requires strict adherence to the **Hierarchy of Controls** (Elimination > Substitution > Engineering Controls > Administrative Controls > PPE).

#### Mandatory Core PPE Requirements
1. **Head Protection (OSHA 1926.100)**: ANSI Z89.1 / EN 397 Type I/II helmets with chin straps fastened when working at height.
2. **Eye & Face Protection (OSHA 1926.102)**: ANSI Z87.1 impact-rated goggles during grinding, chipping, and concrete pouring.
3. **High-Visibility Apparel (ANSI/ISEA 107)**: Class 2 or Class 3 fluorescent vests with retroreflective bands for all personnel within active machinery zones.
4. **Fall Arrest Systems (OSHA 1926.501)**: Full-body harness with shock-absorbing lanyard tied off to 5,000-lb rated anchorage points for working heights ≥ 6 feet (1.8m)."""
            followups = [
                "What are the inspection protocols for fall arrest harnesses?",
                "How often must perimeter scaffolding be re-certified?",
                "What are the requirements for electrical GFCI site protection?"
            ]
            actions = [
                "Inspect scaffold tag status (Green/Yellow/Red) before morning shift.",
                "Enforce mandatory harness tie-off at all slab edge formwork zones."
            ]
            cat = "Safety & OSHA"
        else:
            reply = f"""### Engineering Analysis & Practical Site Advisory

Regarding your inquiry: **"{question}"**

In contemporary civil construction and project management practice:
1. **Design & Code Compliance**: Ensure all execution follows relevant building codes (such as ACI 318, IS 456, Eurocode 2, or IBC) alongside site-specific structural drawings approved by the Engineer of Record (EOR).
2. **Execution & Sequencing**: Clearly identify prerequisite operations before commencing high-risk tasks. For example, verify formwork stability and bar-bending schedules prior to concrete ordering.
3. **Quality Verification**: Document concrete batching tickets, slump test results, cube casting dates (7-day and 28-day breaks), and steel tensile mill test certificates.

*Need specific calculations, bill of quantities (BOQ) thumb-rules, or code clauses? Feel free to ask a focused follow-up!*"""
            followups = [
                "Can you generate a detailed step-by-step checklist for this?",
                "What are the potential failure modes or quality risks?",
                "How does this affect the critical path schedule?"
            ]
            actions = [
                "Review project technical specifications and approved method statements.",
                "Coordinate with MEP and structural subcontractors to prevent clashes."
            ]
            cat = "Construction Management"

        return ChatResponse(
            reply=reply,
            suggested_followups=followups,
            actionable_items=actions,
            category=cat,
            model_used="ConstructAI Domain Knowledge Engine (Simulator)"
        )

    @classmethod
    def generate_ai_schedule_proposal(cls, project_type: str, floors: int, duration_months: int) -> List[Dict[str, Any]]:
        """Generates realistic construction phase scheduling proposals."""
        return [
            {
                "phase": "Phase 1: Site Prep & Excavation",
                "title": "Site clearance, perimeter shoring & bulk earthwork excavation",
                "duration_weeks": max(3, int(duration_months * 0.15 * 4)),
                "priority": "High",
                "assigned_role": "Earthwork & Geotechnical Contractor",
                "dependencies": "Permit Approval"
            },
            {
                "phase": "Phase 2: Substructure & Foundation",
                "title": "Raft foundation rebar, waterproofing membrane & mass concrete pour",
                "duration_weeks": max(4, int(duration_months * 0.20 * 4)),
                "priority": "Critical",
                "assigned_role": "Civil & Structural Contractor",
                "dependencies": "Excavation Sign-off"
            },
            {
                "phase": "Phase 3: Superstructure Frame",
                "title": f"RCC column and slab construction across all {floors} levels",
                "duration_weeks": max(6, int(duration_months * 0.35 * 4)),
                "priority": "Critical",
                "assigned_role": "General Contractor / Formwork Specialist",
                "dependencies": "Foundation Curing"
            },
            {
                "phase": "Phase 4: Masonry & External Enclosure",
                "title": "AAC block masonry, external plastering, and façade glazing",
                "duration_weeks": max(4, int(duration_months * 0.15 * 4)),
                "priority": "Medium",
                "assigned_role": "Masonry & Façade Contractor",
                "dependencies": "Frame De-shuttering"
            },
            {
                "phase": "Phase 5: MEP & Finishing",
                "title": "Electrical risers, plumbing lines, flooring, and fire alarm commissioning",
                "duration_weeks": max(4, int(duration_months * 0.15 * 4)),
                "priority": "High",
                "assigned_role": "MEP & Finishing Contractors",
                "dependencies": "Masonry Completion"
            }
        ]
