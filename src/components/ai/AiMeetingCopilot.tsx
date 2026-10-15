import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import {
  Sparkles,
  CheckCircle2,
  ListTodo,
  CalendarCheck,
  RefreshCw,
  Copy,
  Check,
  Send,
  Plus,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileText,
  User,
  MessageSquare,
} from 'lucide-react';

export const AiMeetingCopilot: React.FC = () => {
  const {
    isAiPanelOpen,
    setIsAiPanelOpen,
    activeAiTab,
    setActiveAiTab,
    aiSummary,
    isGeneratingSummary,
    generateSummary,
    actionItems,
    toggleActionItemStatus,
    addNewActionItem,
    copilotMessages,
    isCopilotThinking,
    askCopilot,
    meeting,
  } = useMeeting();

  const [copilotInput, setCopilotInput] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showNewActionForm, setShowNewActionForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('User 1');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newTaskDueDate, setNewTaskDueDate] = useState('Friday EOD');

  if (!isAiPanelOpen) return null;

  const handleCopySummary = () => {
    if (!aiSummary) return;
    const textToCopy = `MEETING SUMMARY: ${meeting.title}\n\n${aiSummary.executiveSummary}\n\nKEY DECISIONS:\n${aiSummary.decisions.map((d) => `• ${d}`).join('\n')}\n\nACTION ITEMS:\n${aiSummary.actionItems.map((a) => `• [${a.priority.toUpperCase()}] ${a.task} (@${a.owner} by ${a.dueDate})`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleSendCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim() || isCopilotThinking) return;
    askCopilot(copilotInput);
    setCopilotInput('');
  };

  const quickPrompts = [
    'What key decisions were agreed on?',
    'Summarize User 2’s points on scaling',
    'Draft a quick 3-bullet team recap',
    'Are there any pending follow-ups?',
  ];

  return (
    <div className="w-full md:w-96 lg:w-[420px] h-full bg-white border-l border-stone-200 flex flex-col z-20 shadow-sm transition-all duration-200">
      {/* Header */}
      <div className="p-4 border-b border-stone-200/90 bg-[#faf9f6] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-stone-900 text-stone-50 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-serif font-bold text-stone-900">
                Meeting Assistant
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-mono">
                Active
              </span>
            </div>
            <p className="text-[11px] text-stone-500">Real-time notes & action extraction</p>
          </div>
        </div>

        <button
          onClick={() => setIsAiPanelOpen(false)}
          className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 text-xs"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 p-1 bg-stone-100/70 border-b border-stone-200 text-xs font-medium">
        <button
          onClick={() => setActiveAiTab('summary')}
          className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeAiTab === 'summary'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Summary</span>
        </button>

        <button
          onClick={() => setActiveAiTab('actions')}
          className={`py-2 rounded-lg flex flex-col items-center gap-1 relative transition-all ${
            activeAiTab === 'actions'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Actions</span>
          {actionItems.filter((a) => a.status !== 'completed').length > 0 && (
            <span className="absolute top-1 right-2 px-1.5 py-0.2 rounded-full bg-stone-800 text-white font-medium text-[9px]">
              {actionItems.filter((a) => a.status !== 'completed').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAiTab('copilot')}
          className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeAiTab === 'copilot'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Q&A</span>
        </button>

        <button
          onClick={() => setActiveAiTab('agenda')}
          className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeAiTab === 'agenda'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Agenda</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* SUMMARY TAB */}
        {activeAiTab === 'summary' && (
          <div className="space-y-4">
            {/* Quick Metrics Bar */}
            {aiSummary && (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#faf9f6] border border-stone-200 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-medium">Efficiency</span>
                    <p className="text-sm font-bold text-stone-900">
                      {aiSummary.meetingMetrics.efficiencyScore}%
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#faf9f6] border border-stone-200 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-stone-100 text-stone-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-medium">Tone</span>
                    <p className="text-xs font-semibold text-stone-800 truncate">
                      {aiSummary.sentiment.overall}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-stone-800 uppercase tracking-wider">
                Executive Overview
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopySummary}
                  disabled={!aiSummary}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200/70 border border-stone-200 text-[11px] text-stone-700 transition"
                >
                  {copiedSummary ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={generateSummary}
                  disabled={isGeneratingSummary}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-[11px] text-white transition shadow-xs"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingSummary ? 'Updating...' : 'Update'}</span>
                </button>
              </div>
            </div>

            {/* Summary Text */}
            {isGeneratingSummary && !aiSummary ? (
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin text-stone-600 mx-auto" />
                <p className="text-xs text-stone-600">Structuring meeting discussion points...</p>
              </div>
            ) : aiSummary ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-stone-200/90 text-xs text-stone-750 font-serif leading-relaxed space-y-2">
                  <p>{aiSummary.executiveSummary}</p>
                </div>

                {/* Key Decisions */}
                <div className="space-y-2">
                  <span className="text-xs font-serif font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-stone-700" />
                    Decisions & Consensus
                  </span>
                  <div className="space-y-2">
                    {aiSummary.decisions.map((decision, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 flex items-start gap-2.5"
                      >
                        <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </span>
                        <span>{decision}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discussion Points */}
                <div className="space-y-2">
                  <span className="text-xs font-serif font-bold text-stone-800 uppercase tracking-wider">
                    Discussion Highlights
                  </span>
                  <div className="space-y-1.5">
                    {aiSummary.keyDiscussionPoints.map((point, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 flex items-start gap-2"
                      >
                        <span className="text-stone-400 font-bold">•</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Keywords */}
                {aiSummary.meetingMetrics.topKeywords && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {aiSummary.meetingMetrics.topKeywords.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[11px] text-stone-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* ACTION ITEMS TAB */}
        {activeAiTab === 'actions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-stone-800 uppercase tracking-wider">
                Action Items ({actionItems.length})
              </span>
              <button
                onClick={() => setShowNewActionForm(!showNewActionForm)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800 transition shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Inline Add Action Form */}
            {showNewActionForm && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTaskTitle) return;
                  addNewActionItem(newTaskTitle, newTaskOwner, newTaskPriority, newTaskDueDate);
                  setNewTaskTitle('');
                  setShowNewActionForm(false);
                }}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-300 space-y-3"
              >
                <div>
                  <label className="text-[11px] text-stone-600 block mb-1">Task</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Confirm data migration schedule with DevOps"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-850 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Assignee</label>
                    <input
                      type="text"
                      value={newTaskOwner}
                      onChange={(e) => setNewTaskOwner(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-850"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Due Date</label>
                    <input
                      type="text"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-850"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-1.5">
                    {(['high', 'medium', 'low'] as const).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewTaskPriority(p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          newTaskPriority === p
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewActionForm(false)}
                      className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-xs bg-stone-900 hover:bg-stone-800 text-white font-medium px-3 py-1 rounded-lg"
                    >
                      Save Task
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List */}
            <div className="space-y-2.5">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.status === 'completed'
                      ? 'bg-stone-50 border-stone-200/80 opacity-60'
                      : 'bg-[#faf9f6] border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleActionItemStatus(item.id)}
                      className={`mt-0.5 p-1 rounded-md transition-colors ${
                        item.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-stone-400 hover:text-stone-800 border border-stone-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex-1">
                      <p
                        className={`text-xs font-medium leading-snug ${
                          item.status === 'completed'
                            ? 'line-through text-stone-400'
                            : 'text-stone-850'
                        }`}
                      >
                        {item.task}
                      </p>

                      <div className="mt-2.5 flex items-center gap-2 flex-wrap text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                          @{item.owner}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold uppercase text-[9px] ${
                            item.priority === 'high'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : item.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.priority}
                        </span>

                        <span className="text-stone-500 flex items-center gap-1 ml-auto text-[10px]">
                          <Clock className="w-3 h-3" />
                          {item.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Q&A ASSISTANT TAB */}
        {activeAiTab === 'copilot' && (
          <div className="flex flex-col h-full space-y-3">
            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => askCopilot(prompt)}
                  className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-[11px] text-stone-700 whitespace-nowrap transition shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {copilotMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-stone-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed space-y-1 ${
                      msg.role === 'user'
                        ? 'bg-stone-900 text-white rounded-tr-none'
                        : 'bg-[#faf9f6] border border-stone-200 text-stone-850 rounded-tl-none shadow-xs font-serif'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div className="text-[10px] opacity-60 text-right font-sans">{msg.timestamp}</div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isCopilotThinking && (
                <div className="flex gap-2.5 items-center">
                  <div className="w-7 h-7 rounded-full bg-stone-900 flex items-center justify-center text-white shrink-0 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500 flex items-center gap-2">
                    <span>Searching meeting context...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Box */}
            <form onSubmit={handleSendCopilot} className="pt-2">
              <div className="relative">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  placeholder="Ask a question about this meeting..."
                  className="w-full bg-[#faf9f6] border border-stone-200 focus:border-stone-400 rounded-2xl pl-3.5 pr-10 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none transition shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!copilotInput.trim() || isCopilotThinking}
                  className="absolute right-1.5 top-1.5 p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* AGENDA TAB */}
        {activeAiTab === 'agenda' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800">Agenda Progress</span>
                <span className="text-emerald-700 font-bold">
                  {meeting.agenda.filter((a) => a.completed).length} of {meeting.agenda.length} Done
                </span>
              </div>
              <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-stone-800 transition-all duration-300"
                  style={{
                    width: `${
                      (meeting.agenda.filter((a) => a.completed).length / meeting.agenda.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {meeting.agenda.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.completed
                      ? 'bg-stone-50 border-stone-200/80 opacity-75'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-1 rounded-md shrink-0 mt-0.5 ${
                        item.completed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-850">
                          {index + 1}. {item.title}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {item.durationMin}m
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-snug">{item.objective}</p>
                      <div className="pt-1 flex items-center gap-1.5 text-[10px] text-stone-600">
                        <span>Lead:</span>
                        <span className="font-medium bg-stone-100 px-1.5 py-0.5 rounded">
                          {item.lead}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
