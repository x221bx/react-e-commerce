import React, { useEffect } from 'react';
import { User } from 'lucide-react';

const ChatConversation = ({
  selectedComplaint,
  isDark,
  lastMessageRef
}) => {
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (lastMessageRef.current) {
      setTimeout(() => {
        lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [selectedComplaint?.replies]);

  // Combine all messages: original customer message, admin replies, and user follow-ups
  const allMessages = [
    // Original customer message
    {
      id: 'original-customer',
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

  // Group consecutive messages from the same sender
  const groupedMessages = [];
  let currentGroup = null;
  allMessages.forEach(message => {
    if (currentGroup && currentGroup.sender === message.sender) {
      currentGroup.messages.push(message);
    } else {
      currentGroup = { sender: message.sender, messages: [message] };
      groupedMessages.push(currentGroup);
    }
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6">
      {/* Conversation Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Conversation
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
        }`}>
          {groupedMessages.length} message groups
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-3 scroll-smooth min-h-0 px-2">
        {groupedMessages.map((group, groupIndex) => (
          <div
            key={group.messages[0].id}
            ref={groupIndex === groupedMessages.length - 1 ? lastMessageRef : null}
            className={`flex w-full ${group.sender === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
              group.sender === 'user'
                ? (isDark ? "bg-blue-900/40 text-blue-100 border border-blue-800/50" : "bg-blue-50 text-blue-900 border border-blue-200")
                : (isDark ? "bg-emerald-700 text-white border border-emerald-600" : "bg-emerald-600 text-white border border-emerald-500")
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {group.sender === 'user' ? (
                  <>
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Customer</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium">Support Team</span>
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-300'}`}></div>
                  </>
                )}
              </div>
              {group.messages.map((message, index) => (
                <div key={message.id}>
                  <p className="text-sm leading-relaxed break-words">{message.message}</p>
                  {index === group.messages.length - 1 && (
                    <p className={`text-xs mt-2 ${group.sender === 'user' ? 'opacity-70' : 'opacity-80'}`}>
                      {message.timestamp?.toDate ? message.timestamp.toDate().toLocaleString() : new Date(message.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatConversation;