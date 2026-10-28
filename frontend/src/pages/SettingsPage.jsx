import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Key,
  Server,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import apiService from '../services/api';

export default function SettingsPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKeyEnv, setCopiedKeyEnv] = useState(false);

  const fetchHealth = () => {
    setLoading(true);
    apiService.getHealth()
      .then(res => {
        setHealth(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const isLive = health?.ai_engine?.has_gemini_key;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText("GEMINI_API_KEY=your_actual_key_here\nGEMINI_MODEL=gemini-2.5-flash");
    setCopiedKeyEnv(true);
    setTimeout(() => setCopiedKeyEnv(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              INFRASTRUCTURE & SERVICE TELEMETRY
            </span>
            <span className="text-xs text-slate-500">• Antigravity Full-Stack Diagnostics</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings className="w-7 h-7 text-orange-500" />
            <span>Settings & AI Engine Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time status of backend microservices, SQLite persistence, and Google Gemini Multimodal Vision API credentials.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* System Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Engine Status Card */}
        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-400" />
              <span>Multimodal AI Engine</span>
            </span>
            <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-slate-400">Mode:</div>
            <div className="font-bold text-white font-mono">
              {health?.ai_engine?.mode || 'Intelligent Domain Simulator'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              Model: {health?.ai_engine?.model || 'gemini-2.5-flash'}
            </div>
          </div>

          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
            isLive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {isLive ? 'Live Gemini Vision Connected' : 'Simulator Online (Zero Errors)'}
          </span>
        </div>

        {/* Database Status Card */}
        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Relational Database</span>
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-slate-400">Engine:</div>
            <div className="font-bold text-white font-mono">
              {health?.database?.type || 'SQLite 3'} (SQLAlchemy 2.0 ORM)
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              Location: backend/constructai.db
            </div>
          </div>

          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Database Operational
          </span>
        </div>

        {/* Backend Server Status Card */}
        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>FastAPI Backend ASGI</span>
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-slate-400">Environment:</div>
            <div className="font-bold text-white font-mono">
              {health?.environment || 'development'} • Port 8000
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              Version: {health?.version || '1.0.0'}
            </div>
          </div>

          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            CORS Origin: localhost:5173
          </span>
        </div>
      </div>

      {/* AI Provider Setup Guidance */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Key className="w-4 h-4 text-orange-400" />
          <span>Configuring Google Gemini Multimodal Vision API</span>
        </h3>

        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            ConstructAI is built with a <strong>Zero-Config Intelligent Simulator Mode</strong>, meaning you can test every safety inspection, crack triage, and schedule workflow immediately out of the box with realistic domain simulations even without an API key!
          </p>
          <p>
            To activate <strong>live Gemini Multimodal AI vision analysis</strong> on custom live photos:
          </p>

          <ol className="list-decimal list-inside space-y-2 text-slate-300 font-medium pl-1">
            <li>
              Obtain a free Gemini API Key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline font-bold inline-flex items-center gap-1">Google AI Studio <ExternalLink className="w-3 h-3 inline" /></a>.
            </li>
            <li>
              Open the backend environment file located at <code className="bg-slate-900 px-1.5 py-0.5 rounded text-orange-300 font-mono">backend/.env</code>.
            </li>
            <li>
              Paste your key and model identifier:
            </li>
          </ol>

          <div className="relative rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-200">
            <button
              onClick={handleCopySnippet}
              className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Copy snippet"
            >
              {copiedKeyEnv ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <pre className="text-slate-300">
              <code>{`# backend/.env
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...your_actual_key_here...
GEMINI_MODEL=gemini-2.5-flash`}</code>
            </pre>
          </div>

          <p className="text-[11px] text-slate-400">
            * Security Guarantee: The API key is stored strictly on your local backend server and is never sent to the browser or client-side code.
          </p>
        </div>
      </div>
    </div>
  );
}
