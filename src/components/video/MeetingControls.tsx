import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Smile,
  Hand,
  Sparkles,
  MessageSquare,
  FileText,
  ListFilter,
  PhoneOff,
  LayoutGrid,
  Radio,
  UserPlus,
} from 'lucide-react';

export const MeetingControls: React.FC = () => {
  const {
    isMicMuted,
    isVideoOff,
    isScreenSharing,
    isRecording,
    isHandRaised,
    layoutMode,
    setLayoutMode,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    toggleRecording,
    toggleHandRaise,
    sendReaction,
    isAiPanelOpen,
    setIsAiPanelOpen,
    isChatOpen,
    setIsChatOpen,
    isNotesOpen,
    setIsNotesOpen,
    isTranscriptOpen,
    setIsTranscriptOpen,
    setIsInviteModalOpen,
    leaveMeeting,
    chatMessages,
    localAudioLevel,
  } = useMeeting();

  const [showReactionsMenu, setShowReactionsMenu] = useState(false);

  const emojis = ['👍', '👏', '🎉', '💡', '❤️', '🙌', '☕', '👀'];

  return (
    <div className="w-full bg-[#faf9f6] border-t border-stone-200/90 px-4 md:px-6 py-3 flex items-center justify-between gap-3 z-30 select-none shadow-xs">
      {/* Left Group: Recording & Layout */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleRecording}
          title={isRecording ? 'Meeting is being recorded' : 'Record meeting'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
            isRecording
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isRecording ? 'bg-rose-600 animate-pulse' : 'bg-stone-400'
            }`}
          />
          <span className="hidden sm:inline font-mono text-[11px]">
            {isRecording ? 'REC' : 'Record'}
          </span>
        </button>

        <div className="hidden md:flex items-center bg-stone-100 border border-stone-200 p-0.5 rounded-xl">
          <button
            onClick={() => setLayoutMode('grid')}
            title="Grid View"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              layoutMode === 'grid'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLayoutMode('spotlight')}
            title="Speaker Spotlight"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              layoutMode === 'spotlight'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 transition shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5 text-stone-500" />
          <span>Invite</span>
        </button>
      </div>

      {/* Center Group: Primary Audio/Video Media Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mic Control */}
        <div className="relative">
          <button
            onClick={toggleMic}
            className={`p-2.5 md:px-4 md:py-2.5 rounded-2xl flex items-center gap-2 text-xs font-medium transition-all shadow-xs ${
              isMicMuted
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50'
            }`}
            title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMicMuted ? (
              <MicOff className="w-4 h-4 text-rose-600" />
            ) : (
              <Mic className="w-4 h-4 text-emerald-600" />
            )}
            <span className="hidden md:inline">{isMicMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {!isMicMuted && (
            <div className="absolute -bottom-1 left-3 right-3 h-0.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-75"
                style={{ width: `${Math.min(100, localAudioLevel * 1.5)}%` }}
              />
            </div>
          )}
        </div>

        {/* Camera Control */}
        <button
          onClick={toggleVideo}
          className={`p-2.5 md:px-4 md:py-2.5 rounded-2xl flex items-center gap-2 text-xs font-medium transition-all shadow-xs ${
            isVideoOff
              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              : 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50'
          }`}
          title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
        >
          {isVideoOff ? (
            <VideoOff className="w-4 h-4 text-rose-600" />
          ) : (
            <Video className="w-4 h-4 text-stone-700" />
          )}
          <span className="hidden md:inline">{isVideoOff ? 'Camera Off' : 'Camera'}</span>
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`p-2.5 md:px-4 md:py-2.5 rounded-2xl flex items-center gap-2 text-xs font-medium transition-all shadow-xs ${
            isScreenSharing
              ? 'bg-stone-900 text-white border border-stone-800'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
          title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
        >
          <ScreenShare className="w-4 h-4" />
          <span className="hidden md:inline">{isScreenSharing ? 'Sharing' : 'Share'}</span>
        </button>

        {/* Reactions Picker */}
        <div className="relative">
          <button
            onClick={() => setShowReactionsMenu(!showReactionsMenu)}
            className={`p-2.5 rounded-2xl border transition-all shadow-xs ${
              showReactionsMenu
                ? 'bg-stone-100 border-stone-300 text-stone-900'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            title="Send Reaction"
          >
            <Smile className="w-4 h-4" />
          </button>

          {showReactionsMenu && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white border border-stone-200 rounded-2xl p-2 shadow-lg flex items-center gap-1.5 z-50 animate-fade-in">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    sendReaction(emoji);
                    setShowReactionsMenu(false);
                  }}
                  className="text-2xl hover:scale-125 transition-transform p-1.5 rounded-xl hover:bg-stone-100"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hand Raise */}
        <button
          onClick={toggleHandRaise}
          className={`p-2.5 rounded-2xl border transition-all shadow-xs ${
            isHandRaised
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
          title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* Leave Meeting */}
        <button
          onClick={leaveMeeting}
          className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition"
          title="End or Leave Call"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden md:inline">Leave</span>
        </button>
      </div>

      {/* Right Group: Utility Drawers */}
      <div className="flex items-center gap-2">
        {/* Meeting Assistant */}
        <button
          onClick={() => {
            setIsAiPanelOpen(!isAiPanelOpen);
            if (!isAiPanelOpen) {
              setIsChatOpen(false);
              setIsNotesOpen(false);
              setIsTranscriptOpen(false);
            }
          }}
          className={`px-3 py-2 rounded-2xl border flex items-center gap-2 text-xs font-medium transition-all shadow-xs ${
            isAiPanelOpen
              ? 'bg-stone-900 text-white border-stone-800'
              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
          title="Meeting Assistant & Summary"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden md:inline font-semibold">Assistant</span>
        </button>

        {/* Chat */}
        <button
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            if (!isChatOpen) {
              setIsAiPanelOpen(false);
              setIsNotesOpen(false);
              setIsTranscriptOpen(false);
            }
          }}
          className={`relative p-2.5 rounded-2xl border transition-colors shadow-xs ${
            isChatOpen
              ? 'bg-stone-100 border-stone-300 text-stone-900'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
          title="Live Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {chatMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-stone-800 text-[10px] text-white font-medium">
              {chatMessages.length}
            </span>
          )}
        </button>

        {/* Meeting Notes */}
        <button
          onClick={() => {
            setIsNotesOpen(!isNotesOpen);
            if (!isNotesOpen) {
              setIsAiPanelOpen(false);
              setIsChatOpen(false);
              setIsTranscriptOpen(false);
            }
          }}
          className={`p-2.5 rounded-2xl border transition-colors shadow-xs ${
            isNotesOpen
              ? 'bg-stone-100 border-stone-300 text-stone-900'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
          title="Shared Meeting Notes"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Transcript */}
        <button
          onClick={() => {
            setIsTranscriptOpen(!isTranscriptOpen);
            if (!isTranscriptOpen) {
              setIsAiPanelOpen(false);
              setIsChatOpen(false);
              setIsNotesOpen(false);
            }
          }}
          className={`p-2.5 rounded-2xl border transition-colors shadow-xs ${
            isTranscriptOpen
              ? 'bg-stone-100 border-stone-300 text-stone-900'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
          title="Speech Transcript"
        >
          <ListFilter className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
