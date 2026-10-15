import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import {
  CheckCircle2,
  ListTodo,
  Mail,
  Copy,
  Check,
  Download,
  TrendingUp,
  Clock,
  Users,
  ShieldCheck,
  ArrowRight,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PostMeetingReport: React.FC = () => {
  const {
    isPostMeetingModalOpen,
    setIsPostMeetingModalOpen,
    meeting,
    aiSummary,
    actionItems,
    toggleActionItemStatus,
    setActiveView,
    participants,
  } = useMeeting();

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedFullDigest, setCopiedFullDigest] = useState(false);
  const [activeTab, setActiveTab] = useState<'digest' | 'actions' | 'email'>('digest');

  if (!isPostMeetingModalOpen) return null;

  const handleCopyEmail = () => {
    if (aiSummary?.followUpEmail) {
      navigator.clipboard.writeText(aiSummary.followUpEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyFullDigest = () => {
    if (!aiSummary) return;
    const digest = `# ${meeting.title} - Meeting Briefing\nDate: ${new Date().toLocaleDateString()}\n\n## Summary\n${aiSummary.executiveSummary}\n\n## Decisions\n${aiSummary.decisions.map((d) => `- ${d}`).join('\n')}\n\n## Action Items\n${actionItems.map((a) => `- [ ] ${a.task} (@${a.owner}, due: ${a.dueDate})`).join('\n')}`;
    navigator.clipboard.writeText(digest);
    setCopiedFullDigest(true);
    setTimeout(() => setCopiedFullDigest(false), 2000);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  const handleDownloadReport = () => {
    if (!aiSummary) return;
    const report = `# ${meeting.title} - Meeting Briefing\n\n## Summary\n${aiSummary.executiveSummary}\n\n## Key Discussion Points\n${aiSummary.keyDiscussionPoints.map((p) => `* ${p}`).join('\n')}\n\n## Decisions\n${aiSummary.decisions.map((d) => `* ${d}`).join('\n')}\n\n## Action Items\n${actionItems.map((a) => `* [${a.status.toUpperCase()}] ${a.task} - Assignee: ${a.owner} (Due: ${a.dueDate})`).join('\n')}\n\n## Email Draft\n${aiSummary.followUpEmail || ''}`;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, '_')}_Summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#faf9f6] border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 animate-fade-in my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Meeting Concluded
              </span>
              <span className="text-xs text-stone-500 font-mono">
                {meeting.code}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
              {meeting.title}
            </h2>
            <p className="text-xs text-stone-500">
              Executive Briefing, Decisions & Action Item Records
            </p>
          </div>

          <button
            onClick={() => setIsPostMeetingModalOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100"
          >
            ✕
          </button>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Duration</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {aiSummary?.meetingMetrics.durationMinutes || 24} mins
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Efficiency</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {aiSummary?.meetingMetrics.efficiencyScore || 94}%
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Attendees</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {participants.length} Active
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tone</span>
            </div>
            <div className="text-xs font-semibold text-stone-800 truncate">
              {aiSummary?.sentiment.overall || 'Productive'}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-stone-200 text-xs font-medium gap-4">
          <button
            onClick={() => setActiveTab('digest')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'digest'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Briefing</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'actions'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Action Items ({actionItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'email'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Follow-up Email</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'digest' && aiSummary && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-800 font-serif leading-relaxed space-y-2 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block font-sans">
                  Overview Summary
                </span>
                <p>{aiSummary.executiveSummary}</p>
              </div>

              {/* Decisions */}
              <div className="space-y-2">
                <span className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-700" />
                  Agreed Decisions
                </span>
                <div className="space-y-2">
                  {aiSummary.decisions.map((dec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 flex items-start gap-2.5 shadow-xs"
                    >
                      <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{dec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Check off deliverables as they are resolved</span>
                <span>
                  {actionItems.filter((a) => a.status === 'completed').length} of {actionItems.length} Resolved
                </span>
              </div>

              <div className="space-y-2">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                      item.status === 'completed'
                        ? 'bg-stone-50 border-stone-200 opacity-60'
                        : 'bg-white border-stone-200 shadow-xs'
                    }`}
                  >
                    <button
                      onClick={() => toggleActionItemStatus(item.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        item.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-stone-400 hover:text-stone-800 border border-stone-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex-1">
                      <p
                        className={`text-xs font-medium ${
                          item.status === 'completed'
                            ? 'line-through text-stone-400'
                            : 'text-stone-850'
                        }`}
                      >
                        {item.task}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                        <span className="text-stone-800 font-medium">@{item.owner}</span>
                        <span>•</span>
                        <span>Due: {item.dueDate}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.priority === 'high'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.priority === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">
                  Follow-up Communication
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition shadow-xs"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs font-serif text-stone-800 whitespace-pre-wrap leading-relaxed shadow-xs">
                {aiSummary?.followUpEmail ||
                  `Hi Team,\n\nThanks for participating in today's ${meeting.title}. All action items have been captured in the workspace.\n\nBest,\nUser 1`}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFullDigest}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200 transition shadow-xs"
            >
              {copiedFullDigest ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFullDigest ? 'Copied Digest' : 'Copy Briefing'}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.md)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPostMeetingModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-800 transition"
            >
              Return to Call
            </button>

            <button
              onClick={() => {
                setIsPostMeetingModalOpen(false);
                setActiveView('workspace');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
