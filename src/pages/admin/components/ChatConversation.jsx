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
          {selectedComplaint.replies.length} messages
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-4 scroll-smooth min-h-0">
        <>
          {/* Customer Message */}
          <div className="flex justify-start">
            <div className={`max-w-lg px-6 py-4 rounded-2xl shadow-sm ${
              isDark ? "bg-blue-900/40 text-blue-100 border border-blue-800/50" : "bg-blue-50 text-blue-900 border border-blue-200"
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Customer</span>
              </div>
              <p className="text-sm leading-relaxed">{selectedComplaint.description || selectedComplaint.message}</p>
              <p className="text-xs mt-3 opacity-70">
                {selectedComplaint.createdAt.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Admin Replies */}
          {selectedComplaint.replies
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map((reply, index) => (
            <div key={reply.id} ref={index === selectedComplaint.replies.length - 1 ? lastMessageRef : null} className="flex justify-end">
              <div className={`max-w-lg px-6 py-4 rounded-2xl shadow-sm ${
                isDark ? "bg-emerald-700 text-white border border-emerald-600" : "bg-emerald-600 text-white border border-emerald-500"
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium">Support Team</span>
                  <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-300'}`}></div>
                </div>
                <p className="text-sm leading-relaxed">{reply.message}</p>
                <p className="text-xs mt-3 opacity-80">
                  {new Date(reply.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </>
      </div>
    </div>
  );
};

export default ChatConversation;