import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus
} from 'lucide-react';
import apiService from '../services/api';

const QUICK_PROMPTS = [
  "Draft a pre-pour inspection checklist for Level 6 slab casting.",
  "Create a daily site report summary for 45 workers on foundation piling.",
  "Explain IS 456 / ACI 308 minimum curing periods for OPC and fly ash concrete.",
  "Identify safety hazards and required PPE for deep basement shoring excavation."
];

export default function DailyAssistantPage() {
  const { activeProject } = useOutletContext();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `### Welcome to ConstructAI Daily Site Copilot

I am your specialized construction engineering assistant. How can I assist with your site operations today?

- **Daily Site Reports**: Draft executive summaries, workforce counts, and progress logs.
- **Inspection Protocols**: Generate pre-pour checklists, rebar tying checks, and de-shuttering signoffs.
- **Safety & Codes**: Instant references to IS 456, ACI 318, and OSHA 1926 standards.
- **Troubleshooting**: Slump loss, honeycomb concrete remediation, and critical path delays.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [taskCategory, setTaskCategory] = useState('Daily Operations');
  
  // Daily Report Drawer State
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [workforceCount, setWorkforceCount] = useState(48);
  const [weatherNotes, setWeatherNotes] = useState('Clear, 29°C, Wind 14 km/h');
  const [workNotes, setWorkNotes] = useState('Completed Floor 5 column casting and level 6 beam bottom shuttering.');
  const [safetyNotes, setSafetyNotes] = useState('100% PPE compliance verified at morning toolbox briefing.');
  const [reportSaving, setReportSaving] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiService.sendChatMessage(q, taskCategory, messages);
      const aiReply = res.data.reply;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiReply,
        category: res.data.category,
        followups: res.data.suggested_followups,
        actions: res.data.actionable_items
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Error:** ${err.message || 'Failed to reach AI copilot.'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSaveDailyReport = async (e) => {
    e.preventDefault();
    setReportSaving(true);
    try {
      const res = await apiService.createDailyReport({
        project_id: activeProject?.id,
        date: reportDate,
        weather_summary: weatherNotes,
        workforce_count: parseInt(workforceCount),
        work_completed_notes: workNotes,
        safety_notes: safetyNotes
      });
      setShowReportForm(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `### Daily Construction Site Report Generated & Archived (Report #${res.data.id || 'NEW'})
**Project**: ${activeProject?.name || 'Active Project'}  
**Date**: ${res.data.report_date}  
**Workforce**: ${res.data.workforce_count} personnel on site  
**Weather**: ${res.data.weather_summary}  

#### Executive Summary
${res.data.executive_summary}

#### Work Completed
${res.data.work_completed}

#### Safety Observations
${res.data.safety_observations}

*Report saved to database. Access anytime from the Reports & Analytics tab.*`
      }]);
    } catch (err) {
      alert(err.message || 'Failed to archive daily report.');
    } finally {
      setReportSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              FIELD ENGINEERING COPILOT
            </span>
            <span className="text-xs text-slate-500">• Operations, Standards & Daily Logs</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bot className="w-7 h-7 text-orange-500" />
            <span>Daily Construction Site Assistant</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            AI-powered daily field copilot for drafting site logs, checklists, meeting minutes, and verifying civil engineering standards.
          </p>
        </div>

        <button
          onClick={() => setShowReportForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-lg shadow-orange-500/20 shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Draft Formal Daily Report</span>
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-mono text-[11px] shrink-0">Prompts:</span>
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/40 shrink-0 transition-colors text-[11px]"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main Chat Container */}
      <div className="glass-panel rounded-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`max-w-2xl rounded-2xl p-4 text-xs space-y-2 relative group ${
                  isUser 
                    ? 'bg-orange-500 text-white rounded-tr-none font-medium' 
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(m.content, idx)}
                      className="absolute top-2 right-2 p-1 rounded bg-slate-800/80 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  {/* Follow-up suggestions if available */}
                  {m.followups?.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 font-bold block">SUGGESTED NEXT INQUIRIES:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.followups.map((f, fi) => (
                          <button
                            key={fi}
                            onClick={() => handleSend(f)}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-orange-500/20 text-orange-400 border border-slate-700 transition-colors"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-orange-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
              <span>ConstructAI Copilot is synthesizing engineering advisory...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center gap-3">
          <select
            value={taskCategory}
            onChange={(e) => setTaskCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500"
          >
            <option value="Daily Operations">Daily Operations</option>
            <option value="Safety & OSHA">Safety & OSHA</option>
            <option value="Concrete Technology">Concrete Technology</option>
            <option value="Quantity Surveying">Quantity Surveying</option>
            <option value="Snag List & QC">Snag List & QC</option>
          </select>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Ask about site procedures, concrete curing, OSHA standards, or daily progress logs..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-orange-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Modal: Daily Site Report Generator */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 max-w-xl w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <span>Compile Daily Construction Site Report</span>
              </h3>
              <button onClick={() => setShowReportForm(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveDailyReport} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Report Date</label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Workforce on Duty</label>
                  <input
                    type="number"
                    required
                    value={workforceCount}
                    onChange={(e) => setWorkforceCount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Weather Conditions</label>
                <input
                  type="text"
                  value={weatherNotes}
                  onChange={(e) => setWeatherNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Key Work Completed Today</label>
                <textarea
                  rows="3"
                  required
                  value={workNotes}
                  onChange={(e) => setWorkNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Safety & PPE Compliance Notes</label>
                <textarea
                  rows="2"
                  value={safetyNotes}
                  onChange={(e) => setSafetyNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSaving}
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  {reportSaving ? 'Archiving Report...' : 'Save & Publish Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
