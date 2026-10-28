import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Sun,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Info
} from 'lucide-react';
import apiService from '../services/api';

const SUPPORTED_CITIES = [
  "Bangalore, Karnataka",
  "Mumbai, Maharashtra",
  "Delhi, NCR",
  "Gurgaon, Haryana",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Dubai, UAE",
  "London, UK",
  "Singapore"
];

export default function WeatherAdvisoryPage() {
  const { activeProject } = useOutletContext();
  const [selectedCity, setSelectedCity] = useState(activeProject?.location || "Bangalore, Karnataka");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = (city) => {
    setLoading(true);
    apiService.getWeatherAdvisory(city)
      .then(res => {
        setWeatherData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              METEOROLOGICAL SITE RISK ENGINE
            </span>
            <span className="text-xs text-slate-500">• Standards-Based Civil Operations Safety</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CloudSun className="w-7 h-7 text-orange-500" />
            <span>Weather-Aware Construction Advisory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live evaluation of atmospheric conditions against civil engineering thresholds (OSHA crane wind limits, rain risk on concrete, ACI 305R hot weather concreting).
          </p>
        </div>

        {/* City Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
          >
            {SUPPORTED_CITIES.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => fetchWeather(selectedCity)}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh weather"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {weatherData && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Ambient Temp</span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {weatherData.current.temperature_c}°C
                </div>
                <span className="text-[10px] text-slate-500">Feels like {weatherData.current.feels_like_c}°C</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <Thermometer className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Wind Velocity</span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {weatherData.current.wind_speed_kmh} <span className="text-sm font-normal text-slate-400">km/h</span>
                </div>
                <span className="text-[10px] text-slate-500">Max permissible lift: 38 km/h</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Wind className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Rain Probability</span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {weatherData.current.precipitation_prob_pct}%
                </div>
                <span className="text-[10px] text-slate-500">Surface wash risk threshold: 50%</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Solar UV Index</span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {weatherData.current.uv_index}
                </div>
                <span className="text-[10px] text-slate-500">Worker hydration protocol</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Meteorological Data Source Pill */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${weatherData.is_live_data ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>Provider: <strong>{weatherData.provider}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Updated: {weatherData.timestamp}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {weatherData.is_live_data ? 'LIVE SATELLITE / RADAR DATA' : 'OFFLINE BENCHMARK'}
            </span>
          </div>

          {/* Critical Weather Alerts */}
          {weatherData.alerts?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>Active Environmental Hazards & Standards Alerts</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weatherData.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border space-y-2.5 ${
                      alert.severity === 'Warning'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{alert.headline}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-black/30">
                        {alert.category}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{alert.description}</p>
                    <div className="text-[11px] font-mono pt-1 border-t border-white/10 opacity-80">
                      Standard: <strong>{alert.engineering_standard}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 text-xs font-semibold">
                      Required Action: {alert.recommended_action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Status Matrix (Crane, Concrete, Waterproofing, Labor) */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Site Activity Feasibility Matrix</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weatherData.activity_impacts?.map((act, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white block text-sm">{act.activity_name}</span>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{act.rationale}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono shrink-0 border ${
                    act.is_safe ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {act.status_label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Concrete Curing Advisory Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-orange-400 text-xs uppercase font-mono">
              <Info className="w-4 h-4" />
              <span>ACI 305R / IS 456 Concrete Curing Guideline</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {weatherData.concrete_curing_recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
