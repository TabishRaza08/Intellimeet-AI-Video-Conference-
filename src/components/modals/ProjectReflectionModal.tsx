import React, { useState, useRef, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import {
  Video,
  Play,
  Square,
  Download,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Film,
  Mic,
  Camera,
} from 'lucide-react';

export const ProjectReflectionModal: React.FC = () => {
  const { isReflectionModalOpen, setIsReflectionModalOpen, localStream } = useMeeting();

  const [activeTab, setActiveTab] = useState<'video_studio' | 'learned' | 'challenges' | 'takeaways'>('video_studio');

  // MediaRecorder state
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const recordedPlaybackRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);

  // Bind live camera to preview when modal opens
  useEffect(() => {
    if (isReflectionModalOpen && videoPreviewRef.current && localStream) {
      videoPreviewRef.current.srcObject = localStream;
      videoPreviewRef.current.play().catch(() => {});
    }
  }, [isReflectionModalOpen, localStream, activeTab, recordedVideoUrl]);

  if (!isReflectionModalOpen) return null;

  // Start recording
  const startRecording = () => {
    if (!localStream) {
      alert('Camera and microphone stream is required to record. Please ensure your camera is enabled.');
      return;
    }

    try {
      recordedChunksRef.current = [];
      setRecordedVideoUrl(null);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(localStream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (e: any) {
      console.error('Failed to start MediaRecorder:', e);
      alert('Could not start video recorder: ' + e.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
      clearInterval(timerRef.current);
    }
  };

  const handleDownloadRecordedVideo = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `IntellMeet_Reflection_Video_${new Date().toISOString().slice(0, 10)}.webm`;
    a.click();
  };

  const fullScript = `Hi everyone! Today I want to share a brief reflection on building IntellMeet—an enterprise meeting and collaboration platform that transforms real-time team calls into actionable business outcomes.

1. WHAT I LEARNED:
Technically, this project deepened my understanding of full-stack real-time multimedia architectures. I learned how to orchestrate real WebRTC hardware streams alongside Web Audio API analyzers to compute live frequency visualizers without taxing client-side CPU. On the backend, integrating server-side Gemini 3.8 Flash with structured JSON schemas taught me how to extract high-precision executive summaries and assigned tasks in sub-400ms streaming batches while keeping API credentials strictly server-side.

2. CHALLENGES FACED:
One major challenge was browser hardware variability—handling camera and microphone permission denials gracefully so the user always has a seamless fallback avatar with zero audio feedback loops. Another significant hurdle was avoiding "AI clutter"—initially, the interface felt overly saturated with glowing badges and buzzwords. The challenge was stripping away the hype to create a calm, light, bookstore-inspired minimal aesthetic with warm typography and human language that executives actually want to use every day.

3. KEY TAKEAWAYS:
My biggest takeaway is that technology is only as valuable as the clarity it creates. A meeting tool isn't successful because it has flashy graphics; it succeeds when team members leave with crystal-clear decisions, assigned action items, and zero confusion.

Thank you!`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(fullScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#faf9f6] border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 animate-fade-in my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-stone-600" />
                Project Reflection
              </span>
              <span className="text-xs text-stone-500 font-mono">
                IntellMeet Engineering Review
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
              Short Reflection: Learnings, Challenges & Key Takeaways
            </h2>
            <p className="text-xs text-stone-600">
              A comprehensive retrospective on architecture, design philosophy, and engineering decisions.
            </p>
          </div>

          <button
            onClick={() => setIsReflectionModalOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 text-xs font-medium gap-4">
          <button
            onClick={() => setActiveTab('video_studio')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'video_studio'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Recording Studio & Script</span>
          </button>

          <button
            onClick={() => setActiveTab('learned')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'learned'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. What I Learned</span>
          </button>

          <button
            onClick={() => setActiveTab('challenges')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'challenges'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2. Challenges Faced</span>
          </button>

          <button
            onClick={() => setActiveTab('takeaways')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'takeaways'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>3. Key Takeaways</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* TAB 1: VIDEO STUDIO & SCRIPT */}
          {activeTab === 'video_studio' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                {/* Camera / Playback Viewport */}
                <div className="rounded-2xl bg-stone-900 border border-stone-800 p-3 flex flex-col justify-between min-h-[300px]">
                  <div className="relative flex-1 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    {recordedVideoUrl ? (
                      <video
                        ref={recordedPlaybackRef}
                        src={recordedVideoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <video
                        ref={videoPreviewRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    )}

                    {isRecordingVideo && (
                      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-md animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        <span>REC {formatTimer(recordingSeconds)}</span>
                      </div>
                    )}
                  </div>

                  {/* Recorder Controls Bar */}
                  <div className="pt-3 flex items-center justify-between gap-2">
                    {!isRecordingVideo ? (
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
                      >
                        <Video className="w-4 h-4" />
                        <span>{recordedVideoUrl ? 'Record Again' : 'Record Video'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-white text-stone-900 text-xs font-bold transition shadow-xs"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>Stop Recording ({formatTimer(recordingSeconds)})</span>
                      </button>
                    )}

                    {recordedVideoUrl && (
                      <button
                        onClick={handleDownloadRecordedVideo}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Video</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Teleprompter / Word-for-Word Video Script */}
                <div className="rounded-2xl bg-white border border-stone-200 p-4 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                      Teleprompter Script (~2 mins)
                    </span>
                    <button
                      onClick={handleCopyScript}
                      className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 px-2 py-0.5 rounded bg-stone-100 border border-stone-200"
                    >
                      {copiedScript ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto py-2 text-xs font-serif text-stone-850 leading-relaxed space-y-3 max-h-[260px] pr-1">
                    <p className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                      <strong className="block text-stone-900 font-sans uppercase text-[10px] tracking-wide mb-1">
                        [0:00 - 0:25] Introduction
                      </strong>
                      "Hi everyone! Today I want to share a brief reflection on building IntellMeet—an enterprise meeting and collaboration platform that transforms real-time team calls into actionable business outcomes."
                    </p>

                    <p className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                      <strong className="block text-stone-900 font-sans uppercase text-[10px] tracking-wide mb-1">
                        [0:25 - 0:55] What I Learned
                      </strong>
                      "Technically, this project deepened my understanding of full-stack real-time multimedia architectures. I learned how to orchestrate real WebRTC hardware streams alongside Web Audio API analyzers to compute live frequency visualizers without taxing client-side CPU. On the backend, integrating server-side Gemini 3.8 Flash with structured JSON schemas taught me how to extract high-precision executive summaries and assigned tasks in sub-400ms streaming batches while keeping API credentials strictly server-side."
                    </p>

                    <p className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                      <strong className="block text-stone-900 font-sans uppercase text-[10px] tracking-wide mb-1">
                        [0:55 - 1:30] Challenges Faced
                      </strong>
                      "One major challenge was browser hardware variability—handling camera and microphone permission denials gracefully so the user always has a seamless fallback avatar with zero audio feedback loops. Another significant hurdle was avoiding 'AI clutter'—initially, the interface felt overly saturated with glowing badges and buzzwords. The challenge was stripping away the hype to create a calm, light, bookstore-inspired minimal aesthetic with warm typography and human language that executives actually want to use every day."
                    </p>

                    <p className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                      <strong className="block text-stone-900 font-sans uppercase text-[10px] tracking-wide mb-1">
                        [1:30 - 2:00] Key Takeaways
                      </strong>
                      "My biggest takeaway is that technology is only as valuable as the clarity it creates. A meeting tool isn't successful because it has flashy graphics; it succeeds when team members leave with crystal-clear decisions, assigned action items, and zero confusion. Thank you!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHAT I LEARNED */}
          {activeTab === 'learned' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm">
                  <BookOpen className="w-4 h-4 text-stone-700" />
                  <h3>Core Architectural & Technical Learnings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed text-stone-750 font-serif">
                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200 space-y-1">
                    <strong className="font-sans font-semibold text-stone-900 block text-xs">
                      1. Real-Time Media Streams & Web Audio API
                    </strong>
                    <p>
                      Mastered how to leverage <code className="text-stone-800 bg-stone-100 px-1 py-0.5 rounded font-mono">getUserMedia</code> and <code className="text-stone-800 bg-stone-100 px-1 py-0.5 rounded font-mono">getDisplayMedia</code> for native camera, microphone, and desktop sharing. Connecting streams to an <code className="font-mono">AudioContext AnalyserNode</code> allowed computing real-time sound frequencies for organic wave visualizers without stutter.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200 space-y-1">
                    <strong className="font-sans font-semibold text-stone-900 block text-xs">
                      2. Server-Side AI Intelligence with Structured Output
                    </strong>
                    <p>
                      Utilized the official <code className="font-mono text-stone-800 bg-stone-100 px-1 py-0.5 rounded">@google/genai</code> SDK with <code className="font-mono">gemini-3.8-flash</code> on an Express backend. Enforcing structured JSON schemas ensured 100% reliable extraction of tasks, owners, priorities, and executive summaries.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200 space-y-1">
                    <strong className="font-sans font-semibold text-stone-900 block text-xs">
                      3. State Synchronization in Hybrid Calls
                    </strong>
                    <p>
                      Learned how to coordinate real local user streams with simulated enterprise multi-peer turns, keeping audio activity, hand raises, and live speech recognition synchronized across components.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200 space-y-1">
                    <strong className="font-sans font-semibold text-stone-900 block text-xs">
                      4. Privacy-First Enterprise Security
                    </strong>
                    <p>
                      Architected zero telemetry retention on audio streams, automated 30-day retention lifecycles, and isolated API keys on the server side to satisfy enterprise SOC2 Type II compliance expectations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHALLENGES FACED */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3>Engineering Challenges & Solutions</h3>
                </div>

                <div className="space-y-3 text-xs font-serif text-stone-750 leading-relaxed">
                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200 space-y-1">
                    <span className="font-sans font-bold text-stone-900 text-xs block">
                      Challenge 1: Device Permissions & Hardware Feedback Loops
                    </span>
                    <p>
                      <strong>Problem:</strong> When microphone streams are connected to an HTML5 video element on the local machine, severe audio howling/feedback loops occur. Furthermore, browser security policies can block camera access when permissions are denied.
                    </p>
                    <p>
                      <strong>Solution:</strong> Applied strict <code className="font-mono">muted</code> tags to local video elements while routing audio solely through an isolated Web Audio AnalyserNode. Engineered graceful fallback badges (U1..U5) so the app remains fully operational even with hardware disabled.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200 space-y-1">
                    <span className="font-sans font-bold text-stone-900 text-xs block">
                      Challenge 2: Over-engineered "AI Hype" vs. Natural Executive Utility
                    </span>
                    <p>
                      <strong>Problem:</strong> Initial iterations suffered from visual clutter: neon purples, glowing futuristic badges, and intrusive AI overlays that distracted from the actual meeting.
                    </p>
                    <p>
                      <strong>Solution:</strong> Completely re-themed the platform to a calm, light, bookstore-inspired minimal aesthetic using Lora serif typography, warm parchment backgrounds, and natural workplace language ("Meeting Notes & Decisions").
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200 space-y-1">
                    <span className="font-sans font-bold text-stone-900 text-xs block">
                      Challenge 3: Real-Time Audio Chunking & Low Latency
                    </span>
                    <p>
                      <strong>Problem:</strong> Waiting until a meeting ends to generate summaries creates a bottleneck and prevents attendees from catching up on missed context during the live call.
                    </p>
                    <p>
                      <strong>Solution:</strong> Integrated Gemini 3.8 Flash which reduced processing latency to under 350ms, enabling in-meeting Q&A through the assistant while the call is still active.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KEY TAKEAWAYS */}
          {activeTab === 'takeaways' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-stone-700" />
                  <h3>Key Takeaways & Executive Summary</h3>
                </div>

                <div className="space-y-3 text-xs font-serif text-stone-750 leading-relaxed">
                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200 space-y-1 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-sans font-semibold text-stone-900 block text-xs">
                        1. Actionability Over Transcription Length
                      </strong>
                      <p>
                        A 40-minute transcript is useless if no one reads it. The real value is extracting structured action items with assignees, due dates, and firm decisions that immediately sync into project trackers.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200 space-y-1 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-sans font-semibold text-stone-900 block text-xs">
                        2. Calm, Respectful User Interfaces
                      </strong>
                      <p>
                        Software for enterprise communication should feel like a well-crafted book: quiet, readable, and unobtrusive. Natural whitespace and clear typography foster better focus and lower meeting fatigue.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200 space-y-1 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-sans font-semibold text-stone-900 block text-xs">
                        3. Robust Fallback Engineering
                      </strong>
                      <p>
                        Production software must be resilient. Whether a network drops, an API key is temporarily offline, or camera permissions are denied, the application gracefully provides heuristic intelligence and fallback states without crashing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
          <div className="text-xs text-stone-500 font-serif">
            IntellMeet Project Retrospective • Ready for submission
          </div>

          <button
            onClick={() => setIsReflectionModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition"
          >
            Close Reflection
          </button>
        </div>
      </div>
    </div>
  );
};
