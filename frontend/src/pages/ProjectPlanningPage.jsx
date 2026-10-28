import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  Download,
  Trash2,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import apiService from '../services/api';

const CONSTRUCTION_PHASES = [
  "Site Preparation & Earthwork",
  "Foundation & Substructure",
  "Structural Framework (RCC)",
  "Masonry & Core Walls",
  "MEP Services (Mechanical, Electrical, Plumbing)",
  "Internal & External Finishing",
  "Inspection, Testing & Handover"
];

export default function ProjectPlanningPage() {
  const { activeProject } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProposals, setAiProposals] = useState([]);

  // New Task form state
  const [newTask, setNewTask] = useState({
    phase: "Structural Framework (RCC)",
    title: "",
    description: "",
    status: "In Progress",
    priority: "High",
    progress_pct: 0,
    start_date: "2025-03-01",
    end_date: "2025-04-15",
    assigned_role: "Structural Contractor",
    dependencies: ""
  });

  // AI Proposal Form
  const [aiType, setAiType] = useState('Commercial High-Rise');
  const [aiFloors, setAiFloors] = useState(8);
  const [aiMonths, setAiMonths] = useState(16);

  useEffect(() => {
    if (activeProject?.id) {
      loadProjectTasks(activeProject.id);
    }
  }, [activeProject]);

  const loadProjectTasks = (projectId) => {
    setLoading(true);
    apiService.getProject(projectId)
      .then(res => {
        setTasks(res.data.tasks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!activeProject?.id || !newTask.title.trim()) return;

    try {
      await apiService.addTask(activeProject.id, {
        ...newTask,
        project_id: activeProject.id,
        progress_pct: parseFloat(newTask.progress_pct)
      });
      setShowAddModal(false);
      setNewTask({
        phase: "Structural Framework (RCC)",
        title: "",
        description: "",
        status: "In Progress",
        priority: "High",
        progress_pct: 0,
        start_date: "2025-03-01",
        end_date: "2025-04-15",
        assigned_role: "Structural Contractor",
        dependencies: ""
      });
      loadProjectTasks(activeProject.id);
    } catch (err) {
      alert(err.message || 'Failed to add task.');
    }
  };

  const handleUpdateProgress = async (taskId, newPct) => {
    if (!activeProject?.id) return;
    try {
      const status = newPct >= 100 ? 'Completed' : newPct > 0 ? 'In Progress' : 'Pending';
      await apiService.updateTask(activeProject.id, taskId, {
        progress_pct: newPct,
        status: status
      });
      loadProjectTasks(activeProject.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!activeProject?.id || !window.confirm('Delete this task?')) return;
    try {
      await apiService.deleteTask(activeProject.id, taskId);
      loadProjectTasks(activeProject.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAIProposal = async () => {
    setAiLoading(true);
    try {
      const res = await apiService.generateScheduleProposal({
        project_type: aiType,
        total_floors: parseInt(aiFloors),
        target_duration_months: parseInt(aiMonths)
      });
      setAiProposals(res.data || []);
    } catch (err) {
      alert('AI schedule generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleImportProposal = async (proposal) => {
    if (!activeProject?.id) return;
    try {
      await apiService.addTask(activeProject.id, {
        project_id: activeProject.id,
        phase: proposal.phase,
        title: proposal.title,
        priority: proposal.priority,
        status: "Pending",
        progress_pct: 0,
        assigned_role: proposal.assigned_role,
        dependencies: proposal.dependencies || "",
        start_date: "2025-04-01",
        end_date: "2025-06-30"
      });
      loadProjectTasks(activeProject.id);
      alert(`Added "${proposal.title}" to project schedule!`);
    } catch (err) {
      alert('Failed to import proposed task.');
    }
  };

  const handleExportPlan = () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `${activeProject?.code || 'project'}_gantt_schedule.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const avgProgress = tasks.length > 0 ? (tasks.reduce((acc, t) => acc + t.progress_pct, 0) / tasks.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              CRITICAL PATH & GANTT ENGINE
            </span>
            <span className="text-xs text-slate-500">• Phase-Wise Milestone Orchestrator</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-orange-500" />
            <span>Project Planning & Scheduling</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Active Project: <strong className="text-slate-200">{activeProject?.name}</strong>. Configure durations, contractor roles, task dependencies, and track planned vs. actual execution.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Schedule Draft</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          <button
            onClick={handleExportPlan}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Export Schedule JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Total Work Packages</span>
            <div className="text-2xl font-black text-white">{tasks.length} Tasks</div>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
            {completedCount} Completed
          </span>
        </div>
        <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Active Execution</span>
            <div className="text-2xl font-black text-orange-400">{inProgressCount} Ongoing</div>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Critical Path
          </span>
        </div>
        <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Average Phase Completion</span>
            <div className="text-2xl font-black text-emerald-400">{avgProgress}%</div>
          </div>
          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${avgProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Gantt / Task List */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            <span>Construction Phases & Task Timeline</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Drag slider to update live progress
          </span>
        </div>

        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      {task.phase}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      task.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      task.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      task.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      task.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {task.status}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar + Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      Role: {task.assigned_role} • {task.start_date} to {task.end_date}
                    </span>
                    <span className="font-bold text-white">{task.progress_pct}% Completed</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          task.progress_pct >= 100 ? 'bg-emerald-500' :
                          task.progress_pct > 0 ? 'bg-orange-500' : 'bg-slate-700'
                        }`}
                        style={{ width: `${task.progress_pct}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={task.progress_pct}
                      onChange={(e) => handleUpdateProgress(task.id, parseFloat(e.target.value))}
                      className="w-24 accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 text-xs space-y-2">
            <p>No tasks configured yet for this project.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-orange-400 hover:text-orange-300 font-semibold inline-block"
            >
              + Create First Task
            </button>
          </div>
        )}
      </div>

      {/* Modal: Add Task */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Add New Project Task / Milestone
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phase</label>
                <select
                  value={newTask.phase}
                  onChange={(e) => setNewTask({ ...newTask, phase: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {CONSTRUCTION_PHASES.map((ph, idx) => (
                    <option key={idx} value={ph}>{ph}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Raft foundation rebar tying & concrete pour"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                  <input
                    type="text"
                    value={newTask.assigned_role}
                    onChange={(e) => setNewTask({ ...newTask, assigned_role: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newTask.start_date}
                    onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target End Date</label>
                  <input
                    type="date"
                    value={newTask.end_date}
                    onChange={(e) => setNewTask({ ...newTask, end_date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Schedule Proposal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <span>AI-Assisted Construction Schedule Proposal</span>
              </h3>
              <button onClick={() => setShowAIModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Provide project parameters and the AI will propose standard phase durations, critical path sequences, and subcontractor assignments.
            </p>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Project Type</label>
                <select
                  value={aiType}
                  onChange={(e) => setAiType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="Commercial High-Rise">Commercial High-Rise</option>
                  <option value="Residential Towers">Residential Towers</option>
                  <option value="Industrial Plant">Industrial Plant</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Floors</label>
                <input
                  type="number"
                  value={aiFloors}
                  onChange={(e) => setAiFloors(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Months</label>
                <input
                  type="number"
                  value={aiMonths}
                  onChange={(e) => setAiMonths(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateAIProposal}
              disabled={aiLoading}
              className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{aiLoading ? 'Synthesizing Schedule Proposal...' : 'Generate Proposal'}</span>
            </button>

            {aiProposals.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-white block">Proposed Phase Breakdown:</span>
                {aiProposals.map((prop, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-orange-400 font-bold block">{prop.phase}</span>
                      <span className="font-bold text-white">{prop.title}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Duration: ~{prop.duration_weeks} weeks • Role: {prop.assigned_role}
                      </span>
                    </div>
                    <button
                      onClick={() => handleImportProposal(prop)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-orange-500 hover:text-white text-orange-400 font-semibold text-xs border border-slate-700 transition-colors"
                    >
                      + Import Task
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
