import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import {
  Video,
  Clock,
  Copy,
  Check,
  LayoutDashboard,
  Radio,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const TopNavBar: React.FC = () => {
  const {
    meeting,
    activeView,
    setActiveView,
    meetingDuration,
    setIsInviteModalOpen,
    participants,
  } = useMeeting();

  const [copiedCode, setCopiedCode] = useState(false);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(meeting.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <header className="w-full bg-[#faf9f6] border-b border-stone-200/90 px-4 md:px-6 py-3 flex items-center justify-between gap-3 z-30 select-none transition-colors">
      {/* Brand & Meeting Title */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-stone-900 flex items-center justify-center text-stone-50 shadow-sm">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-stone-900 tracking-tight">
                IntellMeet
              </span>
              <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-medium uppercase tracking-wider">
                Enterprise
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500">
              <span className="truncate max-w-[200px] md:max-w-[320px] font-medium text-stone-700">
                {meeting.title}
              </span>
            </div>
          </div>
        </div>

        {/* Room Code Pill */}
        <button
          onClick={handleCopyCode}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200/70 border border-stone-200/80 text-xs text-stone-700 transition"
          title="Click to copy meeting code"
        >
          <span className="font-mono text-stone-800 font-medium">{meeting.code}</span>
          {copiedCode ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-stone-400" />
          )}
        </button>
      </div>

      {/* Center Details */}
      <div className="flex items-center gap-2.5">
        {/* Timer */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-xs font-mono font-medium text-stone-700 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span>{formatTimer(meetingDuration)}</span>
        </div>

        {/* Attendees Count */}
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-700 transition shadow-xs"
          title="View & invite attendees"
        >
          <Users className="w-3.5 h-3.5 text-stone-500" />
          <span className="font-semibold">{participants.length}</span>
        </button>

        {/* Security indicator */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-[11px] text-emerald-800 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Sync</span>
        </div>
      </div>

      {/* Right Controls: View Switcher & Profile Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/80">
          <button
            onClick={() => setActiveView('meeting')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'meeting'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-stone-500" />
            <span>Call Room</span>
          </button>

          <button
            onClick={() => setActiveView('workspace')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'workspace'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-stone-500" />
            <span>Workspace</span>
          </button>
        </div>

        {/* User 1 Badge (No face photo) */}
        <div className="flex items-center pl-1">
          <div className="w-8 h-8 rounded-xl bg-stone-800 text-white font-serif font-bold text-xs flex items-center justify-center shadow-xs">
            U1
          </div>
        </div>
      </div>
    </header>
  );
};
