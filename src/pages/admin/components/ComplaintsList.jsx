import React from 'react';
import { MessageSquare, AlertCircle, MoreVertical } from 'lucide-react';

const ComplaintsList = ({
  filteredComplaints,
  selectedComplaint,
  setSelectedComplaint,
  getStatusColor,
  getPriorityInfo,
  formatTimeAgo,
  handleStatusChange,
  handlePriorityChange,
  isDark
}) => {
  if (filteredComplaints.length === 0) {
    return (
      <div className={`rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${
        isDark ? 'border-slate-700' : 'border-gray-200'
      } overflow-hidden`}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Support Tickets (0)
          </h2>
        </div>
        <div className="p-8 text-center">
          <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${
            isDark ? 'text-slate-600' : 'text-gray-400'
          }`} />
          <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            No tickets found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${
      isDark ? 'border-slate-700' : 'border-gray-200'
    } overflow-hidden`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Support Tickets ({filteredComplaints.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredComplaints.map((complaint) => {
          const priorityInfo = getPriorityInfo(complaint.priority);
          const PriorityIcon = priorityInfo.icon;

          return (
            <div
              key={complaint.id}
              className={`p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                selectedComplaint?.id === complaint.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => setSelectedComplaint(complaint)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`text-lg font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      #{complaint.id.slice(-6)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <div className="relative">
                      <select
                        value={complaint.priority}
                        onChange={(e) => handlePriorityChange(complaint.id, e.target.value)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.bg} ${priorityInfo.color} border-0 cursor-pointer`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {[
                          { value: "urgent", label: "Urgent" },
                          { value: "high", label: "High" },
                          { value: "normal", label: "Normal" },
                          { value: "low", label: "Low" }
                        ].map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {complaint.priority === "urgent" && complaint.prioritySetBy && (
                        <div className={`absolute -top-8 left-0 text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-600'
                        }`}>
                          Set by {complaint.prioritySetBy}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {complaint.subject}
                  </h3>

                  <p className={`text-sm mb-4 line-clamp-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                    {complaint.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          {complaint.userName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {complaint.userEmail}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {complaint.phoneNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {formatTimeAgo(complaint.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {complaint.replies && complaint.replies.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageSquare className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                            {complaint.replies.length} replies
                          </span>
                        </div>
                      )}
                      {complaint.userFollowUp && (
                        <div className="flex items-center space-x-1">
                          <AlertCircle className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                          <span className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                            Follow-up
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <select
                    value={complaint.status}
                    onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                    className={`px-3 py-1 text-sm rounded border ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[
                      { value: "pending", label: "Pending" },
                      { value: "in-progress", label: "In Progress" },
                      { value: "resolved", label: "Resolved" },
                      { value: "closed", label: "Closed" }
                    ].map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>

                  <button className={`p-2 rounded ${
                    isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                  }`}>
                    <MoreVertical className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComplaintsList;