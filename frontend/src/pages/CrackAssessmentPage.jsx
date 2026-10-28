import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  SearchCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Info,
  Ruler,
  Clock,
  History,
  ShieldAlert
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import { SAMPLE_IMAGES } from '../utils/sampleData';
import apiService from '../services/api';

export default function CrackAssessmentPage() {
  const { activeProject } = useOutletContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [structuralElement, setStructuralElement] = useState('Reinforced Concrete Transfer Girder');
  const [scaleReference, setScaleReference] = useState(true);
  const [notes, setNotes] = useState('Quarter-span beam web support exhibiting diagonal orientation.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiService.getCrackHistory(activeProject?.id)
      .then(res => setHistory(res.data || []))
      .catch(() => {});
  }, [activeProject]);

  const handleRunAssessment = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a photo of the concrete element or use the sample demo image.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('structural_element', structuralElement);
      formData.append('scale_reference', scaleReference);
      formData.append('notes', notes);
      if (activeProject?.id) formData.append('project_id', activeProject.id);

      const res = await apiService.analyzeCrack(formData);
      setResult(res.data);
      // Refresh history
      apiService.getCrackHistory(activeProject?.id).then(h => setHistory(h.data || []));
    } catch (err) {
      setError(err.message || 'Crack assessment failed.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Moderate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              STRUCTURAL INTEGRITY TRIAGE
            </span>
            <span className="text-xs text-slate-500">• Concrete Forensic Computer Vision</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <SearchCheck className="w-7 h-7 text-orange-500" />
            <span>Crack Detection & Structural Assessment</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Visual pattern triage for concrete beams, columns, slabs, and shear walls. Distinguishes superficial shrinkage from high-risk shear deformation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              <span>Concrete Element Parameters</span>
            </h3>

            <ImageUploader
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onClear={() => { setSelectedFile(null); setResult(null); }}
              sampleImageGenerator={SAMPLE_IMAGES.structuralCrack.generateFile}
              sampleLabel="Load Beam 45° Shear Crack Sample"
              title="Upload Concrete / Structural Element Photo"
              description="Capture close-up macro shots with good contrast and scale marker."
            />

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Structural Element Type
                </label>
                <select
                  value={structuralElement}
                  onChange={(e) => setStructuralElement(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Reinforced Concrete Transfer Girder">Reinforced Concrete Transfer Girder / Beam</option>
                  <option value="Load-Bearing Column (Axial Compression)">Load-Bearing Column (Axial Compression)</option>
                  <option value="Post-Tensioned Suspended Slab">Post-Tensioned Suspended Slab</option>
                  <option value="Basement Retaining / Shear Wall">Basement Retaining / Shear Wall</option>
                  <option value="Raft Foundation Pedestal">Raft Foundation Pedestal</option>
                  <option value="Masonry Infills / Parapet Wall">Masonry Infills / Parapet Wall</option>
                </select>
              </div>

              {/* Scale Reference Checkbox */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Calibrated Scale Reference</span>
                  <span className="text-[11px] text-slate-500">Ruler, optical crack gauge, or coin present in photo</span>
                </div>
                <input
                  type="checkbox"
                  checked={scaleReference}
                  onChange={(e) => setScaleReference(e.target.checked)}
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Field Observations / Notes
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note member age, vibration exposure, or recent structural loading"
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
              onClick={handleRunAssessment}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Evaluating Structural Geometry...' : 'Execute Crack Forensic Triage'}</span>
            </button>
          </div>

          {/* Legal / Engineering Scope */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Info className="w-4 h-4 text-orange-400" />
              <span>Triage Scope & Limitations</span>
            </div>
            <p className="leading-relaxed">
              Visual triage classifications (Low, Moderate, High, Critical) are preliminary field screening mechanisms. 
              They do <strong>not</strong> substitute for certified structural calculations by a licensed Professional Engineer (PE).
            </p>
          </div>
        </div>

        {/* Right Column: AI Triage Output & Historical Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="space-y-5">
              {/* Main Classification Card */}
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Visual Severity Classification
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase font-mono border ${getSeverityBadge(result.visual_severity)}`}>
                        {result.visual_severity} Severity
                      </span>
                      <span className="text-xl font-black text-white">
                        {result.crack_pattern}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">ESTIMATED WIDTH</span>
                      <strong className="text-orange-400 text-sm">
                        {result.estimated_width_mm ? `${result.estimated_width_mm} mm` : 'Uncalibrated'}
                      </strong>
                    </div>
                    <div className="border-l border-slate-700 pl-4">
                      <span className="text-slate-500 block text-[10px]">CONFIDENCE</span>
                      <strong className="text-emerald-400 text-sm">
                        {(result.confidence * 100).toFixed(0)}%
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-3.5 h-3.5 text-orange-400" />
                    <strong>Width Measurement Note:</strong>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {result.width_confidence_note}
                  </p>
                </div>

                {/* Escalation Warning */}
                {result.escalation_required && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-rose-300">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Professional Engineering Escalation Mandated</span>
                    </div>
                    <p className="leading-relaxed">
                      {result.escalation_reason || "Crack orientation and member geometry indicate load redistribution. A licensed structural engineer must be notified."}
                    </p>
                  </div>
                )}
              </div>

              {/* Hypotheses Causes */}
              <div className="glass-panel rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Probable Structural Hypotheses (Field Causes)</span>
                </h3>
                <div className="space-y-2">
                  {result.possible_causes_hypotheses?.map((cause, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{cause}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel rounded-xl p-4 text-xs space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <SearchCheck className="w-4 h-4 text-cyan-400" />
                    <span>Inspection Actions</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    {result.recommended_inspection_actions?.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass-panel rounded-xl p-4 text-xs space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Maintenance & Repair</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    {result.recommended_maintenance_actions?.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
                <SearchCheck className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-base font-bold text-white">No Structural Crack Scan Active</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a photo or click <strong>"Load Beam 45° Shear Crack Sample"</strong> on the left to evaluate structural crack pattern and maintenance triage.
              </p>
            </div>
          )}

          {/* Historical Crack Logs Comparison */}
          {history.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <History className="w-4 h-4 text-orange-400" />
                <span>Historical Structural Inspection Logs ({history.length})</span>
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {history.map((h) => (
                  <div key={h.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{h.structural_element}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {h.crack_type} • Width: {h.estimated_width_mm ? `${h.estimated_width_mm}mm` : 'Uncalibrated'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadge(h.visual_severity)}`}>
                        {h.visual_severity}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">{h.created_at}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
