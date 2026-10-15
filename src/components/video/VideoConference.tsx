import React, { useRef, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import { VideoTile } from './VideoTile';
import { ScreenShare } from 'lucide-react';

export const VideoConference: React.FC = () => {
  const {
    participants,
    localStream,
    screenStream,
    isScreenSharing,
    layoutMode,
    floatingReactions,
  } = useMeeting();

  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
      screenVideoRef.current.play().catch((e) => console.warn('Screen playback error:', e));
    }
  }, [screenStream]);

  // Active speaker for spotlight
  const activeSpeaker =
    participants.find((p) => p.isSpeaking) ||
    participants.find((p) => !p.isLocal) ||
    participants[0];

  return (
    <div className="relative flex-1 w-full h-full p-4 md:p-6 overflow-hidden flex flex-col justify-between bg-[#f6f5f0]">
      {/* Floating Reactions Layer */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingReactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute bottom-20 animate-float-reaction text-4xl"
            style={{ left: `${reaction.x}%` }}
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {/* Main Video Viewport */}
      <div className="flex-1 w-full h-full min-h-0 relative flex items-center justify-center">
        {isScreenSharing && screenStream ? (
          /* Presentation / Screen Share View */
          <div className="w-full h-full flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Screen feed */}
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shadow-md flex items-center justify-center">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-xs border border-stone-200 text-xs text-stone-800 font-medium shadow-xs">
                <ScreenShare className="w-4 h-4 text-stone-700" />
                <span>You are presenting your screen</span>
              </div>
            </div>

            {/* Filmstrip */}
            <div className="w-full lg:w-64 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[160px] lg:max-h-full pb-2 lg:pb-0">
              {participants.map((p) => (
                <div key={p.id} className="min-w-[160px] lg:min-w-0 h-32 lg:h-36 shrink-0">
                  <VideoTile
                    participant={p}
                    mediaStream={p.isLocal ? localStream : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : layoutMode === 'spotlight' && activeSpeaker ? (
          /* Speaker Spotlight View */
          <div className="w-full h-full flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex-1 h-full min-h-0">
              <VideoTile
                participant={activeSpeaker}
                mediaStream={activeSpeaker.isLocal ? localStream : undefined}
                isSpotlight
              />
            </div>

            {/* Side Filmstrip */}
            <div className="w-full lg:w-64 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[160px] lg:max-h-full pb-2 lg:pb-0">
              {participants
                .filter((p) => p.id !== activeSpeaker.id)
                .map((p) => (
                  <div key={p.id} className="min-w-[160px] lg:min-w-0 h-32 lg:h-36 shrink-0">
                    <VideoTile
                      participant={p}
                      mediaStream={p.isLocal ? localStream : undefined}
                    />
                  </div>
                ))}
            </div>
          </div>
        ) : (
          /* Multi-Peer Grid View */
          <div
            className={`w-full h-full grid gap-4 ${
              participants.length <= 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto'
                : participants.length <= 4
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {participants.map((p) => (
              <VideoTile
                key={p.id}
                participant={p}
                mediaStream={p.isLocal ? localStream : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
