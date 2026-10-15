import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Participant,
  TranscriptEntry,
  ChatMessage,
  ActionItem,
  MeetingSession,
  MeetingSummary,
  Poll,
} from '../types/meeting';
import {
  INITIAL_PARTICIPANTS,
  INITIAL_TRANSCRIPT,
  INITIAL_ACTION_ITEMS,
  INITIAL_POLL,
  INITIAL_AGENDA,
  PAST_MEETINGS,
} from '../data/mockData';
import {
  initLocalUserMedia,
  initScreenShare,
  createAudioAnalyser,
} from '../services/mediaService';
import {
  LiveSpeechTranscriptionService,
  SIMULATED_ENTERPRISE_TURNS,
} from '../services/speechService';
import { requestMeetingSummary, askAiCopilot } from '../services/aiClient';
import confetti from 'canvas-confetti';

interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  x: number;
}

interface MeetingContextType {
  // Navigation
  activeView: 'meeting' | 'workspace';
  setActiveView: (view: 'meeting' | 'workspace') => void;
  layoutMode: 'grid' | 'spotlight' | 'presentation';
  setLayoutMode: (mode: 'grid' | 'spotlight' | 'presentation') => void;

  // Active Call State
  meeting: MeetingSession;
  participants: Participant[];
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMicMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  isHandRaised: boolean;
  isCaptionsEnabled: boolean;
  localAudioLevel: number;
  meetingDuration: number;
  cameraError: string | null;

  // Toggles & Panels
  isAiPanelOpen: boolean;
  setIsAiPanelOpen: (open: boolean) => void;
  activeAiTab: 'summary' | 'copilot' | 'actions' | 'agenda';
  setActiveAiTab: (tab: 'summary' | 'copilot' | 'actions' | 'agenda') => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isNotesOpen: boolean;
  setIsNotesOpen: (open: boolean) => void;
  isTranscriptOpen: boolean;
  setIsTranscriptOpen: (open: boolean) => void;
  isInviteModalOpen: boolean;
  setIsInviteModalOpen: (open: boolean) => void;
  isPostMeetingModalOpen: boolean;
  setIsPostMeetingModalOpen: (open: boolean) => void;
  isReflectionModalOpen: boolean;
  setIsReflectionModalOpen: (open: boolean) => void;

  // Actions & Controls
  toggleMic: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  toggleRecording: () => void;
  toggleHandRaise: () => void;
  toggleCaptions: () => void;
  sendReaction: (emoji: string) => void;
  floatingReactions: FloatingReaction[];

  // Transcripts
  transcript: TranscriptEntry[];
  currentClosedCaption: string | null;
  addTranscriptEntry: (text: string, isLocal?: boolean) => void;

  // Chat & Polls
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  activePoll: Poll;
  votePoll: (optionId: string) => void;

  // Whiteboard / Meeting Notes
  meetingNotes: string;
  updateMeetingNotes: (notes: string) => void;

  // Action Items
  actionItems: ActionItem[];
  toggleActionItemStatus: (id: string) => void;
  addNewActionItem: (task: string, owner: string, priority: 'high' | 'medium' | 'low', dueDate: string) => void;

  // AI Intelligence
  aiSummary: MeetingSummary | null;
  isGeneratingSummary: boolean;
  generateSummary: () => Promise<void>;
  copilotMessages: Array<{ role: 'user' | 'assistant'; text: string; poweredBy?: string; timestamp: string }>;
  isCopilotThinking: boolean;
  askCopilot: (query: string) => Promise<void>;

  // Call End & Past Meetings
  leaveMeeting: () => void;
  pastMeetings: MeetingSession[];
  loadMeetingDetails: (session: MeetingSession) => void;
  startNewMeeting: (title?: string) => void;
}

const MeetingContext = createContext<MeetingContextType | null>(null);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<'meeting' | 'workspace'>('meeting');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'spotlight' | 'presentation'>('grid');

  // Meeting Session
  const [meeting, setMeeting] = useState<MeetingSession>({
    id: 'meet-active-001',
    code: 'meet-intel-4029',
    title: 'Enterprise Architecture & Strategy Sync',
    topic: 'Real-time WebRTC, Performance Tuning, Security Standards',
    startedAt: 'Just now',
    durationMinutes: 18,
    participants: INITIAL_PARTICIPANTS,
    transcript: INITIAL_TRANSCRIPT,
    whiteboardNotes: `# Enterprise Architecture & Strategy Sync\n\n## Objective\nSign off on sub-100ms real-time audio pipeline and automated post-meeting action item extraction.\n\n## Key Decisions\n- Use WebRTC adaptive bitrates for resilient connections.\n- Stream transcript data directly to meeting intelligence service.\n- Enforce AES-256 GCM encryption at rest.\n\n## Notes\n- User 2 presented container cluster benchmarks.\n- User 4 demonstrated low extraction latency on audio streams.\n- User 5 confirmed compliance sign-off is scheduled for Friday.`,
    agenda: INITIAL_AGENDA,
    status: 'active',
    tags: ['Architecture', 'Engineering', 'Security', 'Enterprise'],
  });

  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>(INITIAL_TRANSCRIPT);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      senderId: 'peer-1',
      senderName: 'User 2',
      senderAvatar: 'U2',
      text: 'Good morning team. Telemetry and connection stability look solid today.',
      timestamp: '10:01 AM',
      reactions: { '👍': 4 },
    },
    {
      id: 'm-2',
      senderId: 'peer-3',
      senderName: 'User 4',
      senderAvatar: 'U4',
      text: 'Adding latency benchmark notes to the shared document.',
      timestamp: '10:05 AM',
      reactions: { '💡': 2 },
    },
  ]);
  const [actionItems, setActionItems] = useState<ActionItem[]>(INITIAL_ACTION_ITEMS);
  const [activePoll, setActivePoll] = useState<Poll>(INITIAL_POLL);
  const [meetingNotes, setMeetingNotes] = useState<string>(meeting.whiteboardNotes);
  const [pastMeetings, setPastMeetings] = useState<MeetingSession[]>(PAST_MEETINGS);

  // Local media states
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  // CAPTIONS REMOVED / DISABLED
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState(false);
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [meetingDuration, setMeetingDuration] = useState(1080);

  // UI Drawers & Modals
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [activeAiTab, setActiveAiTab] = useState<'summary' | 'copilot' | 'actions' | 'agenda'>('summary');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPostMeetingModalOpen, setIsPostMeetingModalOpen] = useState(false);
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);

  // Floating Reactions
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [currentClosedCaption, setCurrentClosedCaption] = useState<string | null>(null);

  // AI Summary & Copilot State
  const [aiSummary, setAiSummary] = useState<MeetingSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; poweredBy?: string; timestamp: string }>
  >([
    {
      role: 'assistant',
      text: `Hello User 1! I am your meeting assistant. I am tracking discussion points, decisions, and action items in real time. You can ask me:
- *"What did User 5 confirm about compliance?"*
- *"Summarize decisions on deployment"*
- *"Draft a follow-up email"*\nHow can I help?`,
      poweredBy: 'Meeting Assistant',
      timestamp: '10:12 AM',
    },
  ]);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // Services references
  const speechServiceRef = useRef<LiveSpeechTranscriptionService | null>(null);
  const audioAnalyserCleanupRef = useRef<(() => void) | null>(null);
  const simulationIntervalRef = useRef<any>(null);

  // Meeting duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Speech Recognition Service
  useEffect(() => {
    speechServiceRef.current = new LiveSpeechTranscriptionService();
  }, []);

  // Initialize Local Media Stream
  useEffect(() => {
    let mounted = true;

    async function setupCamera() {
      const res = await initLocalUserMedia(!isMicMuted, !isVideoOff);
      if (!mounted) return;

      if (res.stream) {
        setLocalStream(res.stream);
        setCameraError(null);

        // Setup audio analyzer
        const analyser = createAudioAnalyser(res.stream, (volume) => {
          if (!mounted) return;
          if (!isMicMuted) {
            setLocalAudioLevel(volume);
            setParticipants((prev) =>
              prev.map((p) => (p.isLocal ? { ...p, audioLevel: volume, isSpeaking: volume > 15 } : p))
            );
          } else {
            setLocalAudioLevel(0);
          }
        });
        audioAnalyserCleanupRef.current = analyser.cleanup;

        // Start live speech recognition if supported
        if (speechServiceRef.current && speechServiceRef.current.isSupported() && !isMicMuted) {
          speechServiceRef.current.startListening((result) => {
            if (!mounted) return;
            if (result.text && result.isFinal) {
              addTranscriptEntry(result.text, true);
            }
          });
        }
      } else if (res.error) {
        setCameraError(res.error);
      }
    }

    setupCamera();

    return () => {
      mounted = false;
      if (audioAnalyserCleanupRef.current) {
        audioAnalyserCleanupRef.current();
      }
      if (speechServiceRef.current) {
        speechServiceRef.current.stopListening();
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Simulated peer speaking rotation
  useEffect(() => {
    let turnIndex = 0;
    simulationIntervalRef.current = setInterval(() => {
      const turn = SIMULATED_ENTERPRISE_TURNS[turnIndex % SIMULATED_ENTERPRISE_TURNS.length];
      turnIndex++;

      setParticipants((prev) =>
        prev.map((p) => {
          if (p.id === turn.speakerId) {
            return { ...p, isSpeaking: true, audioLevel: Math.floor(Math.random() * 40) + 45 };
          }
          return { ...p, isSpeaking: p.isLocal ? p.isSpeaking : false, audioLevel: p.isLocal ? p.audioLevel : 0 };
        })
      );

      const newEntry: TranscriptEntry = {
        id: `t-sim-${Date.now()}`,
        speakerId: turn.speakerId,
        speakerName: turn.speakerName,
        speakerRole: turn.speakerRole,
        speakerAvatar: turn.speakerAvatar,
        text: turn.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTranscript((prev) => [...prev, newEntry]);

      setTimeout(() => {
        setParticipants((prev) =>
          prev.map((p) => (p.id === turn.speakerId ? { ...p, isSpeaking: false, audioLevel: 0 } : p))
        );
      }, 4000);
    }, 18000);

    return () => clearInterval(simulationIntervalRef.current);
  }, []);

  // Add transcript entry helper
  const addTranscriptEntry = useCallback((text: string, isLocal = false) => {
    const newEntry: TranscriptEntry = {
      id: `t-${Date.now()}`,
      speakerId: isLocal ? 'user-local' : 'peer-sim',
      speakerName: isLocal ? 'User 1 (You)' : 'Participant',
      speakerRole: isLocal ? 'Host' : 'Participant',
      speakerAvatar: isLocal ? 'U1' : 'U2',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLocal,
    };
    setTranscript((prev) => [...prev, newEntry]);
  }, []);

  // Controls
  const toggleMic = useCallback(() => {
    setIsMicMuted((prev) => {
      const next = !prev;
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      setParticipants((list) =>
        list.map((p) => (p.isLocal ? { ...p, isMuted: next, audioLevel: next ? 0 : p.audioLevel } : p))
      );
      if (next && speechServiceRef.current) {
        speechServiceRef.current.stopListening();
      }
      return next;
    });
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    setIsVideoOff((prev) => {
      const next = !prev;
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      setParticipants((list) =>
        list.map((p) => (p.isLocal ? { ...p, isVideoOff: next } : p))
      );
      return next;
    });
  }, [localStream]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      setLayoutMode('grid');
    } else {
      const res = await initScreenShare();
      if (res.stream) {
        setScreenStream(res.stream);
        setIsScreenSharing(true);
        setLayoutMode('presentation');

        res.stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
          setLayoutMode('grid');
        };
      }
    }
  }, [isScreenSharing, screenStream]);

  const toggleRecording = useCallback(() => {
    setIsRecording((prev) => !prev);
  }, []);

  const toggleHandRaise = useCallback(() => {
    setIsHandRaised((prev) => {
      const next = !prev;
      setParticipants((list) =>
        list.map((p) => (p.isLocal ? { ...p, isHandRaised: next } : p))
      );
      return next;
    });
  }, []);

  const toggleCaptions = useCallback(() => {
    setIsCaptionsEnabled((prev) => !prev);
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    const id = `react-${Date.now()}-${Math.random()}`;
    const x = Math.floor(Math.random() * 70) + 15;
    setFloatingReactions((prev) => [...prev, { id, emoji, senderName: 'User 1', x }]);

    setParticipants((list) =>
      list.map((p) => (p.isLocal ? { ...p, currentReaction: emoji } : p))
    );

    setTimeout(() => {
      setParticipants((list) =>
        list.map((p) => (p.isLocal ? { ...p, currentReaction: undefined } : p))
      );
    }, 2500);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2400);
  }, []);

  const sendChatMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-local',
      senderName: 'User 1 (You)',
      senderAvatar: 'U1',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
    };
    setChatMessages((prev) => [...prev, newMsg]);
  }, []);

  const votePoll = useCallback((optionId: string) => {
    setActivePoll((prev) => {
      if (prev.userVotedOptionId === optionId) return prev;
      return {
        ...prev,
        userVotedOptionId: optionId,
        totalVotes: prev.totalVotes + 1,
        options: prev.options.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        ),
      };
    });
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
  }, []);

  const updateMeetingNotes = useCallback((notes: string) => {
    setMeetingNotes(notes);
  }, []);

  const toggleActionItemStatus = useCallback((id: string) => {
    setActionItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'completed' ? 'todo' : 'completed';
          if (nextStatus === 'completed') {
            confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
          }
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  }, []);

  const addNewActionItem = useCallback(
    (task: string, owner: string, priority: 'high' | 'medium' | 'low', dueDate: string) => {
      const newItem: ActionItem = {
        id: `act-${Date.now()}`,
        task,
        owner,
        ownerAvatar: owner === 'User 1' ? 'U1' : 'U2',
        priority,
        dueDate,
        status: 'todo',
        meetingTitle: meeting.title,
      };
      setActionItems((prev) => [newItem, ...prev]);
    },
    [meeting.title]
  );

  // AI Meeting Intelligence Generator
  const generateSummary = useCallback(async () => {
    setIsGeneratingSummary(true);
    try {
      const agendaTitles = meeting.agenda.map((a) => a.title);
      const res = await requestMeetingSummary(transcript, meeting.title, agendaTitles);
      setAiSummary(res.summary);

      if (res.summary.actionItems && res.summary.actionItems.length > 0) {
        const mappedItems: ActionItem[] = res.summary.actionItems.map((item, idx) => ({
          id: `act-gen-${Date.now()}-${idx}`,
          task: item.task,
          owner: item.owner || 'User 1',
          ownerAvatar: 'U1',
          priority: item.priority || 'medium',
          dueDate: item.dueDate || 'Next Sprint',
          status: 'todo',
          context: item.context,
          meetingTitle: meeting.title,
        }));

        setActionItems((prev) => {
          const existingTasks = new Set(prev.map((p) => p.task.toLowerCase()));
          const novelItems = mappedItems.filter((m) => !existingTasks.has(m.task.toLowerCase()));
          return [...novelItems, ...prev];
        });
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [transcript, meeting]);

  useEffect(() => {
    generateSummary();
  }, []);

  const askCopilot = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      const userMsg = {
        role: 'user' as const,
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCopilotMessages((prev) => [...prev, userMsg]);
      setIsCopilotThinking(true);

      try {
        const res = await askAiCopilot(query, transcript, meeting.title);
        const assistantMsg = {
          role: 'assistant' as const,
          text: res.answer,
          poweredBy: res.poweredBy,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setCopilotMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        const errorMsg = {
          role: 'assistant' as const,
          text: `Could not retrieve meeting intelligence: ${err.message}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setCopilotMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsCopilotThinking(false);
      }
    },
    [transcript, meeting.title]
  );

  const leaveMeeting = useCallback(() => {
    setIsPostMeetingModalOpen(true);
  }, []);

  const loadMeetingDetails = useCallback((session: MeetingSession) => {
    setMeeting(session);
    setTranscript(session.transcript);
    setMeetingNotes(session.whiteboardNotes);
    if (session.summary) {
      setAiSummary(session.summary);
    }
    setActiveView('meeting');
  }, []);

  const startNewMeeting = useCallback((title?: string) => {
    const randomCode = `meet-${Math.random().toString(36).substring(2, 6)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newSession: MeetingSession = {
      id: `meet-new-${Date.now()}`,
      code: randomCode,
      title: title || 'Executive Strategy Session',
      topic: 'Team Deliverables & Action Items',
      startedAt: 'Just now',
      durationMinutes: 0,
      participants: INITIAL_PARTICIPANTS,
      transcript: INITIAL_TRANSCRIPT.slice(0, 3),
      whiteboardNotes: `# ${title || 'Executive Strategy Session'}\n\n- Meeting Code: ${randomCode}\n- Date: ${new Date().toLocaleDateString()}\n\n## Action Items\n`,
      agenda: INITIAL_AGENDA,
      status: 'active',
      tags: ['Strategy', 'Sprint', 'Planning'],
    };
    setMeeting(newSession);
    setMeetingDuration(0);
    setTranscript(newSession.transcript);
    setMeetingNotes(newSession.whiteboardNotes);
    setActiveView('meeting');
    generateSummary();
  }, [generateSummary]);

  return (
    <MeetingContext.Provider
      value={{
        activeView,
        setActiveView,
        layoutMode,
        setLayoutMode,
        meeting,
        participants,
        localStream,
        screenStream,
        isMicMuted,
        isVideoOff,
        isScreenSharing,
        isRecording,
        isHandRaised,
        isCaptionsEnabled,
        localAudioLevel,
        meetingDuration,
        cameraError,
        isAiPanelOpen,
        setIsAiPanelOpen,
        activeAiTab,
        setActiveAiTab,
        isChatOpen,
        setIsChatOpen,
        isNotesOpen,
        setIsNotesOpen,
        isTranscriptOpen,
        setIsTranscriptOpen,
        isInviteModalOpen,
        setIsInviteModalOpen,
        isPostMeetingModalOpen,
        setIsPostMeetingModalOpen,
        isReflectionModalOpen,
        setIsReflectionModalOpen,
        toggleMic,
        toggleVideo,
        toggleScreenShare,
        toggleRecording,
        toggleHandRaise,
        toggleCaptions,
        sendReaction,
        floatingReactions,
        transcript,
        currentClosedCaption,
        addTranscriptEntry,
        chatMessages,
        sendChatMessage,
        activePoll,
        votePoll,
        meetingNotes,
        updateMeetingNotes,
        actionItems,
        toggleActionItemStatus,
        addNewActionItem,
        aiSummary,
        isGeneratingSummary,
        generateSummary,
        copilotMessages,
        isCopilotThinking,
        askCopilot,
        leaveMeeting,
        pastMeetings,
        loadMeetingDetails,
        startNewMeeting,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
}
