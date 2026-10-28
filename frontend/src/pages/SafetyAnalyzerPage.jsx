import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ShieldAlert,
  HardHat,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import { SAMPLE_IMAGES } from '../utils/sampleData';
import apiService from '../services/api';

export default function SafetyAnalyzerPage() {
  const { activeProject } = useOutletContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [siteArea, setSiteArea] = useState('Floor 6 Cantilever Deck');
  const [workerCount, setWorkerCount] = useState(6);
  const [siteDescription, setSiteDescription] = useState('Active slab edge shuttering and rebar tying prior to concrete pour.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please upload a site photograph or select the sample demo image.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('site_area', siteArea);
      formData.append('worker_count', workerCount);
      formData.append('site_description', siteDescription);
      if (activeProject?.id) formData.append('project_id', activeProject.id);

      const res = await apiService.analyzeSafety(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Failed to complete safety scan.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              MULTIMODAL AI VISION
            </span>
            <span className="text-xs text-slate-500">• OSHA 1926 Compliance Scanner</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-orange-500" />
            <span>Construction Site Safety Monitoring</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automated visual audit of active jobsite photos for PPE non-compliance, perimeter fall exposures, housekeeping hazards, and unsafe practices.
          </p>
        </div>

        {/* Live Model Indicator */}
        <div className="glass-panel px-4 py-2.5 rounded-xl text-xs flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="font-bold text-white">Active AI Engine</div>
            <div className="text-[11px] text-slate-400 font-mono">
              {result?.is_live_ai ? 'Gemini 2.5 Flash Vision (Live)' : 'Domain Knowledge Simulator'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form / Uploader Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              <span>Inspection Parameters</span>
            </h3>

            <ImageUploader
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onClear={() => { setSelectedFile(null); setResult(null); }}
              sampleImageGenerator={SAMPLE_IMAGES.safetyHazard.generateFile}
              sampleLabel="Load Scaffold & PPE Sample Photo"
              title="Upload Construction Site Photograph"
              description="Drop aerial drone stills, mobile photos, or fixed CCTV snapshots."
            />

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Site Area / Location
                </label>
                <input
                  type="text"
                  value={siteArea}
                  onChange={(e) => setSiteArea(e.target.value)}
                  placeholder="e.g. Floor 6 Cantilever Deck, Basement Excavation"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Estimated Workers in Area (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={workerCount}
                  onChange={(e) => setWorkerCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Site Operations Context
                </label>
                <textarea
                  rows="2"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Describe ongoing activities (e.g. concrete pouring, scaffold stripping)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Running Multimodal Vision Audit...' : 'Execute Safety Triage Scan'}</span>
            </button>
          </div>

          {/* Legal / Engineering Scope Notice */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Info className="w-4 h-4 text-orange-400" />
              <span>Safety Decision Support Scope</span>
            </div>
            <p className="leading-relaxed">
              This multimodal AI module provides preliminary visual triage based solely on available image perspective. 
              Physical anchor load ratings, harness latch clicks, and blind spots must be verified by a certified Site Safety Officer.
            </p>
          </div>
        </div>

        {/* Right Column: AI Analysis Results (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="space-y-5">
              {/* Triage Summary Banner */}
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Overall Site Risk Level
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase font-mono border ${getSeverityBadge(result.overall_risk)}`}>
                        {result.overall_risk} Risk
                      </span>
                      <span className="text-xl font-black text-white">
                        Safety Score: {result.safety_score} / 100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">WORKERS</span>
                      <strong className="text-white">{result.workers_detected} Detected</strong>
                    </div>
                    <div className="border-l border-slate-700 pl-4">
                      <span className="text-slate-500 block text-[10px]">PPE COMPLIANCE</span>
                      <strong className={result.ppe_compliance_pct >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                        {result.ppe_compliance_pct}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Progress bar for safety score */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.safety_score >= 80 ? 'bg-emerald-500' :
                      result.safety_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${result.safety_score}%` }}
                  />
                </div>
              </div>

              {/* Identified Observations List */}
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span>Identified Hazard Observations ({result.observations?.length || 0})</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Source: {result.source_model}
                  </span>
                </h3>

                <div className="space-y-3">
                  {result.observations?.map((obs) => (
                    <div 
                      key={obs.id} 
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">{obs.id}</span>
                          <span className="text-xs font-bold text-white">{obs.category}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadge(obs.severity)}`}>
                            {obs.severity}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          Priority: {obs.priority}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {obs.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80 text-slate-400">
                        <div>
                          <strong className="text-slate-300">Location in Image:</strong> {obs.location_in_image}
                        </div>
                        {obs.osha_reference && (
                          <div>
                            <strong className="text-slate-300">Standard:</strong> {obs.osha_reference}
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
                        <strong>Mandatory Corrective Action:</strong> {obs.corrective_action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Root Causes & Action List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel rounded-xl p-4 text-xs space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>Contributing Factors</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    {result.probable_contributing_factors?.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass-panel rounded-xl p-4 text-xs space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Follow-Up Protocol</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    {result.suggested_follow_up}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
                <ShieldAlert className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-base font-bold text-white">No Active Audit Scan Displayed</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select an inspection image or click the built-in <strong>"Load Scaffold & PPE Sample Photo"</strong> on the left to run live multimodal hazard detection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
