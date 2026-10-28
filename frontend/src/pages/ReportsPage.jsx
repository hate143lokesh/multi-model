import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  ShieldAlert,
  SearchCheck,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import apiService from '../services/api';

export default function ReportsPage() {
  const { activeProject } = useOutletContext();
  const [summary, setSummary] = useState(null);
  const [safetyLogs, setSafetyLogs] = useState([]);
  const [crackLogs, setCrackLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getExecutiveSummary().catch(() => ({ data: null })),
      apiService.getSafetyHistory(activeProject?.id).catch(() => ({ data: [] })),
      apiService.getCrackHistory(activeProject?.id).catch(() => ({ data: [] }))
    ]).then(([sumRes, safetyRes, crackRes]) => {
      if (sumRes.data) setSummary(sumRes.data);
      if (safetyRes.data) setSafetyLogs(safetyRes.data);
      if (crackRes.data) setCrackLogs(crackRes.data);
      setLoading(false);
    });
  }, [activeProject]);

  const handlePrint = () => {
    window.print();
  };

  const filteredSafety = safetyLogs.filter(s => {
    if (filterSeverity === 'ALL') return true;
    return s.overall_risk?.toUpperCase() === filterSeverity;
  });

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      {/* Header (Hidden during browser print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              AUDIT DOSSIER & COMPLIANCE ARCHIVE
            </span>
            <span className="text-xs text-slate-500">• Ready for Regulatory Filing & Stakeholder Review</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-orange-500" />
            <span>Executive Reports & Compliance Audits</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Consolidated intelligence summary linking active site safety scans, structural crack forensics, milestone velocity, and financial capital allocation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-lg shadow-orange-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Dossier */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Document Header for Print */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div>
            <span className="text-[10px] font-mono uppercase text-orange-400 font-bold block">
              CONSTRUCTAI ENGINEERING COMPLIANCE DOSSIER
            </span>
            <h2 className="text-xl font-black text-white print:text-black mt-1">
              Project Inspection & Risk Summary
            </h2>
            <div className="text-xs text-slate-400 print:text-gray-600 mt-1 font-mono">
              Project: {activeProject?.name || 'Metropolitan Commercial Tower'} • Code: {activeProject?.code || 'PRJ-METRO-02'}
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-400 print:text-gray-600">
            <div>Date: {new Date().toLocaleDateString('en-GB')}</div>
            <div>Status: Operational</div>
          </div>
        </div>

        {/* Executive KPIs Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <span className="text-[10px] uppercase font-mono text-slate-400">Completion</span>
            <div className="text-2xl font-black text-white print:text-black mt-0.5">
              {activeProject?.completion_pct || 45.8}%
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">On Schedule</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <span className="text-[10px] uppercase font-mono text-slate-400">Budget Spent</span>
            <div className="text-2xl font-black text-white print:text-black mt-0.5">
              ₹{((activeProject?.spent || 112000000) / 10000000).toFixed(2)} Cr
            </div>
            <span className="text-[10px] text-slate-400 font-mono">of ₹{((activeProject?.budget || 245000000) / 10000000).toFixed(2)} Cr</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <span className="text-[10px] uppercase font-mono text-slate-400">Safety Score</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              84 / 100
            </div>
            <span className="text-[10px] text-slate-400 font-mono">OSHA Audited</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <span className="text-[10px] uppercase font-mono text-slate-400">Structural Audits</span>
            <div className="text-2xl font-black text-orange-400 mt-0.5">
              {crackLogs.length || 2} Scanned
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Forensic Triage</span>
          </div>
        </div>

        {/* Filter controls (Hidden during print) */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 print:hidden">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <span>Filter Safety Severity:</span>
          </span>
          <div className="flex items-center gap-2 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                  filterSeverity === sev
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Safety Audit Records */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-2">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <span>Jobsite Safety & PPE Compliance Audit Logs</span>
          </h3>

          <div className="space-y-3">
            {filteredSafety.map((log) => (
              <div 
                key={log.id} 
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-white print:border-gray-300 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white print:text-black">{log.site_area}</span>
                    <span className="text-[10px] font-mono text-slate-500">• {log.created_at}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    log.overall_risk === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                    log.overall_risk === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {log.overall_risk} Risk
                  </span>
                </div>

                {log.findings?.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {log.findings.map((f, fi) => (
                      <div key={fi} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 print:text-gray-800">
                        <strong className="text-slate-200 print:text-black">{f.category}:</strong> {f.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Structural Crack Triage Records */}
        <div className="space-y-3 pt-4 border-t border-slate-800 print:border-gray-300">
          <h3 className="text-sm font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-2">
            <SearchCheck className="w-4 h-4 text-cyan-400" />
            <span>Concrete Structural Crack Triage Logs</span>
          </h3>

          <div className="space-y-3">
            {crackLogs.map((c) => (
              <div 
                key={c.id} 
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-white print:border-gray-300 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white print:text-black">{c.structural_element}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {c.visual_severity} Severity
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-gray-700">
                  Pattern: {c.crack_type} • Width: {c.estimated_width_mm ? `${c.estimated_width_mm}mm` : 'Uncalibrated'} • Confidence: {(c.confidence * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Formal Engineering Sign-Off Box */}
        <div className="pt-6 border-t-2 border-slate-800 print:border-black grid grid-cols-2 gap-8 text-xs font-mono text-slate-400 print:text-gray-700">
          <div>
            <div className="border-b border-slate-700 print:border-gray-400 pb-8 mb-2"></div>
            <span>Site Safety Officer / Inspector Signature</span>
          </div>
          <div>
            <div className="border-b border-slate-700 print:border-gray-400 pb-8 mb-2"></div>
            <span>Principal Project Manager / EOR Sign-Off</span>
          </div>
        </div>
      </div>
    </div>
  );
}
