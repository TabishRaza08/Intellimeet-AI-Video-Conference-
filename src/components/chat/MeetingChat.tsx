import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import { Send, Vote, MessageSquare } from 'lucide-react';

export const MeetingChat: React.FC = () => {
  const {
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    sendChatMessage,
    activePoll,
    votePoll,
  } = useMeeting();

  const [activeTab, setActiveTab] = useState<'chat' | 'polls'>('chat');
  const [inputText, setInputText] = useState('');

  if (!isChatOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  return (
    <div className="w-full md:w-96 lg:w-[380px] h-full bg-white border-l border-stone-200 flex flex-col z-20 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-stone-200/90 bg-[#faf9f6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-stone-700" />
          <h3 className="text-sm font-serif font-bold text-stone-900">Meeting Chat & Polls</h3>
        </div>
        <button
          onClick={() => setIsChatOpen(false)}
          className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 text-xs"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-stone-100/60 p-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'chat'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Messages ({chatMessages.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('polls')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'polls'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Vote className="w-3.5 h-3.5" />
          <span>Team Polls</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {activeTab === 'chat' ? (
          <div className="space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center font-serif font-bold text-xs shrink-0 mt-0.5">
                  {msg.senderAvatar || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-800">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-stone-400">{msg.timestamp}</span>
                  </div>
                  <div className="mt-1 p-2.5 rounded-2xl bg-[#faf9f6] border border-stone-200 text-xs text-stone-800 leading-relaxed font-serif">
                    {msg.text}
                  </div>
                  {Object.keys(msg.reactions || {}).length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                        <span
                          key={emoji}
                          className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-[10px] text-stone-700 flex items-center gap-1"
                        >
                          <span>{emoji}</span>
                          <span className="font-semibold text-stone-500">{count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Live Polls Tab */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 text-[10px] font-semibold uppercase tracking-wider">
                  Open Poll
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {activePoll.totalVotes} responses
                </span>
              </div>

              <h4 className="text-xs font-serif font-bold text-stone-900 leading-snug">
                {activePoll.question}
              </h4>

              <div className="space-y-2 pt-1">
                {activePoll.options.map((option) => {
                  const percentage =
                    activePoll.totalVotes > 0
                      ? Math.round((option.votes / activePoll.totalVotes) * 100)
                      : 0;
                  const isUserPick = activePoll.userVotedOptionId === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => votePoll(option.id)}
                      className={`w-full text-left p-3 rounded-xl border relative overflow-hidden transition-all ${
                        isUserPick
                          ? 'border-stone-800 bg-stone-100/80 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 opacity-15 transition-all duration-300 ${
                          isUserPick ? 'bg-stone-900' : 'bg-stone-300'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between text-xs">
                        <span className={`font-medium ${isUserPick ? 'text-stone-950 font-semibold' : 'text-stone-700'}`}>
                          {option.text}
                        </span>
                        <span className="font-mono text-stone-500 text-[11px] shrink-0 ml-2">
                          {percentage}% ({option.votes})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {activeTab === 'chat' && (
        <form onSubmit={handleSend} className="p-3 border-t border-stone-200 bg-[#faf9f6]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send message to room..."
              className="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-2xl pl-3.5 pr-10 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-1.5 p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
