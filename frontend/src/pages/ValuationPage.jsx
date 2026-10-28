import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Home,
  Check
} from 'lucide-react';
import apiService from '../services/api';

export default function ValuationPage() {
  const [propertyName, setPropertyName] = useState('Metro Heights Executive Residence');
  const [propertyType, setProjectType] = useState('Residential Apartment');
  const [location, setLocation] = useState('Whitefield, Bangalore');
  const [builtUpArea, setBuiltUpArea] = useState(1850);
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(3);
  const [age, setAge] = useState(2.0);
  const [quality, setQuality] = useState('Grade A');
  const [condition, setCondition] = useState('Excellent');
  const [hasParking, setHasParking] = useState(true);
  const [hasLift, setHasLift] = useState(true);
  const [hasClubhouse, setHasClubhouse] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleValuation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        property_name: propertyName,
        property_type: propertyType,
        location: location,
        built_up_area_sqft: parseFloat(builtUpArea),
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        property_age_years: parseFloat(age),
        construction_quality: quality,
        condition: condition,
        has_parking: hasParking,
        has_lift: hasLift,
        has_clubhouse: hasClubhouse
      };
      const res = await apiService.calculateValuation(payload);
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Failed to calculate property valuation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            REAL ESTATE ASSET INTELLIGENCE
          </span>
          <span className="text-xs text-slate-500">• Parametric Micro-Market Indexing</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-7 h-7 text-orange-500" />
          <span>Real Estate & Property Asset Valuation</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Indicative property appraisal combining regional micro-market base rates, structural specifications, construction quality tiers, age depreciation, and amenities premiums.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleValuation} className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-orange-400" />
              <span>Subject Property Attributes</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Property Name / Unit</label>
                <input
                  type="text"
                  required
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Residential Apartment">Residential Apartment</option>
                    <option value="Independent Villa">Independent Villa</option>
                    <option value="Commercial Office Space">Commercial Office Space</option>
                    <option value="Retail Showroom">Retail Showroom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Micro-Market</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Whitefield, Bangalore">Bangalore (Whitefield/IT Corridor)</option>
                    <option value="Bandra West, Mumbai">Mumbai (Bandra/Western Suburbs)</option>
                    <option value="Golf Course Road, Gurgaon">Gurgaon (Golf Course Road)</option>
                    <option value="Gachibowli, Hyderabad">Hyderabad (HITEC City/Gachibowli)</option>
                    <option value="Kalyani Nagar, Pune">Pune (Kalyani Nagar/Viman Nagar)</option>
                    <option value="OMR, Chennai">Chennai (Old Mahabalipuram Road)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Super Built-Up (sqft)</label>
                  <input
                    type="number"
                    required
                    min="200"
                    value={builtUpArea}
                    onChange={(e) => setBuiltUpArea(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="80"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Build Quality</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Grade A">Grade A (Premium RCC)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                    <option value="Grade C">Grade C (Basic)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="New">New / Undelivered</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Renovation">Needs Renovation</option>
                  </select>
                </div>
              </div>

              {/* Amenities Checkboxes */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">Included Infrastructure & Amenities</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <label className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasParking}
                      onChange={(e) => setHasParking(e.target.checked)}
                      className="accent-orange-500"
                    />
                    <span className="text-slate-300 text-[11px]">Covered Parking</span>
                  </label>
                  <label className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasLift}
                      onChange={(e) => setHasLift(e.target.checked)}
                      className="accent-orange-500"
                    />
                    <span className="text-slate-300 text-[11px]">High-Speed Lifts</span>
                  </label>
                  <label className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasClubhouse}
                      onChange={(e) => setHasClubhouse(e.target.checked)}
                      className="accent-orange-500"
                    />
                    <span className="text-slate-300 text-[11px]">Clubhouse & Pool</span>
                  </label>
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
              <span>{loading ? 'Evaluating Micro-Market Parameters...' : 'Compute Indicative Valuation'}</span>
            </button>
          </form>

          {/* Legal / Engineering Scope */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Info className="w-4 h-4 text-orange-400" />
              <span>Valuation Disclaimer</span>
            </div>
            <p className="leading-relaxed">
              This indicative valuation is generated by parametric statistical models using published regional indices. 
              It does not constitute a statutory bank mortgage appraisal or certified property surveyor valuation.
            </p>
          </div>
        </div>

        {/* Right Column: Valuation Results & Factor Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="space-y-5">
              {/* Grand Total Valuation Card */}
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Estimated Market Valuation Mid-Point
                    </span>
                    <div className="text-3xl font-black text-white mt-1 tracking-tight">
                      ₹{result.estimated_price_mid.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-emerald-400 font-mono font-semibold mt-1">
                      ₹{result.price_per_sqft_mid.toLocaleString('en-IN')} / sq. ft.
                    </div>
                  </div>

                  <div className="bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                    <span className="text-slate-500 block text-[10px]">INDICATIVE RANGE (±8%)</span>
                    <div className="text-slate-200 font-bold mt-0.5">
                      ₹{(result.estimated_price_min / 100000).toFixed(2)} L — ₹{(result.estimated_price_max / 100000).toFixed(2)} L
                    </div>
                  </div>
                </div>

                {/* Main Contributing Factors */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Key Valuation Drivers & Weightages
                  </h4>
                  <div className="space-y-2">
                    {result.valuation_factors?.map((f, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-200 flex items-center gap-2">
                            <span>{f.factor_name}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              f.impact === 'Positive' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              f.impact === 'Negative' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {f.impact}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{f.rationale}</p>
                        </div>
                        <span className="font-mono font-bold text-orange-400 shrink-0">
                          {f.weight_pct}% Weight
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Regional Comparable Properties Benchmark */}
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-orange-400" />
                    <span>Regional Benchmark Comparables</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Transparent Benchmark Data
                  </span>
                </div>

                <div className="space-y-2.5">
                  {result.comparable_benchmark_summary?.map((comp, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{comp.property_title}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {comp.locality} • {comp.area_sqft} sqft • Age: {comp.age_years} yrs
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-200 block">
                          ₹{comp.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-orange-400 font-mono">
                          ₹{comp.price_per_sqft}/sqft
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assumptions & Legal Boundaries */}
              <div className="glass-panel rounded-xl p-4 text-xs space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Appraisal Scope & Title Assumptions</span>
                </h4>
                <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                  {result.assumptions_limitations?.map((asmp, i) => (
                    <li key={i}>{asmp}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
                <Building2 className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-base font-bold text-white">No Valuation Computed</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fill in the property location, built-up area, and specifications on the left to compute indicative valuation range.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
