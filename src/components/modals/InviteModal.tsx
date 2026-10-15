import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import { UserPlus, Copy, Check, Mail, Shield } from 'lucide-react';

export const InviteModal: React.FC = () => {
  const { isInviteModalOpen, setIsInviteModalOpen, meeting } = useMeeting();
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [sentInvite, setSentInvite] = useState(false);

  if (!isInviteModalOpen) return null;

  const meetingUrl = `${window.location.origin}/#${meeting.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setSentInvite(true);
    setTimeout(() => {
      setSentInvite(false);
      setInviteEmail('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#faf9f6] border border-stone-200 rounded-3xl p-6 md:p-7 shadow-xl space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">Invite Attendees</h3>
              <p className="text-xs text-stone-500">Add team members to {meeting.title}</p>
            </div>
          </div>
          <button
            onClick={() => setIsInviteModalOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100"
          >
            ✕
          </button>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700">Meeting Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={meetingUrl}
              className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-800 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition shadow-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Send Email Form */}
        <form onSubmit={handleSendEmail} className="space-y-2">
          <label className="text-xs font-semibold text-stone-700">Email Invitation</label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
            />
            <button
              type="submit"
              disabled={!inviteEmail}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium border border-stone-200 transition disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5 text-stone-600" />
              <span>{sentInvite ? 'Sent' : 'Invite'}</span>
            </button>
          </div>
          {sentInvite && (
            <p className="text-[11px] text-emerald-700 font-medium">
              Calendar invite sent to {inviteEmail}.
            </p>
          )}
        </form>

        {/* Security Notice */}
        <div className="p-3 rounded-2xl bg-white border border-stone-200/90 flex items-center gap-2.5 text-xs text-stone-500">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Access requires verified company authentication or approved guest admission.</span>
        </div>
      </div>
    </div>
  );
};
