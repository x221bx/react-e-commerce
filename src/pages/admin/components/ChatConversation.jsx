import React, { useEffect } from 'react';
import { User } from 'lucide-react';

const ChatConversation = ({
  selectedComplaint,
  isDark,
  lastMessageRef
}) => {
  // Combine all messages: original customer message, admin replies, and user follow-ups
  const allMessages = [
    // Original customer message
    {
      id: `original-customer-${selectedComplaint.id}`,
      message: selectedComplaint.description || selectedComplaint.message,
      sender: 'user',
      timestamp: selectedComplaint.createdAt,
      type: 'original'
    },
    // Admin replies
    ...(selectedComplaint.replies || []).map(reply => ({
      ...reply,
      sender: 'admin',
      type: 'admin'
    })),
    // User follow-ups
    ...(selectedComplaint.userMessages || []).map(msg => ({
      ...msg,
      sender: 'user',
      type: 'followup'
    }))
  ].sort((a, b) => {
    const aTime = a.timestamp?.seconds ? a.timestamp.seconds : new Date(a.timestamp).getTime() / 1000;
    const bTime = b.timestamp?.seconds ? b.timestamp.seconds : new Date(b.timestamp).getTime() / 1000;
    return aTime - bTime;
  });

  const flatMessages = allMessages;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (lastMessageRef.current) {
      setTimeout(() => {
        lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 150); // Slightly longer delay to ensure message is rendered
    }
  }, [selectedComplaint?.replies, selectedComplaint?.userMessages, flatMessages.length, selectedComplaint?.id]);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_50%,#f8fafc_100%)] dark:bg-slate-900/40">
      {/* Conversation Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Conversation
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
        }`}>
          {flatMessages.length} messages
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-4 scroll-smooth min-h-0 px-2 pb-4">
        {flatMessages.map((message, idx) => (
          <div
            key={message.id}
            ref={idx === flatMessages.length - 1 ? lastMessageRef : null}
            className={`flex w-full ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div className="flex flex-col gap-2 max-w-[75%]">
              <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full w-fit ${
                message.sender === 'user'
                  ? (isDark ? "bg-blue-900/70 text-blue-100" : "bg-blue-50 text-blue-700")
                  : (isDark ? "bg-emerald-800 text-emerald-50" : "bg-emerald-100 text-emerald-700")
              }`}>
                {message.sender === 'user' ? (
                  <>
                    <User className="w-4 h-4" />
                    <span>Customer</span>
                  </>
                ) : (
                  <>
                    <span>Support Team</span>
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`}></div>
                  </>
                )}
              </div>

              <div
                className={`relative rounded-2xl px-4 py-3 shadow-sm border ${
                  message.sender === 'user'
                    ? (isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900")
                    : (isDark ? "bg-emerald-700 border-emerald-600 text-white" : "bg-emerald-500 border-emerald-400 text-white")
                }`}
              >
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {message.message}
                </p>
                <p className={`text-[11px] mt-2 text-right ${message.sender === 'user' ? 'opacity-70' : 'opacity-80'}`}>
                  {message.timestamp?.toDate ? message.timestamp.toDate().toLocaleString() : new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatConversation;
