import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Sparkles,
  ListTodo,
  TrendingUp,
  Shield,
  Search,
  CheckCircle2,
  ArrowRight,
  FileText,
  Check,
  Building2,
} from 'lucide-react';
import { generateAiAgenda } from '../../services/aiClient';

export const WorkspaceHub: React.FC = () => {
  const {
    startNewMeeting,
    loadMeetingDetails,
    pastMeetings,
    actionItems,
    toggleActionItemStatus,
    addNewActionItem,
    setActiveView,
  } = useMeeting();

  const [activeTab, setActiveTab] = useState<'recordings' | 'kanban' | 'schedule'>('recordings');
  const [searchFilter, setSearchFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Schedule Meeting form state
  const [newTitle, setNewTitle] = useState('Product Architecture & Engineering Sync');
  const [newDuration, setNewDuration] = useState(30);
  const [newTopic, setNewTopic] = useState('Review microservice latency, failover redundancy, and deployment timelines');
  const [isGeneratingAgenda, setIsGeneratingAgenda] = useState(false);
  const [scheduledAgendaItems, setScheduledAgendaItems] = useState<any[]>([]);

  const handleGenerateAgenda = async () => {
    setIsGeneratingAgenda(true);
    try {
      const res = await generateAiAgenda(newTopic, newDuration, ['User 1', 'User 2', 'User 3']);
      setScheduledAgendaItems(res.items || []);
    } catch (e) {
      console.warn('Agenda generation error:', e);
    } finally {
      setIsGeneratingAgenda(false);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startNewMeeting(newTitle);
  };

  const filteredPastMeetings = pastMeetings.filter((m) =>
    m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.topic.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const assignees = Array.from(new Set(actionItems.map((a) => a.owner)));

  const todoItems = actionItems.filter(
    (a) => a.status === 'todo' && (assigneeFilter === 'all' || a.owner === assigneeFilter)
  );
  const inProgressItems = actionItems.filter(
    (a) => a.status === 'in_progress' && (assigneeFilter === 'all' || a.owner === assigneeFilter)
  );
  const completedItems = actionItems.filter(
    (a) => a.status === 'completed' && (assigneeFilter === 'all' || a.owner === assigneeFilter)
  );

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#faf9f6] p-4 md:p-8 space-y-6">
      {/* Workspace Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold tracking-wider uppercase">
            <Building2 className="w-4 h-4 text-stone-600" />
            <span>Product & Engineering Workspace</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Team Meetings & Action Hub
          </h1>
          <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
            A quiet, organized space for recorded meetings, executive summaries, shared notes, and task accountability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => startNewMeeting('Executive Strategy Session')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-xs transition"
          >
            <Video className="w-4 h-4" />
            <span>Start Meeting Now</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-medium transition"
          >
            <Calendar className="w-4 h-4 text-stone-600" />
            <span>Schedule Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium">Time Saved with Summaries</span>
            <div className="text-2xl font-serif font-bold text-stone-900 mt-1">142.5 hrs</div>
            <span className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> +18% team productivity
            </span>
          </div>
          <div className="p-3 rounded-xl bg-stone-100 text-stone-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium">Action Deliverables Done</span>
            <div className="text-2xl font-serif font-bold text-stone-900 mt-1">
              {actionItems.filter((a) => a.status === 'completed').length} / {actionItems.length}
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">
              Synced to project trackers
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium">Average Meeting Efficiency</span>
            <div className="text-2xl font-serif font-bold text-stone-900 mt-1">94.2%</div>
            <span className="text-[11px] text-stone-500 mt-1 block">
              Based on agenda completion
            </span>
          </div>
          <div className="p-3 rounded-xl bg-stone-100 text-stone-700">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium">Security & Compliance</span>
            <div className="text-2xl font-serif font-bold text-stone-900 mt-1">SOC2 Type II</div>
            <span className="text-[11px] text-emerald-700 mt-1 block">
              TLS 1.3 • AES-256 GCM
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-stone-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('recordings')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'recordings'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Video className="w-4 h-4 text-stone-600" />
          <span>Recorded Meetings ({pastMeetings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'kanban'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ListTodo className="w-4 h-4 text-stone-600" />
          <span>Action Items Board ({actionItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'schedule'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-stone-600" />
          <span>Meeting Preparation</span>
        </button>
      </div>

      {/* Tab 1: Past Meetings & Briefings */}
      {activeTab === 'recordings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search past meetings, notes, topics..."
                className="w-full bg-white border border-stone-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>

            <div className="text-xs text-stone-500">
              All audio hashed and encrypted in transit
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPastMeetings.map((session) => (
              <div
                key={session.id}
                className="p-6 rounded-3xl bg-white border border-stone-200 hover:border-stone-300 transition-all space-y-4 shadow-xs group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-medium text-stone-500">
                      {session.code}
                    </span>
                    <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-stone-700 transition-colors">
                      {session.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-1">{session.topic}</p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-stone-100 text-[11px] font-medium text-stone-600">
                    {session.startedAt}
                  </span>
                </div>

                {/* Summary Box */}
                {session.summary && (
                  <div className="p-4 rounded-2xl bg-[#faf9f6] border border-stone-200/90 text-xs text-stone-750 font-serif leading-relaxed space-y-1.5">
                    <div className="flex items-center gap-1.5 text-stone-700 font-sans font-semibold text-[11px]">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Executive Briefing</span>
                    </div>
                    <p className="line-clamp-2">{session.summary.executiveSummary}</p>
                  </div>
                )}

                {/* Attendees badges - NO photo faces */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="flex -space-x-1.5">
                    {session.participants.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="w-7 h-7 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center text-[10px] font-serif font-bold shadow-2xs"
                        title={p.name}
                      >
                        {p.avatar || 'U'}
                      </div>
                    ))}
                    {session.participants.length > 4 && (
                      <span className="w-7 h-7 rounded-xl bg-stone-200 text-[10px] text-stone-700 flex items-center justify-center font-bold">
                        +{session.participants.length - 4}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => loadMeetingDetails(session)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition"
                  >
                    <span>Open Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Action Items Kanban */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Filter Assignee:</span>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="bg-white border border-stone-200 text-xs text-stone-800 rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Team Members</option>
                {assignees.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const task = prompt('Enter new task:');
                if (task) addNewActionItem(task, 'User 1', 'high', 'Friday EOD');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Action Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Todo */}
            <div className="p-4 rounded-3xl bg-[#f4f2ea] border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-serif font-bold text-stone-800 uppercase tracking-wider">
                  To Do ({todoItems.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>

              <div className="space-y-3">
                {todoItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition space-y-2.5 shadow-xs"
                  >
                    <p className="text-xs font-medium text-stone-850 leading-snug">
                      {item.task}
                    </p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-700 font-medium">@{item.owner}</span>
                      <span className="text-stone-400">{item.dueDate}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                          item.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <button
                        onClick={() => toggleActionItemStatus(item.id)}
                        className="text-[11px] text-stone-500 hover:text-stone-900 transition font-medium"
                      >
                        Mark Done →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="p-4 rounded-3xl bg-[#f4f2ea] border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-serif font-bold text-stone-800 uppercase tracking-wider">
                  In Progress ({inProgressItems.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-stone-700"></span>
              </div>

              <div className="space-y-3">
                {inProgressItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-stone-300 space-y-2.5 shadow-xs"
                  >
                    <p className="text-xs font-medium text-stone-850 leading-snug">
                      {item.task}
                    </p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-700 font-medium">@{item.owner}</span>
                      <span className="text-stone-400">{item.dueDate}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[9px] font-bold uppercase">
                        ACTIVE
                      </span>
                      <button
                        onClick={() => toggleActionItemStatus(item.id)}
                        className="text-[11px] text-stone-500 hover:text-stone-900 transition font-medium"
                      >
                        Complete ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Completed */}
            <div className="p-4 rounded-3xl bg-[#f4f2ea] border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-serif font-bold text-stone-800 uppercase tracking-wider">
                  Resolved ({completedItems.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              </div>

              <div className="space-y-3">
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white/70 border border-stone-200 opacity-70 space-y-2 shadow-xs"
                  >
                    <p className="text-xs font-medium text-stone-400 line-through leading-snug">
                      {item.task}
                    </p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-400">@{item.owner}</span>
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Schedule with Agenda */}
      {activeTab === 'schedule' && (
        <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-bold text-stone-900">Schedule Strategic Review</h3>
            <p className="text-xs text-stone-500">
              Prepare agendas, allocate time blocks, and ensure meeting efficiency.
            </p>
          </div>

          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Meeting Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Duration (Minutes)
                </label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
                >
                  <option value={15}>15 Minutes (Brief Sync)</option>
                  <option value={30}>30 Minutes (Standard Review)</option>
                  <option value={45}>45 Minutes (Technical Deep Dive)</option>
                  <option value={60}>60 Minutes (Team Planning)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Participants
                </label>
                <input
                  type="text"
                  defaultValue="User 1, User 2, User 3, User 4, User 5"
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700">
                  Goals & Agenda Topics
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAgenda}
                  disabled={isGeneratingAgenda}
                  className="flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isGeneratingAgenda ? 'Generating...' : 'Auto-Draft Agenda'}</span>
                </button>
              </div>
              <textarea
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                rows={3}
                placeholder="Key outcomes to achieve..."
                className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>

            {scheduledAgendaItems.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-stone-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                  Suggested Agenda Breakdown
                </span>
                <div className="space-y-2">
                  {scheduledAgendaItems.map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-start justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-stone-850">
                          {i + 1}. {item.title}
                        </span>
                        <p className="text-[11px] text-stone-500 mt-0.5">{item.objective}</p>
                      </div>
                      <span className="text-[10px] font-mono text-stone-600 shrink-0 ml-2">
                        {item.durationMin}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-xs transition"
            >
              Save & Open Meeting Room
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
