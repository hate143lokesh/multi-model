import React, { useState, useEffect } from 'react';
import { HardHat, Bell, ShieldCheck, Cpu, CloudSun, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

export default function Navbar({ activeProject, onSelectProject, projects = [] }) {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const userStr = localStorage.getItem('constructai_user');
  const user = userStr ? JSON.parse(userStr) : { full_name: 'Chief Site Engineer', role: 'Project Manager' };

  useEffect(() => {
    apiService.getHealth()
      .then(res => setHealth(res.data))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('constructai_token');
    localStorage.removeItem('constructai_user');
    navigate('/login');
  };

  const isLive = health?.ai_engine?.has_gemini_key;

  return (
    <header className="h-16 bg-[#0E1526] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Project Selector */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-orange-400 bg-clip-text text-transparent">
              Construct<span className="text-orange-500">AI</span>
            </span>
            <span className="hidden md:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
              v1.0 PLATFORM
            </span>
          </div>
        </div>

        {/* Project Selector Dropdown */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800">
          <span className="text-xs font-medium text-slate-400">Project:</span>
          <select 
            value={activeProject?.id || ''}
            onChange={(e) => {
              const selected = projects.find(p => p.id === parseInt(e.target.value));
              if (selected && onSelectProject) onSelectProject(selected);
            }}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-orange-500"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Controls: AI Engine Status, Alerts & User Menu */}
      <div className="flex items-center gap-4">
        {/* AI Engine Status Pill */}
        <div 
          onClick={() => navigate('/settings')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
          title="Click to view AI Configuration & Status"
        >
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span className={isLive ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
            {isLive ? 'Gemini 2.5 Live' : 'Simulator Mode'}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Site Alerts</span>
                <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">2 Active</span>
              </div>
              <div className="space-y-3 mt-3 text-xs">
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <div className="font-semibold text-rose-200">Perimeter Guardrail Alert</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Floor 6 northern cantilever edge requires toe-boards.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <div className="font-semibold text-amber-200">Hot Weather Concreting</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Ambient temp &gt; 35°C forecast at 13:00 hours. ACI 305 precautions advised.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-white">{user.full_name}</div>
            <div className="text-[11px] text-orange-400 font-mono">{user.role}</div>
          </div>
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
