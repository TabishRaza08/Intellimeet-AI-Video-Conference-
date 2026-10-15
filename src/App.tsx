import React from 'react';
import { MeetingProvider, useMeeting } from './context/MeetingContext';
import { TopNavBar } from './components/navigation/TopNavBar';
import { VideoConference } from './components/video/VideoConference';
import { MeetingControls } from './components/video/MeetingControls';
import { AiMeetingCopilot } from './components/ai/AiMeetingCopilot';
import { MeetingChat } from './components/chat/MeetingChat';
import { MeetingNotes } from './components/notes/MeetingNotes';
import { TranscriptDrawer } from './components/transcription/TranscriptDrawer';
import { InviteModal } from './components/modals/InviteModal';
import { PostMeetingReport } from './components/modals/PostMeetingReport';
import { WorkspaceHub } from './components/workspace/WorkspaceHub';

const MainAppContent: React.FC = () => {
  const { activeView } = useMeeting();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#faf9f6] text-stone-900 select-none">
      {/* Top Navigation & Status Bar */}
      <TopNavBar />

      {/* Main View Area */}
      <div className="flex-1 w-full min-h-0 relative flex overflow-hidden">
        {activeView === 'meeting' ? (
          <div className="flex-1 flex flex-col w-full h-full min-h-0 relative">
            <div className="flex-1 flex w-full h-full min-h-0 relative overflow-hidden">
              {/* Video Conference Viewport */}
              <VideoConference />

              {/* Side Drawers */}
              <AiMeetingCopilot />
              <MeetingChat />
              <MeetingNotes />
              <TranscriptDrawer />
            </div>

            {/* Bottom Meeting Controls Dock */}
            <MeetingControls />
          </div>
        ) : (
          <WorkspaceHub />
        )}
      </div>

      {/* Modals */}
      <InviteModal />
      <PostMeetingReport />
    </div>
  );
};

export default function App() {
  return (
    <MeetingProvider>
      <MainAppContent />
    </MeetingProvider>
  );
}
