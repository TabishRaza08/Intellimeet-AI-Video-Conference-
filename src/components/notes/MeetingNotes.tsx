import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import { FileText, Sparkles, Copy, Check, Download, Users } from 'lucide-react';

export const MeetingNotes: React.FC = () => {
  const {
    isNotesOpen,
    setIsNotesOpen,
    meetingNotes,
    updateMeetingNotes,
    meeting,
  } = useMeeting();

  const [copied, setCopied] = useState(false);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);

  if (!isNotesOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([meetingNotes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, '_')}_Notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAutoFormat = () => {
    setIsAiEnhancing(true);
    setTimeout(() => {
      const enhanced = `${meetingNotes}\n\n## Action & Architecture Addendum (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})\n- Consolidated performance targets: 1280x720 video with Opus audio codec.\n- Deployment sequence approved for APAC cluster staging.\n- Action owner assigned: Devon Vance for security attestations.`;
      updateMeetingNotes(enhanced);
      setIsAiEnhancing(false);
    }, 600);
  };

  return (
    <div className="w-full md:w-96 lg:w-[420px] h-full bg-white border-l border-stone-200 flex flex-col z-20 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-stone-200/90 bg-[#faf9f6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-stone-700" />
          <div>
            <h3 className="text-sm font-serif font-bold text-stone-900">Meeting Notes</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Collaborative scratchpad</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsNotesOpen(false)}
          className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 text-xs"
        >
          ✕
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-2.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
        <button
          onClick={handleAutoFormat}
          disabled={isAiEnhancing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition font-medium shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{isAiEnhancing ? 'Formatting...' : 'Auto-Format Notes'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 transition shadow-xs"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 transition shadow-xs"
            title="Download Notes (.md)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Textarea Scratchpad */}
      <div className="flex-1 p-3 bg-[#fdfcf9]">
        <textarea
          value={meetingNotes}
          onChange={(e) => updateMeetingNotes(e.target.value)}
          placeholder="Jot down notes, decisions, links, and discussion points..."
          className="w-full h-full bg-transparent border border-stone-200/90 rounded-2xl p-4 text-xs font-serif text-stone-850 focus:outline-none focus:border-stone-400 resize-none leading-relaxed"
        />
      </div>
    </div>
  );
};
