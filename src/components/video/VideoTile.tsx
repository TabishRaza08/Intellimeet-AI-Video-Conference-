import React, { useEffect, useRef } from 'react';
import { Participant } from '../../types/meeting';
import { Mic, MicOff, Hand, Wifi, User } from 'lucide-react';

interface VideoTileProps {
  participant: Participant;
  mediaStream?: MediaStream | null;
  isSpotlight?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  mediaStream,
  isSpotlight = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && mediaStream && !participant.isVideoOff) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((e) => console.warn('Video playback notice:', e));
    }
  }, [mediaStream, participant.isVideoOff]);

  const hasVideoStream = Boolean(mediaStream && !participant.isVideoOff);

  // Derive simple badge initials (e.g. U1, U2, U3)
  const userInitials = participant.avatar.startsWith('U')
    ? participant.avatar
    : participant.name.replace(/[^0-9]/g, '')
    ? `U${participant.name.replace(/[^0-9]/g, '')}`
    : 'U';

  return (
    <div
      className={`relative group rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-xs ${
        hasVideoStream
          ? 'bg-stone-900 border border-stone-800'
          : 'bg-[#f4f2eb] border border-stone-200/90 hover:border-stone-300'
      } ${
        participant.isSpeaking
          ? 'ring-2 ring-stone-900/40 border-stone-900/30 shadow-md'
          : ''
      } ${isSpotlight ? 'w-full h-full min-h-[420px]' : 'min-h-[200px] h-full'}`}
    >
      {/* Video stream OR Minimalist Neutral Initial Avatar (No face photo) */}
      {hasVideoStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className={`w-full h-full object-cover ${participant.isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#f7f6f1] to-[#edebe2]">
          <div className="relative">
            {/* Minimalist typography badge - NO photo faces */}
            <div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center font-serif font-bold text-2xl md:text-3xl shadow-xs transition-all ${
                participant.isSpeaking
                  ? 'bg-stone-900 text-stone-50 ring-2 ring-stone-800 scale-105'
                  : 'bg-white text-stone-800 border border-stone-200/90'
              }`}
            >
              {userInitials}
            </div>

            {participant.isSpeaking && (
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
                <span className="relative inline-flex rounded-full h-6 w-6 bg-stone-900 items-center justify-center text-white text-[10px] shadow-xs">
                  🎙️
                </span>
              </span>
            )}
          </div>

          <span className="mt-3.5 text-sm font-semibold text-stone-850">
            {participant.name}
          </span>
          <span className="text-xs text-stone-500 font-medium">{participant.role}</span>
        </div>
      )}

      {/* Top Bar inside Video Tile */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        {/* Hand Raised Notification */}
        {participant.isHandRaised && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-600 text-white text-xs font-medium shadow-sm animate-bounce">
            <Hand className="w-3.5 h-3.5" />
            <span>Hand Raised</span>
          </div>
        )}

        {/* Reaction Pop badge */}
        {participant.currentReaction && (
          <div className="text-2xl animate-bounce ml-auto bg-white/90 px-2 py-1 rounded-full border border-stone-200 shadow-sm backdrop-blur-xs">
            {participant.currentReaction}
          </div>
        )}

        {/* Connection Quality Tag */}
        <div
          className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono uppercase ${
            hasVideoStream
              ? 'bg-stone-950/70 text-stone-300 border border-stone-700/80'
              : 'bg-white/80 text-stone-600 border border-stone-200'
          }`}
        >
          <Wifi className="w-3 h-3 text-emerald-600" />
          <span>{participant.connectionQuality}</span>
        </div>
      </div>

      {/* Bottom Info Bar inside Video Tile */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
        <div
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs backdrop-blur-xs shadow-xs ${
            hasVideoStream
              ? 'bg-stone-950/80 text-stone-200 border border-stone-800'
              : 'bg-white/90 text-stone-800 border border-stone-200'
          }`}
        >
          {/* Mic indicator */}
          <span
            className={`p-1 rounded-full ${
              participant.isMuted
                ? 'bg-rose-100 text-rose-600'
                : participant.isSpeaking
                ? 'bg-emerald-100 text-emerald-700'
                : hasVideoStream
                ? 'bg-stone-800 text-stone-400'
                : 'bg-stone-100 text-stone-500'
            }`}
          >
            {participant.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          </span>

          <span className="font-medium truncate max-w-[130px] md:max-w-[180px]">
            {participant.name}
          </span>

          {participant.isLocal && (
            <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 text-[10px] font-semibold tracking-wide">
              YOU
            </span>
          )}

          {/* Sound wave bars */}
          {participant.isSpeaking && !participant.isMuted && (
            <div className="flex items-end gap-0.5 h-3 ml-1">
              <span className="w-0.5 bg-emerald-600 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-2"></span>
              <span className="w-0.5 bg-emerald-600 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3"></span>
              <span className="w-0.5 bg-emerald-600 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-2.5"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
