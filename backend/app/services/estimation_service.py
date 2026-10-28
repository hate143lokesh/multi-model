from typing import List
from app.schemas.estimation import (
    EstimationInput, EstimationOutput, CostBreakdown,
    MaterialQuantityItem, MaterialRateConfig
)

QUALITY_MULTIPLIERS = {
    "Economy": 0.85,
    "Standard": 1.00,
    "Premium": 1.35,
    "Luxury": 1.75
}

class EstimationService:
    @staticmethod
    def calculate_estimate(data: EstimationInput) -> EstimationOutput:
        rates = data.custom_rates or MaterialRateConfig()
        area = data.built_up_area
        mult = QUALITY_MULTIPLIERS.get(data.quality_tier, 1.0)
        floors_factor = 1.0 + (data.floors - 1) * 0.025  # Slight vertical elevation cost factor

        # 1. Quantities based on empirical civil engineering thumb-rules
        cement_bags = round(area * 0.40 * mult, 1)
        sand_tons = round(area * 0.082 * mult, 2)
        aggregate_tons = round(area * 0.065 * mult, 2)
        steel_kg = round(area * 4.20 * mult * floors_factor, 1)
        bricks_count = round(area * 18.5, 0)
        concrete_cum = round(area * 0.038 * mult, 2)

        # 2. Material Costs
        cement_cost = cement_bags * rates.cement_per_bag
        sand_cost = sand_tons * rates.sand_per_ton
        aggregate_cost = aggregate_tons * rates.aggregate_per_ton
        steel_cost = steel_kg * rates.steel_per_kg
        bricks_cost = bricks_count * rates.bricks_per_piece

        materials: List[MaterialQuantityItem] = [
            MaterialQuantityItem(
                material="Portland Pozzolana / OPC Cement (50kg bags)",
                quantity=cement_bags,
                unit="Bags",
                unit_rate=rates.cement_per_bag,
                total_amount=round(cement_cost, 2),
                estimation_formula="Built-up Area × 0.40 bags/sqft × Quality Multiplier"
            ),
            MaterialQuantityItem(
                material="TMT High-Strength Steel Rebar (Fe 500D)",
                quantity=steel_kg,
                unit="kg",
                unit_rate=rates.steel_per_kg,
                total_amount=round(steel_cost, 2),
                estimation_formula="Built-up Area × 4.2 kg/sqft × Structural Height Factor"
            ),
            MaterialQuantityItem(
                material="Manufactured M-Sand / River Sand",
                quantity=sand_tons,
                unit="Metric Tons",
                unit_rate=rates.sand_per_ton,
                total_amount=round(sand_cost, 2),
                estimation_formula="Built-up Area × 0.082 tons/sqft"
            ),
            MaterialQuantityItem(
                material="Coarse Granite Aggregate (20mm & 10mm)",
                quantity=aggregate_tons,
                unit="Metric Tons",
                unit_rate=rates.aggregate_per_ton,
                total_amount=round(aggregate_cost, 2),
                estimation_formula="Built-up Area × 0.065 tons/sqft"
            ),
            MaterialQuantityItem(
                material="Modular Clay Bricks / AAC Lightweight Blocks",
                quantity=bricks_count,
                unit="Units",
                unit_rate=rates.bricks_per_piece,
                total_amount=round(bricks_cost, 2),
                estimation_formula="Built-up Area × 18.5 modular masonry units/sqft"
            )
        ]

        total_material_cost = round(sum(item.total_amount for item in materials), 2)
        total_labor_cost = round(area * rates.labor_rate_sqft * mult, 2)
        total_equipment_cost = round(area * rates.equipment_rate_sqft, 2)
        
        subtotal = total_material_cost + total_labor_cost + total_equipment_cost
        contingency_cost = round(subtotal * (data.contingency_pct / 100.0), 2)
        total_estimated_cost = round(subtotal + contingency_cost, 2)
        cost_per_sqft = round(total_estimated_cost / area, 2)

        uncertainty_pct = 0.08 if data.quality_tier == "Standard" else 0.12
        range_min = round(total_estimated_cost * (1.0 - uncertainty_pct), 2)
        range_max = round(total_estimated_cost * (1.0 + uncertainty_pct), 2)

        breakdown = CostBreakdown(
            total_material_cost=total_material_cost,
            total_labor_cost=total_labor_cost,
            total_equipment_cost=total_equipment_cost,
            contingency_cost=contingency_cost,
            total_estimated_cost=total_estimated_cost,
            cost_per_sqft=cost_per_sqft,
            uncertainty_range_min=range_min,
            uncertainty_range_max=range_max
        )

        assumptions = [
            f"Quality Tier: {data.quality_tier} (Multiplier: {mult}x baseline).",
            f"Structural system assumed: Reinforced Cement Concrete (RCC) framed structure with slab thickness 125mm-150mm.",
            f"Soil bearing capacity assumed normal (> 150 kN/m²); deep pile foundations may incur extra substructure cost.",
            f"Contingency allowance applied: {data.contingency_pct}% for unforeseen market price volatility and weather stoppages."
        ]

        exclusions = [
            "Land acquisition and statutory municipal building permit approval fees.",
            "Architectural/structural consulting fee (typically 3-5% of civil project cost).",
            "Specialized HVAC central air conditioning equipment and luxury interior designer cabinetry.",
            "Transformer substation, external HT power line connection, and municipal sewer connection deposits."
        ]

        return EstimationOutput(
            project_name=data.project_name,
            project_type=data.project_type,
            location=data.location,
            built_up_area_sqft=area,
            floors=data.floors,
            quality_tier=data.quality_tier,
            materials=materials,
            concrete_volume_cum=concrete_cum,
            breakdown=breakdown,
            assumptions=assumptions,
            exclusions=exclusions
        )
