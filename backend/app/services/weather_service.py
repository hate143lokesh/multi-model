import datetime
import requests
from typing import Dict, Any, List
from app.schemas.weather import (
    WeatherAdvisoryResponse, WeatherCondition, WeatherAlert, ConstructionImpactItem
)

# Known regional coordinates for rapid resolution
CITY_COORDINATES = {
    "bangalore": (12.9716, 77.5946),
    "mumbai": (19.0760, 72.8777),
    "delhi": (28.6139, 77.2090),
    "gurgaon": (28.4595, 77.0266),
    "hyderabad": (17.3850, 78.4867),
    "chennai": (13.0827, 80.2707),
    "pune": (18.5204, 73.8567),
    "kolkata": (22.5726, 88.3639),
    "new york": (40.7128, -74.0060),
    "london": (51.5074, -0.1278),
    "dubai": (25.2048, 55.2708),
    "singapore": (1.3521, 103.8198),
}

class WeatherService:
    @staticmethod
    def get_weather_advisory(location: str = "Bangalore, Karnataka") -> WeatherAdvisoryResponse:
        loc_key = location.lower().split(",")[0].strip()
        lat, lon = CITY_COORDINATES.get(loc_key, (12.9716, 77.5946))
        
        is_live = False
        provider = "Open-Meteo Weather API"
        now_iso = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        temp = 29.5
        feels_like = 31.0
        humidity = 58.0
        wind_speed = 18.5
        precip_prob = 15.0
        uv_index = 6.2
        condition = "Partly Cloudy"

        # Attempt live API call to Open-Meteo (free, zero-config)
        try:
            url = (
                f"https://api.open-meteo.com/v1/forecast?"
                f"latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,"
                f"apparent_temperature,precipitation,wind_speed_10m&hourly=precipitation_probability,uv_index"
            )
            resp = requests.get(url, timeout=4.0)
            if resp.status_code == 200:
                data = resp.json()
                current_data = data.get("current", {})
                temp = float(current_data.get("temperature_2m", temp))
                feels_like = float(current_data.get("apparent_temperature", feels_like))
                humidity = float(current_data.get("relative_humidity_2m", humidity))
                wind_speed = float(current_data.get("wind_speed_10m", wind_speed))
                
                hourly = data.get("hourly", {})
                probs = hourly.get("precipitation_probability", [precip_prob])
                precip_prob = float(probs[0] if probs else 15.0)
                
                uvs = hourly.get("uv_index", [uv_index])
                uv_index = float(uvs[0] if uvs else 5.0)
                
                is_live = True
                condition = "Clear / Fair" if precip_prob < 20 else "Overcast with rain risk"
        except Exception:
            is_live = False
            provider = "ConstructAI Standardized Meteorological Benchmark (Offline Mode)"

        # Engineering rules evaluation
        alerts: List[WeatherAlert] = []
        impacts: List[ConstructionImpactItem] = []

        # 1. High Wind Check (OSHA 1926.1431 crane limit is generally 38 km/h or manufacturer rating)
        if wind_speed >= 38.0:
            alerts.append(WeatherAlert(
                severity="Warning",
                category="Wind",
                headline="High Wind Velocity: Crane Hoisting Prohibition",
                description=f"Recorded wind speed is {wind_speed:.1f} km/h, exceeding the standard 38 km/h safe lift envelope.",
                engineering_standard="OSHA 1926.1431 / ASME B30.5 Mobile and Tower Crane Safety",
                recommended_action="Immediately ground tower crane jib hoists; secure loose formwork panels and scaffolding."
            ))
            impacts.append(ConstructionImpactItem(
                activity_name="Tower Crane Hoisting & Heavy Rigging",
                is_safe=False,
                status_label="Postpone / Prohibited",
                rationale="Wind speeds exceed maximum permissible operating limit."
            ))
        elif wind_speed >= 25.0:
            alerts.append(WeatherAlert(
                severity="Advisory",
                category="Wind",
                headline="Moderate Gusts: Exterior Scaffolding Caution",
                description=f"Wind speed {wind_speed:.1f} km/h. High-elevation netting and loose materials can experience sail effect.",
                engineering_standard="OSHA 1926.451 Scaffolding Wind Precautions",
                recommended_action="Tie off taglines on hoisted loads and inspect perimeter netting anchorages."
            ))
            impacts.append(ConstructionImpactItem(
                activity_name="Tower Crane Hoisting & Heavy Rigging",
                is_safe=True,
                status_label="Proceed with Precautions",
                rationale="Moderate gusts; use taglines and reduce crane slew speed."
            ))
        else:
            impacts.append(ConstructionImpactItem(
                activity_name="Tower Crane Hoisting & Heavy Rigging",
                is_safe=True,
                status_label="Safe to Proceed",
                rationale="Wind speeds are well within the permissible operating envelope."
            ))

        # 2. Precipitation / Rain Check
        if precip_prob >= 50.0:
            alerts.append(WeatherAlert(
                severity="Warning",
                category="Rain",
                headline="Elevated Rain Risk: Concrete & Waterproofing Vulnerability",
                description=f"Precipitation probability is {precip_prob:.0f}%. Uncured concrete surfaces risk surface washing and water-cement ratio alteration.",
                engineering_standard="IS 456:2000 / ACI 304R Concrete Placement Guide",
                recommended_action="Postpone outdoor slab casting or prepare tarpaulins/plastic sheeting covers immediately."
            ))
            impacts.append(ConstructionImpactItem(
                activity_name="Exterior Concrete Slab Pouring",
                is_safe=False,
                status_label="Postpone / Reschedule",
                rationale="High rain probability can wash out cement paste and cause plastic shrinkage cracks."
            ))
            impacts.append(ConstructionImpactItem(
                activity_name="External Façade Painting & Waterproofing",
                is_safe=False,
                status_label="Postpone / Reschedule",
                rationale="High ambient humidity and moisture interfere with primer adhesion."
            ))
        else:
            impacts.append(ConstructionImpactItem(
                activity_name="Exterior Concrete Slab Pouring",
                is_safe=True,
                status_label="Safe to Proceed",
                rationale="Low precipitation probability; have standby poly-sheeting available."
            ))
            impacts.append(ConstructionImpactItem(
                activity_name="External Façade Painting & Waterproofing",
                is_safe=True,
                status_label="Safe to Proceed",
                rationale="Surface moisture levels acceptable for application."
            ))

        # 3. Heat Stress & Concrete Curing (ACI 305R Hot Weather Concreting)
        curing_advice = "Standard water ponding or chemical membrane curing for 7-14 days."
        if temp >= 35.0:
            alerts.append(WeatherAlert(
                severity="Warning",
                category="Extreme Heat",
                headline="High Ambient Temperature: Rapid Moisture Loss Risk",
                description=f"Ambient temperature is {temp:.1f}°C. Severe risk of thermal cracking and worker heat exhaustion.",
                engineering_standard="ACI 305R-20 Hot Weather Concreting / OSHA Heat Illness Prevention",
                recommended_action="Use chilled mixing water, conduct evening/night pours, enforce mandatory 15-min hydration breaks every 2 hours."
            ))
            curing_advice = "CRITICAL: Temperature exceeds 35°C. Apply wet burlap curing immediately upon initial set; avoid direct thermal shock."
            impacts.append(ConstructionImpactItem(
                activity_name="Heavy Manual Labor & Rebar Bending",
                is_safe=True,
                status_label="Proceed with Precautions",
                rationale="Enforce shaded rest rotations and supply electrolyte hydration stations."
            ))
        else:
            impacts.append(ConstructionImpactItem(
                activity_name="Heavy Manual Labor & Rebar Bending",
                is_safe=True,
                status_label="Safe to Proceed",
                rationale="Ambient thermal conditions are favorable for productive site work."
            ))

        return WeatherAdvisoryResponse(
            location=location,
            latitude=lat,
            longitude=lon,
            timestamp=now_iso,
            provider=provider,
            is_live_data=is_live,
            current=WeatherCondition(
                temperature_c=temp,
                feels_like_c=feels_like,
                humidity_pct=humidity,
                wind_speed_kmh=wind_speed,
                condition_text=condition,
                precipitation_prob_pct=precip_prob,
                uv_index=uv_index
            ),
            alerts=alerts,
            activity_impacts=impacts,
            concrete_curing_recommendation=curing_advice
        )
