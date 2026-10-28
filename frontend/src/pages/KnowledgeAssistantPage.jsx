import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Search,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Layers,
  FileCheck,
  Send,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import apiService from '../services/api';

const KNOWLEDGE_CATEGORIES = [
  { id: 'all', name: 'All Domains' },
  { id: 'concrete', name: 'Concrete Technology (IS 456 / ACI 318)' },
  { id: 'structural', name: 'Structural Engineering Fundamentals' },
  { id: 'safety', name: 'OSHA & Site Safety Protocols' },
  { id: 'surveying', name: 'Quantity Surveying & Estimation' },
  { id: 'defects', name: 'Defect Diagnostics & Remediation' }
];

const PRESET_ARTICLES = [
  {
    title: "Permissible De-Shuttering & Formwork Stripping Times",
    code: "IS 456:2000 Clause 11.3 / ACI 347R",
    summary: "Vertical formwork for columns/walls: 16-24 hrs. Slab soffits (props left under): 3 days. Beam soffits (props left under): 7 days. Props under slabs spanning up to 4.5m: 7 days.",
    category: "concrete"
  },
  {
    title: "Plastic Shrinkage vs. Drying Shrinkage Cracking",
    code: "ACI 224.1R Causes & Evaluation of Cracks",
    summary: "Plastic shrinkage occurs within 1-6 hours of placement due to rapid surface evaporation (> 1 kg/m²/hr). Drying shrinkage occurs over weeks as capillary water evaporates from the hardened paste.",
    category: "defects"
  },
  {
    title: "Minimum Clear Concrete Cover Requirements",
    code: "IS 456:2000 Clause 26.4 / BS 8110",
    summary: "Footings: 50mm. Columns: 40mm. Beams: 25mm. Slabs: 20mm. Increase cover by 15-20mm for severe marine or coastal chemical exposures.",
    category: "structural"
  },
  {
    title: "Hierarchy of Controls in Construction Safety",
    code: "OSHA 1926 Safety Framework / ISO 45001",
    summary: "1. Elimination (physically remove hazard), 2. Substitution, 3. Engineering Controls (guardrails, netting), 4. Administrative Controls (toolbox talks), 5. PPE (last line of defense).",
    category: "safety"
  }
];

export default function KnowledgeAssistantPage() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [qaInput, setQaInput] = useState('');
  const [qaResponse, setQaResponse] = useState(null);
  const [qaLoading, setQaLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredArticles = PRESET_ARTICLES.filter(a => {
    const matchesCat = selectedCat === 'all' || a.category === selectedCat;
    const matchesQuery = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleAskQuestion = async (queryText) => {
    const q = queryText || qaInput;
    if (!q.trim() || qaLoading) return;

    setQaLoading(true);
    setQaResponse(null);
    try {
      const res = await apiService.sendChatMessage(q, "Engineering Standards", []);
      setQaResponse(res.data);
    } catch (err) {
      setQaResponse({ reply: `Error: ${err.message || 'Failed to query knowledge base.'}` });
    } finally {
      setQaLoading(false);
    }
  };

  const handleCopy = () => {
    if (qaResponse?.reply) {
      navigator.clipboard.writeText(qaResponse.reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            ENGINEERING ONTOLOGY & KNOWLEDGE REPOSITORY
          </span>
          <span className="text-xs text-slate-500">• Grounded in IS, ACI, OSHA & IBC Source Frameworks</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-orange-500" />
          <span>Construction Knowledge Assistant</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Search verified civil engineering specifications, concrete mix design standards, building methods, and quality control protocols with source clause grounding.
        </p>
      </div>

      {/* Interactive QA Prompt Bar */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Ask Technical Engineering Question</span>
        </h3>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={qaInput}
              onChange={(e) => setQaInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAskQuestion(); }}
              placeholder="e.g. What is the standard slump requirement for pumped tremie concrete? Or explain IS 456 clause 26.4..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            onClick={() => handleAskQuestion()}
            disabled={qaLoading || !qaInput.trim()}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>{qaLoading ? 'Searching Standards...' : 'Ask Engineer'}</span>
          </button>
        </div>

        {/* AI Answer Display */}
        {qaResponse && (
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 relative group">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-mono text-orange-400 font-bold uppercase">
                {qaResponse.category || "Civil Engineering Technical Guidance"} • {qaResponse.model_used}
              </span>
              <button
                onClick={handleCopy}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Copy text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {qaResponse.reply}
            </div>
            {qaResponse.actionable_items?.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold block">ACTIONABLE SITE CHECKS:</span>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                  {qaResponse.actionable_items.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {KNOWLEDGE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors ${
                selectedCat === cat.id
                  ? 'bg-orange-500 text-white font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter standards articles..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Standards Articles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map((art, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {art.code}
                </span>
                <span className="text-[10px] uppercase font-mono text-slate-500">
                  {art.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{art.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{art.summary}</p>
            </div>

            <button
              onClick={() => handleAskQuestion(`Explain more about ${art.title} according to ${art.code}`)}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 self-start pt-2 border-t border-slate-800/80 w-full"
            >
              <span>Deep Dive Consultation</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
