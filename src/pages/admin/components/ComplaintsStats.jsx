import React from 'react';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';

const ComplaintsStats = ({ stats, isDark }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${
        isDark ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Total Tickets
            </p>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.total}
            </p>
          </div>
          <div className={`p-3 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <MessageSquare className={`w-6 h-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`} />
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${
        isDark ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Pending
            </p>
            <p className={`text-3xl font-bold text-yellow-600`}>
              {stats.pending}
            </p>
          </div>
          <div className="p-3 rounded-full bg-yellow-100">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${
        isDark ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Urgent
            </p>
            <p className={`text-3xl font-bold text-red-600`}>
              {stats.urgent}
            </p>
          </div>
          <div className="p-3 rounded-full bg-red-100">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsStats;