import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { XCircle, MessageSquare, User, AlertCircle } from 'lucide-react';
import ChatConversation from './ChatConversation';
import ReplyForm from './ReplyForm';

const ComplaintsModal = ({
  selectedComplaint,
  setSelectedComplaint,
  respondingTo,
  setRespondingTo,
  adminResponse,
  setAdminResponse,
  handleSendResponse,
  handleStatusChange,
  handlePriorityChange,
  statusOptions,
  priorityOptions,
  getStatusColor,
  isDark
}) => {
  const { t } = useTranslation();
  const lastMessageRef = useRef(null);

  if (!selectedComplaint) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`max-w-6xl w-full h-[100dvh] max-h-[100dvh] rounded-3xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-2xl overflow-hidden border ${isDark ? 'border-slate-700' : 'border-gray-200'} flex flex-col`}>
        {/* Header - Fixed */}
        <div className={`flex-shrink-0 p-8 border-b ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-emerald-100'}`}>
                <MessageSquare className={`w-7 h-7 ${isDark ? 'text-slate-300' : 'text-emerald-600'}`} />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedComplaint.ticketId || `Ticket #${selectedComplaint.id?.slice(-6) || 'Unknown'}`}
                  </h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {selectedComplaint.subject || 'General Support Inquiry'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedComplaint(null)}
              className={`p-3 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <XCircle className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Content - Flexible */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Left Sidebar - Ticket Details */}

          <div className={`w-full lg:w-80 flex-shrink-0 p-6 border-r ${isDark ? 'border-slate-700' : 'border-gray-200'} overflow-y-auto`}>
            <div className="space-y-6">
              {/* Customer Details */}
              <div className={`p-5 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <h4 className={`font-bold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <User className={`w-5 h-5 mr-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
                  Customer Details
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Name:</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedComplaint.userName || 'Anonymous'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Email:</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedComplaint.userEmail || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Phone:</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedComplaint.phoneNumber || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div className={`p-5 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <h4 className={`font-bold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <AlertCircle className={`w-5 h-5 mr-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
                  Ticket Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Status
                    </label>
                    <select
                      value={selectedComplaint.status}
                      onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-slate-600 border-slate-500 text-white hover:border-slate-400'
                          : 'bg-white border-gray-300 text-gray-900 hover:border-emerald-400'
                      } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    >
                      {statusOptions.slice(1).map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        value={selectedComplaint.priority}
                        onChange={(e) => handlePriorityChange(selectedComplaint.id, e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border transition-colors ${
                          isDark
                            ? 'bg-slate-600 border-slate-500 text-white hover:border-slate-400'
                            : 'bg-white border-gray-300 text-gray-900 hover:border-emerald-400'
                        } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      >
                        {priorityOptions.slice(1).map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Category
                    </label>
                    <div className={`px-3 py-2 rounded-xl border transition-colors ${
                      isDark
                        ? 'bg-slate-600 border-slate-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-900'
                    }`}>
                      {t(`support.topics.${selectedComplaint.category}`) || 'General'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between text-sm">
                      <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Created:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedComplaint.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Time:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedComplaint.createdAt.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Conversation */}
          <div className="flex-1 flex flex-col min-h-0">
            <ChatConversation
              selectedComplaint={selectedComplaint}
              isDark={isDark}
              lastMessageRef={lastMessageRef}
            />
            <ReplyForm
              selectedComplaint={selectedComplaint}
              respondingTo={respondingTo}
              setRespondingTo={setRespondingTo}
              adminResponse={adminResponse}
              setAdminResponse={setAdminResponse}
              handleSendResponse={handleSendResponse}
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsModal;