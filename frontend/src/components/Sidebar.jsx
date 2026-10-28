import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  SearchCheck,
  Calculator,
  CalendarDays,
  Building2,
  Bot,
  CloudSun,
  GraduationCap,
  FileSpreadsheet,
  Settings,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Safety Analyzer', path: '/safety', icon: ShieldAlert, badge: 'Multimodal' },
  { name: 'Crack & Structural Triage', path: '/cracks', icon: SearchCheck, badge: 'Vision' },
  { name: 'Cost & Material Estimator', path: '/estimation', icon: Calculator },
  { name: 'Planning & Gantt Schedule', path: '/planning', icon: CalendarDays },
  { name: 'Real Estate Valuation', path: '/valuation', icon: Building2 },
  { name: 'Daily Site Assistant', path: '/assistant', icon: Bot },
  { name: 'Weather Advisory', path: '/weather', icon: CloudSun },
  { name: 'Knowledge Assistant', path: '/knowledge', icon: GraduationCap },
  { name: 'Reports & Analytics', path: '/reports', icon: FileSpreadsheet },
  { name: 'Settings & AI Status', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0A0E17] border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      <div className="py-4 overflow-y-auto px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Intelligence Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.badge ? (
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-semibold">
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 text-white font-semibold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Construction AI Core
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          Multimodal vision models active. Automated safety triage & scheduling engine online.
        </p>
      </div>
    </aside>
  );
}
