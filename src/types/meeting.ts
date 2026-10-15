export type ConnectionQuality = 'hd' | 'good' | 'fair';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type ActionStatus = 'todo' | 'in_progress' | 'completed';

export interface Participant {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  isLocal: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0 to 100
  connectionQuality: ConnectionQuality;
  currentReaction?: string;
}

export interface TranscriptEntry {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole: string;
  speakerAvatar: string;
  text: string;
  timestamp: string; // "10:24 AM" or "04:12"
  isLocal?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  reactions: Record<string, number>;
  isAiBot?: boolean;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  ownerAvatar?: string;
  priority: PriorityLevel;
  dueDate: string;
  status: ActionStatus;
  context?: string;
  meetingId?: string;
  meetingTitle?: string;
}

export interface MeetingSummary {
  executiveSummary: string;
  keyDiscussionPoints: string[];
  decisions: string[];
  actionItems: Array<{
    task: string;
    owner: string;
    priority: PriorityLevel;
    dueDate: string;
    context?: string;
  }>;
  sentiment: {
    overall: string;
    score: number;
    summary: string;
  };
  meetingMetrics: {
    efficiencyScore: number;
    durationMinutes: number;
    topKeywords: string[];
  };
  followUpEmail?: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  durationMin: number;
  lead: string;
  completed: boolean;
  objective: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  active: boolean;
  userVotedOptionId?: string;
}

export interface MeetingSession {
  id: string;
  code: string;
  title: string;
  topic: string;
  scheduledTime?: string;
  startedAt: string;
  durationMinutes: number;
  participants: Participant[];
  transcript: TranscriptEntry[];
  summary?: MeetingSummary;
  whiteboardNotes: string;
  agenda: AgendaItem[];
  status: 'active' | 'scheduled' | 'ended';
  tags: string[];
}
