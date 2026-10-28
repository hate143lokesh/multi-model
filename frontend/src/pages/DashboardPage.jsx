import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldAlert,
  SearchCheck,
  CalendarDays,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  CloudSun,
  ArrowUpRight,
  Sparkles,
  Clock,
  Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import MetricCard from '../components/MetricCard';
import apiService from '../services/api';

const COLORS = ['#EF4444', '#F59E0B', '#10B981'];

export default function DashboardPage() {
  const { activeProject, projects } = useOutletContext();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getExecutiveSummary().catch(() => ({ data: null })),
      apiService.getWeatherAdvisory(activeProject?.location || 'Bangalore, Karnataka').catch(() => ({ data: null }))
    ]).then(([sumRes, weatherRes]) => {
      if (sumRes.data) setSummary(sumRes.data);
      if (weatherRes.data) setWeather(weatherRes.data);
      setLoading(false);
    });
  }, [activeProject]);

  const kpis = summary?.kpis || {
    total_active_projects: projects.length || 2,
    overall_completion_pct: 45.8,
    total_portfolio_budget: 387000000,
    total_budget_spent: 201000000,
    budget_utilization_pct: 51.9,
    total_safety_audits: 14,
    total_crack_inspections: 8,
    pending_tasks: 7,
    completed_tasks: 12
  };

  const safetyDist = summary?.safety_distribution || [
    { severity: 'Critical & High', count: 3, color: '#EF4444' },
    { severity: 'Moderate', count: 6, color: '#F59E0B' },
    { severity: 'Low / Safe', count: 5, color: '#10B981' }
  ];

  const budgetData = [
    { month: 'Oct 24', spent: 18, planned: 20 },
    { month: 'Nov 24', spent: 34, planned: 38 },
    { month: 'Dec 24', spent: 58, planned: 60 },
    { month: 'Jan 25', spent: 85, planned: 90 },
    { month: 'Feb 25', spent: 112, planned: 115 },
    { month: 'Mar 25', spent: 138, planned: 145 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              OPERATIONAL INTELLIGENCE DASHBOARD
            </span>
            <span className="text-xs text-slate-500">• Real-Time Synchronized</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Construction Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Active Project: <strong className="text-slate-200">{activeProject?.name || 'Metro Heights Tech Park'}</strong> ({activeProject?.code || 'PRJ-METRO-02'}). 
            Multimodal safety scans and structural integrity triage running continuously.
          </p>
        </div>

        {/* Quick Launch Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/safety')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-lg shadow-orange-500/20"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>New Safety Scan</span>
          </button>
          <button
            onClick={() => navigate('/cracks')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            <SearchCheck className="w-4 h-4" />
            <span>Crack Triage</span>
          </button>
        </div>
      </div>

      {/* Top Key Performance Indicators (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Projects"
          value={kpis.total_active_projects}
          subtitle="Portfolio civil operations"
          icon={Building2}
          badge="Live"
          accentColor="from-blue-500 to-cyan-500"
        />
        <MetricCard
          title="Overall Progress"
          value={`${kpis.overall_completion_pct}%`}
          subtitle="Structural frame & MEP phase"
          icon={TrendingUp}
          badge="+4.2% this month"
          accentColor="from-emerald-500 to-teal-500"
        />
        <MetricCard
          title="Total Budget Spent"
          value={`₹${(kpis.total_budget_spent / 10000000).toFixed(2)} Cr`}
          subtitle={`Utilized ${kpis.budget_utilization_pct}% of total`}
          icon={DollarSign}
          badge="On Track"
          accentColor="from-amber-500 to-orange-500"
        />
        <MetricCard
          title="Safety Score"
          value="84 / 100"
          subtitle={`${kpis.total_safety_audits} audits logged`}
          icon={ShieldAlert}
          badge="OSHA Compliant"
          badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          accentColor="from-rose-500 to-orange-500"
        />
      </div>

      {/* Weather Advisory Summary & Quick Alert */}
      {weather && (
        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-amber-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Site Meteorological Status: {weather.location}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {weather.current.temperature_c}°C • Wind {weather.current.wind_speed_kmh} km/h
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {weather.concrete_curing_recommendation}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/weather')}
            className="text-orange-400 hover:text-orange-300 font-semibold shrink-0 flex items-center gap-1"
          >
            <span>Full Meteorological Advisory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget & Spend Progress Chart */}
        <div className="glass-panel rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Cumulative Capital Expenditure (₹ Crores)</h3>
              <p className="text-xs text-slate-400">Planned allocation vs actual contractor disbursements</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
              FY 2024-25
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={budgetData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="spent" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" name="Actual Spend (Cr)" />
                <Area type="monotone" dataKey="planned" stroke="#38BDF8" strokeWidth={2} strokeDasharray="4 4" fill="none" name="Planned Baseline (Cr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Safety Risk Severity Distribution */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Safety Hazard Distribution</h3>
              <p className="text-xs text-slate-400">Classified observations</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-400">
              Active Triage
            </span>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safetyDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {safetyDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2 pt-2 border-t border-slate-800 text-xs">
            {safetyDist.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.severity}</span>
                </div>
                <span className="font-mono font-bold text-white">{item.count} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Site Inspections */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <span>Recent Multimodal Audits</span>
            </h3>
            <button 
              onClick={() => navigate('/safety')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {summary?.recent_safety_logs?.length > 0 ? (
              summary.recent_safety_logs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{log.site_area}</div>
                    <div className="text-[11px] text-slate-500">{log.date}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      log.overall_risk === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      log.overall_risk === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {log.overall_risk} Risk
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">Score: {log.safety_score}%</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No recent safety logs. Run a new inspection to populate live data.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Construction Milestones */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-orange-400" />
              <span>Key Schedule Milestones</span>
            </h3>
            <button 
              onClick={() => navigate('/planning')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
            >
              Gantt View
            </button>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">Level 7 PT Slab Concrete Casting</span>
                <span className="text-[11px] text-slate-500">M40 Grade • 180 m³ Pour Volume</span>
              </div>
              <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold">
                Target: Next 48h
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">Tower Crane Anchor Re-Certification</span>
                <span className="text-[11px] text-slate-500">Third-Party Inspector Sign-off</span>
              </div>
              <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold">
                Due: 5 Days
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">MEP Vertical Ducting Riser Handover</span>
                <span className="text-[11px] text-slate-500">Floors 1 to 4 Fire Sprinkler Mains</span>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
                Completed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
