import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calculator,
  DollarSign,
  Layers,
  Settings2,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import apiService from '../services/api';

const PIE_COLORS = ['#F97316', '#38BDF8', '#F59E0B', '#10B981'];

export default function CostEstimatorPage() {
  const { activeProject } = useOutletContext();
  const [projectName, setProjectName] = useState(activeProject?.name || 'Metropolitan Commercial Tower');
  const [projectType, setProjectType] = useState('Commercial');
  const [location, setLocation] = useState('Bangalore Urban Metro');
  const [builtUpArea, setBuiltUpArea] = useState(25000);
  const [floors, setFloors] = useState(5);
  const [qualityTier, setQualityTier] = useState('Standard');
  const [contingencyPct, setContingencyPct] = useState(5.0);

  // Editable Unit Rates
  const [showRates, setShowRates] = useState(false);
  const [rates, setRates] = useState({
    cement_per_bag: 380.0,
    sand_per_ton: 1200.0,
    aggregate_per_ton: 950.0,
    steel_per_kg: 68.0,
    bricks_per_piece: 9.5,
    labor_rate_sqft: 320.0,
    equipment_rate_sqft: 90.0
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        project_name: projectName,
        project_type: projectType,
        location: location,
        built_up_area: parseFloat(builtUpArea),
        floors: parseInt(floors),
        quality_tier: qualityTier,
        custom_rates: rates,
        contingency_pct: parseFloat(contingencyPct)
      };

      const res = await apiService.calculateEstimation(payload);
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Failed to compute estimation.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { name: 'Materials', value: result.breakdown.total_material_cost },
    { name: 'Labor & Subcontractors', value: result.breakdown.total_labor_cost },
    { name: 'Equipment & Formwork', value: result.breakdown.total_equipment_cost },
    { name: 'Contingency Reserve', value: result.breakdown.contingency_cost },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            QUANTITY SURVEYING & FINANCIAL MODELING
          </span>
          <span className="text-xs text-slate-500">• Parametric Civil Engineering Calculations</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Calculator className="w-7 h-7 text-orange-500" />
          <span>Construction Cost & Material Estimator</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Deterministic quantity surveying engine based on empirical structural thumb-rules (IS 456 / CPWD standards). 
          Configurable unit rates, transparent calculations, and zero fabricated numbers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Config (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleCalculate} className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Project Specifications</span>
              <button
                type="button"
                onClick={() => setShowRates(!showRates)}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>{showRates ? 'Hide Unit Rates' : 'Edit Unit Rates'}</span>
              </button>
            </h3>

            {/* Editable Rates Panel */}
            {showRates && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-orange-400 block font-mono">
                  BENCHMARK MATERIAL & LABOR RATES (INR / ₹)
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Cement (₹/bag)</label>
                    <input
                      type="number"
                      value={rates.cement_per_bag}
                      onChange={(e) => setRates({ ...rates, cement_per_bag: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Steel Rebar (₹/kg)</label>
                    <input
                      type="number"
                      value={rates.steel_per_kg}
                      onChange={(e) => setRates({ ...rates, steel_per_kg: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">M-Sand (₹/ton)</label>
                    <input
                      type="number"
                      value={rates.sand_per_ton}
                      onChange={(e) => setRates({ ...rates, sand_per_ton: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Aggregate (₹/ton)</label>
                    <input
                      type="number"
                      value={rates.aggregate_per_ton}
                      onChange={(e) => setRates({ ...rates, aggregate_per_ton: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Labor (₹/sqft)</label>
                    <input
                      type="number"
                      value={rates.labor_rate_sqft}
                      onChange={(e) => setRates({ ...rates, labor_rate_sqft: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Equipment (₹/sqft)</label>
                    <input
                      type="number"
                      value={rates.equipment_rate_sqft}
                      onChange={(e) => setRates({ ...rates, equipment_rate_sqft: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Type</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Residential">Residential Villa/Apts</option>
                    <option value="Commercial">Commercial Office</option>
                    <option value="Industrial">Industrial Warehouse</option>
                    <option value="Institutional">Institutional / Hospital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quality Tier</label>
                  <select
                    value={qualityTier}
                    onChange={(e) => setQualityTier(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Economy">Economy (0.85x)</option>
                    <option value="Standard">Standard (1.00x)</option>
                    <option value="Premium">Premium (1.35x)</option>
                    <option value="Luxury">Luxury (1.75x)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Built-Up Area (sq. ft.)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={builtUpArea}
                    onChange={(e) => setBuiltUpArea(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Floors</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location / City</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contingency Reserve</label>
                  <select
                    value={contingencyPct}
                    onChange={(e) => setContingencyPct(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="3.0">3% (Low Risk)</option>
                    <option value="5.0">5% (Standard)</option>
                    <option value="8.0">8% (Moderate)</option>
                    <option value="12.0">12% (High Volatility)</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Evaluating Material Quantities...' : 'Calculate Transparent Bill of Quantities'}</span>
            </button>
          </form>

          {/* Legal / Engineering Scope */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Info className="w-4 h-4 text-orange-400" />
              <span>Estimation Methodology</span>
            </div>
            <p className="leading-relaxed">
              Formulas utilize standardized empirical consumption coefficients (Cement: 0.40 bags/sqft, Steel: 4.2 kg/sqft, Sand: 0.082 t/sqft). 
              Final construction contracts require structural bar-bending schedules (BBS) and geotechnical soil reports.
            </p>
          </div>
        </div>

        {/* Right Column: Calculated Quantities & Financial Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="space-y-5">
              {/* Grand Total Financial Summary */}
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Total Estimated Project Cost
                    </span>
                    <div className="text-3xl font-black text-white mt-1 tracking-tight">
                      ₹{result.breakdown.total_estimated_cost.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-orange-400 font-mono font-semibold mt-1">
                      ₹{result.breakdown.cost_per_sqft.toLocaleString('en-IN')} per sq. ft. built-up
                    </div>
                  </div>

                  <div className="bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                    <span className="text-slate-500 block text-[10px]">UNCERTAINTY ENVELOPE (±8%)</span>
                    <div className="text-slate-200 font-bold mt-0.5">
                      ₹{(result.breakdown.uncertainty_range_min / 10000000).toFixed(2)} Cr — ₹{(result.breakdown.uncertainty_range_max / 10000000).toFixed(2)} Cr
                    </div>
                  </div>
                </div>

                {/* Donut Chart and Cost Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-3 border-t border-slate-800">
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={65}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                          contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 text-xs">
                    {chartData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                          <span className="text-slate-300">{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-white">
                          ₹{item.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Material Requirements Table */}
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-400" />
                    <span>Material Quantity Takeoff</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Concrete Volume: ~{result.concrete_volume_cum} m³
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3 rounded-l-lg">Material</th>
                        <th className="py-2.5 px-3">Est. Quantity</th>
                        <th className="py-2.5 px-3">Unit Rate</th>
                        <th className="py-2.5 px-3 text-right rounded-r-lg">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {result.materials?.map((mat, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="py-3 px-3">
                            <span className="font-bold text-white block">{mat.material}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{mat.estimation_formula}</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-200">
                            {mat.quantity.toLocaleString('en-IN')} {mat.unit}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400">
                            ₹{mat.unit_rate}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-right text-orange-400">
                            ₹{mat.total_amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assumptions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel rounded-xl p-4 text-xs space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Key Modeling Assumptions</span>
                  </h4>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                    {result.assumptions?.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass-panel rounded-xl p-4 text-xs space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cost Exclusions</span>
                  </h4>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                    {result.exclusions?.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
                <Calculator className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-base font-bold text-white">No Estimate Generated</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fill in the built-up area and quality tier on the left, then click <strong>"Calculate Transparent Bill of Quantities"</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
