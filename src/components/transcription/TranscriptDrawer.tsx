import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import { ListFilter, Search, Download, Clock } from 'lucide-react';

export const TranscriptDrawer: React.FC = () => {
  const {
    isTranscriptOpen,
    setIsTranscriptOpen,
    transcript,
    meeting,
    setIsAiPanelOpen,
    setActiveAiTab,
    generateSummary,
  } = useMeeting();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all');

  if (!isTranscriptOpen) return null;

  const speakers = Array.from(new Set(transcript.map((t) => t.speakerName)));

  const filtered = transcript.filter((entry) => {
    const matchesSearch =
      entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.speakerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpeaker = selectedSpeaker === 'all' || entry.speakerName === selectedSpeaker;
    return matchesSearch && matchesSpeaker;
  });

  const handleDownload = () => {
    const content = transcript
      .map((t) => `[${t.timestamp}] ${t.speakerName} (${t.speakerRole}):\n${t.text}\n`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, '_')}_Transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full md:w-96 lg:w-[420px] h-full bg-white border-l border-stone-200 flex flex-col z-20 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-stone-200/90 bg-[#faf9f6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-stone-700" />
          <div>
            <h3 className="text-sm font-serif font-bold text-stone-900">Meeting Transcript</h3>
            <span className="text-[10px] text-stone-500">
              {transcript.length} turns recorded • Audio log
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsTranscriptOpen(false)}
          className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 text-xs"
        >
          ✕
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-3 border-b border-stone-200 bg-stone-50 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, questions, phrases..."
            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <select
            value={selectedSpeaker}
            onChange={(e) => setSelectedSpeaker(e.target.value)}
            className="bg-white border border-stone-200 text-[11px] text-stone-700 rounded-lg px-2.5 py-1 focus:outline-none"
          >
            <option value="all">All Attendees ({speakers.length})</option>
            {speakers.map((spk) => (
              <option key={spk} value={spk}>
                {spk}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 px-2 py-1 rounded bg-white border border-stone-200 transition shadow-xs"
          >
            <Download className="w-3 h-3" />
            <span>Export TXT</span>
          </button>
        </div>
      </div>

      {/* Transcript Turns List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fcfbf8]">
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className={`p-3 rounded-2xl border transition-colors ${
              entry.isLocal
                ? 'bg-stone-100/70 border-stone-300'
                : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center font-serif text-[10px] font-bold">
                  {entry.speakerAvatar || 'U'}
                </div>
                <span className="text-xs font-semibold text-stone-850">
                  {entry.speakerName}
                </span>
                {entry.isLocal && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-200 text-stone-700 font-bold">
                    YOU
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                <Clock className="w-2.5 h-2.5" />
                {entry.timestamp}
              </span>
            </div>
            <p className="text-xs text-stone-750 font-serif leading-relaxed">{entry.text}</p>
          </div>
        ))}
      </div>

      {/* Bottom Action */}
      <div className="p-3 border-t border-stone-200 bg-[#faf9f6]">
        <button
          onClick={() => {
            setIsAiPanelOpen(true);
            setActiveAiTab('summary');
            generateSummary();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition"
        >
          <span>Extract Summary & Action Items</span>
        </button>
      </div>
    </div>
  );
};
