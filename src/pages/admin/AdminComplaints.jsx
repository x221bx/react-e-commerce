import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FiRefreshCw,
  FiClock,
  FiMessageSquare,
  FiUser,
  FiPhone,
  FiAlertTriangle,
  FiX,
  FiPhoneCall,
} from "react-icons/fi";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  orderBy,
  getDoc
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { UseTheme } from "../../theme/ThemeProvider";
import toast from "react-hot-toast";

export default function AdminComplaints() {
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const subtleSurface = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200";
  const mutedText = isDark ? "text-slate-300" : "text-slate-600";

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSourceFilter, setActiveSourceFilter] = useState("Account Support");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [respondingTo, setRespondingTo] = useState(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when replies change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [complaints]);

  const filters = ["All", "pending", "in-progress", "resolved", "closed"];
  const sourceFilters = ["Account Support"];

  React.useEffect(() => {
    const qSupport = query(collection(db, "support"), orderBy("createdAt", "desc"));
    const unsubSupport = onSnapshot(qSupport, (snapshot) => {
      const data = snapshot.docs.map((docSnapshot) => {
        const raw = docSnapshot.data() || {};
        const normalizedStatus = (raw.status || "pending").toLowerCase();
        const repliesArray = Array.isArray(raw.replies)
          ? raw.replies
          : Array.isArray(raw.adminResponses)
          ? raw.adminResponses.map(r => ({
              id: r.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
              message: r.message,
              sender: r.sender || "admin",
              timestamp: r.timestamp || r.createdAt || raw.respondedAt || raw.createdAt
            }))
          : raw.adminResponse
          ? [{
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              message: raw.adminResponse,
              sender: "admin",
              timestamp: raw.respondedAt || raw.updatedAt || raw.createdAt
            }]
          : [];

        return {
          id: docSnapshot.id,
          ...raw,
          status: normalizedStatus,
          replies: repliesArray,
          source: raw.source || "account_support"
        };
      });
      setComplaints(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching complaints:", error);
      setLoading(false);
    });

    return () => {
      unsubSupport();
    };
  }, []);

  const hasAdminReply = (complaint) => {
    const replies = Array.isArray(complaint.replies)
      ? complaint.replies.length
      : 0;
    return replies > 0;
  };




  const filteredComplaints = useMemo(() => {
    let filtered = activeFilter === "All" ? complaints : complaints.filter((comp) => comp.status === activeFilter);

    if (activeSourceFilter === "Account Support") {
      filtered = filtered.filter(
        (comp) => !comp.source || comp.source === "account_support"
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (comp) =>
          (comp.userName || "").toLowerCase().includes(q) ||
          (comp.userEmail || "").toLowerCase().includes(q) ||
          (comp.topic || "").toLowerCase().includes(q) ||
          (comp.message || "").toLowerCase().includes(q) ||
          (comp.phoneNumber || "").toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || a.createdAt || 0;
      const dateB = b.createdAt?.toMillis?.() || b.createdAt || 0;
      return sortDesc ? dateB - dateA : dateA - dateB;
    });
  }, [complaints, activeFilter, activeSourceFilter, searchQuery, sortDesc]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Re-fetch is handled by onSnapshot
    setTimeout(() => setRefreshing(false), 1000);
  };

  const statusColorClass = () => {
    // Always green as requested
    return isDark ? "bg-emerald-900/40 text-emerald-200" : "bg-emerald-100 text-emerald-700";
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    const normalizedStatus = (newStatus || "").toLowerCase();
    try {
      await updateDoc(doc(db, "support", complaintId), {
        status: normalizedStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSendResponse = async (complaintId) => {
    if (!adminResponse.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      const responseText = adminResponse.trim();
      const complaint = complaints.find(c => c.id === complaintId);

      // Get current complaint data to append to replies array
      const complaintRef = doc(db, "support", complaintId);
      const complaintSnap = await getDoc(complaintRef);
      const currentData = complaintSnap.data() || {};
      const currentReplies = currentData.replies || [];

      const newReply = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message: responseText,
        sender: "admin",
        timestamp: new Date()
      };

      // Only update status if it hasn't been responded to yet
      const updateData = {
        replies: [...currentReplies, newReply],
        updatedAt: new Date()
      };

      if (currentReplies.length === 0) {
        // First reply - set status to in-progress and respondedAt
        updateData.status = "in-progress";
        updateData.respondedAt = new Date();
      }

      await updateDoc(complaintRef, updateData);

      // Create notification for user
      if (complaint && (complaint.uid || complaint.userId)) {
        await addDoc(collection(db, "notifications"), {
          uid: complaint.uid || complaint.userId,
          type: "support-response",
          category: "support",
          title: complaint.topic || "Support Response",
          message: responseText,
          createdAt: new Date(),
          read: false,
          target: "/account/complaints",
          meta: { complaintId }
        });
      }

      setAdminResponse("");
      setRespondingTo(null);
    } catch (error) {
      console.error("Error sending response:", error);
      toast.error("Failed to send response");
    }
  };

  const replyWhatsApp = (complaint) => {
    const phone = complaint.phoneNumber?.replace(/\D/g, "");
    if (!phone) return toast.error("User did not provide a phone number");

    const text = `Hello ${complaint.userName || "Customer"},\n\nRegarding your complaint:\n"${complaint.message}"`;
    const url = `https://wa.me/2${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-surface text-[var(--text-main)] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-[var(--text-main)]">
            Complaints Management
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              className={`px-3 py-2 rounded border flex items-center gap-2 transition ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => setSortDesc((s) => !s)}
              className={`px-3 py-2 rounded border flex items-center gap-2 transition ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              <FiClock /> {sortDesc ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>


        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by customer name, email, topic, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDark ? "border-slate-700 bg-slate-800 text-white" : "border-emerald-200 bg-white text-slate-900 shadow-sm"
            }`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {filters.map((status) => {
            const isActive = activeFilter === status;
            const bg = isActive
              ? isDark
                ? "bg-emerald-800 text-white"
                : "bg-emerald-700 text-white"
              : isDark
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-800";
            const border = isActive
              ? isDark
                ? "border-emerald-700"
                : "border-emerald-300"
              : isDark
              ? "border-slate-700"
              : "border-emerald-100";
            return (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`flex justify-center items-center gap-2 p-3 rounded-lg border ${border} ${bg} hover:shadow-md transition`}
              >
                <span className="font-medium capitalize">{status}</span>
              </button>
            );
          })}
        </div>

        {/* Source Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Filter by Source:</h3>
          <div className="flex gap-3 flex-wrap">
            {sourceFilters.map((source) => {
              const isActive = activeSourceFilter === source;
              const bg = isActive
                ? isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                : isDark ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-800";
              return (
                <button
                  key={source}
                  onClick={() => setActiveSourceFilter(source)}
                  className={`px-4 py-2 rounded-lg font-medium transition hover:shadow-md ${bg}`}
                >
                  {source}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
              <p>Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-10 text-red-600 font-semibold">
              No complaints found.
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className={`rounded-2xl shadow-lg p-5 border card-surface ${subtleSurface}`}
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-[var(--text-main)]">
                            #{complaint.id.slice(-6)} - {complaint.userName || "Anonymous"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-[var(--text-main)]/80">{complaint.userEmail}</p>
                            {complaint.source === "contact_form" && (
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                complaint.isRegisteredUser
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                                  : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
                              }`}>
                                {complaint.isRegisteredUser ? "Registered User" : "Guest"}
                              </span>
                            )}
                          </div>
                          {complaint.source === "contact_form" && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Contact form message
                            </p>
                          )}
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColorClass(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <FiUser className={`h-4 w-4 ${isDark ? "text-emerald-200" : "text-emerald-700"}`} />
                        <span className="font-medium">Topic:</span>
                        <span className="capitalize">{complaint.topic || "General"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiPhone className={`h-4 w-4 ${isDark ? "text-emerald-200" : "text-emerald-700"}`} />
                        <span className={mutedText}>{complaint.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiClock className={`h-4 w-4 ${isDark ? "text-emerald-200" : "text-emerald-700"}`} />
                        <span className={mutedText}>{formatDate(complaint.createdAt)}</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg border mb-3 ${
                      isDark ? "bg-slate-800 border-slate-700" : "bg-emerald-50/60 border-emerald-100"
                    }`}>
                      <p className="text-sm font-medium mb-1">Customer Message:</p>
                      <p className="text-sm">{complaint.message}</p>
                    </div>

                    {complaint.userFollowUp && (
                      <div className={`p-3 rounded-lg border mb-3 ${
                        isDark ? "bg-emerald-900/20 border-emerald-800" : "bg-emerald-50 border-emerald-200"
                      }`}>
                        <p className="text-sm font-medium mb-1 text-emerald-700 dark:text-emerald-200">User Follow-up:</p>
                        <p className="text-sm">{complaint.userFollowUp}</p>
                      </div>
                    )}

                    {/* Chat-style conversation */}
                    <div className={`rounded-lg border ${
                      isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                    }`}>
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Conversation ({complaint.replies.length} messages)
                        </h4>
                      </div>
                      <div ref={chatContainerRef} className="max-h-96 overflow-y-auto p-3 space-y-3">
                        {/* Customer Message */}
                        <div className="flex justify-start">
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isDark ? "bg-blue-900/30 text-blue-100" : "bg-blue-100 text-blue-900"
                          }`}>
                            <p className="text-sm">{complaint.message}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {formatDate(complaint.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Admin Replies */}
                        {complaint.replies
                          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                          .map((reply) => (
                          <div key={reply.id} className="flex justify-end">
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isDark ? "bg-emerald-700 text-white" : "bg-emerald-600 text-white"
                            }`}>
                              <p className="text-sm">{reply.message}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {formatDate(reply.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                      className={`p-2 border rounded-md ${
                        isDark ? "border-slate-700 bg-slate-800 text-white" : "border-emerald-200 bg-white text-slate-900"
                      }`}
                    >
                      {filters.filter(f => f !== "All").map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    {complaint.status !== "closed" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRespondingTo(respondingTo === complaint.id ? null : complaint.id)}
                          className={`px-3 py-2 rounded-md flex items-center gap-2 transition ${
                            isDark
                              ? "bg-emerald-700 text-white hover:bg-emerald-600"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          <FiMessageSquare />
                          Reply
                        </button>
                        <button
                          onClick={() => replyWhatsApp(complaint)}
                          className="px-3 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 hover:bg-green-700"
                        >
                          <FiPhoneCall />
                          WhatsApp
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedComplaintId(selectedComplaintId === complaint.id ? null : complaint.id)}
                      className={`p-2 rounded-md border flex items-center gap-2 transition ${
                        isDark
                          ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                          : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                      }`}
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px]">
                        i
                      </span>
                      History
                    </button>
                  </div>
                </div>

                {respondingTo === complaint.id && (
                  <div className="mt-4 p-4 border-t border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-slate-900 rounded-lg">
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Enter your response..."
                      rows={4}
                      className={`w-full p-3 border rounded-md resize-none ${
                        isDark ? "border-slate-700 bg-slate-800 text-white" : "border-emerald-200 bg-white text-slate-900"
                      }`}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSendResponse(complaint.id)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                      >
                        Send Response
                      </button>
                      <button
                        onClick={() => {
                          setRespondingTo(null);
                          setAdminResponse("");
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {selectedComplaintId === complaint.id && (
                  <div className="mt-3 p-4 border-t border-slate-200 dark:border-slate-700 rounded-lg bg-emerald-50/60 dark:bg-slate-800">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Status History:</h4>
                    <div className="text-sm text-[var(--text-main)]/80 dark:text-slate-300 space-y-1">
                      <p>Created: {formatDate(complaint.createdAt)}</p>
                      {complaint.respondedAt && <p>Responded: {formatDate(complaint.respondedAt)}</p>}
                      {complaint.closedAt && <p>Closed: {formatDate(complaint.closedAt)} by {complaint.closedBy}</p>}
                      {complaint.userFollowUp && (
                        <p className="mt-2">
                          <span className="font-semibold">User follow-up:</span> {complaint.userFollowUp}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


