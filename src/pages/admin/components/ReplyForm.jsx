import React from 'react';
import { Phone, Reply } from 'lucide-react';
import toast from 'react-hot-toast';

const ReplyForm = ({
  selectedComplaint,
  respondingTo,
  setRespondingTo,
  adminResponse,
  setAdminResponse,
  handleSendResponse,
  isDark
}) => {
  if (selectedComplaint.status === "closed") {
    return null;
  }

  return (
    <div className={`flex-shrink-0 rounded-2xl border p-6 mt-4 ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>
      {respondingTo === selectedComplaint.id ? (
        <div className="space-y-4">
          <textarea
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            placeholder="Type your response to the customer..."
            rows={4}
            className={`w-full p-4 border rounded-xl resize-none transition-colors ${
              isDark
                ? "border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-emerald-500"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-emerald-500"
            } focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
          />
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                const phone = selectedComplaint.phoneNumber?.replace(/\D/g, "");
                if (!phone) {
                  toast.error("User did not provide a phone number");
                  return;
                }
                const complaintText = selectedComplaint.description || selectedComplaint.message || selectedComplaint.subject || "your inquiry";
                const text = `Hello ${selectedComplaint.userName || "Customer"},\n\nRegarding your complaint:\n"${complaintText}"`;
                const url = `https://wa.me/2${phone}?text=${encodeURIComponent(text)}`;
                window.open(url, "_blank");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setRespondingTo(null);
                  setAdminResponse("");
                }}
                className={`px-6 py-3 rounded-xl transition-colors ${
                  isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendResponse(selectedComplaint.id)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center space-x-2"
              >
                <Reply className="w-4 h-4" />
                <span>Send Response</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => {
              const phone = selectedComplaint.phoneNumber?.replace(/\D/g, "");
              if (!phone) {
                toast.error("User did not provide a phone number");
                return;
              }
              const text = `Hello ${selectedComplaint.userName || "Customer"},\n\nRegarding your complaint:\n"${selectedComplaint.description}"`;
              const url = `https://wa.me/2${phone}?text=${encodeURIComponent(text)}`;
              window.open(url, "_blank");
            }}
            className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Phone className="w-5 h-5" />
            <span>Contact via WhatsApp</span>
          </button>
          <button
            onClick={() => setRespondingTo(selectedComplaint.id)}
            className={`w-full py-3 rounded-xl flex items-center justify-center space-x-3 transition-all ${
              isDark
                ? "bg-emerald-700 text-white hover:bg-emerald-600 hover:shadow-lg"
                : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
            }`}
          >
            <Reply className="w-5 h-5" />
            <span className="font-medium">Reply</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReplyForm;