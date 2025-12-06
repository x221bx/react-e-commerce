 import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { Phone, CalendarDays, AlertCircle, X, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

import { selectCurrentUser } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { db } from "../../services/firebase";
import Button from "../../components/ui/Button";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/ui/Pagination";

const extractResponseText = (payload) => {
  if (!payload) return "";

  // OpenAI "responses" API shape
  if (typeof payload.output_text === "string") return payload.output_text;
  if (Array.isArray(payload.output)) {
    for (const item of payload.output) {
      const textValue =
        item?.content?.[0]?.text?.value ||
        item?.content?.[0]?.text ||
        item?.content?.[0]?.value;
      if (typeof textValue === "string") return textValue;
    }
  }

  // Chat completions shape (OpenRouter/OpenAI compatible)
  if (Array.isArray(payload.choices)) {
    const choice = payload.choices[0];
    if (typeof choice?.message?.content === "string")
      return choice.message.content;
    if (Array.isArray(choice?.message?.content))
      return choice.message.content.map((part) => part?.text || part).join(" ");
    if (typeof choice?.text === "string") return choice.text;
  }

  return "";
};

const moderateMessage = async (text) => {
  const API_KEY = import.meta.env.VITE_OR_KEY || import.meta.env.VITE_OPENAI_KEY;
  if (!API_KEY) return { allowed: true };
  const prompt = `
You are a strict content moderator. Review the following message and respond with either:
- "ALLOW" (if the text is safe to send)
- "REJECT: <short reason>" (if it contains harassment, hate speech, sexual or violent content, or personal attacks).
Message:
"""${text}"""
`;
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "X-Title": "Farm-Vet E-Shop Support",
    };

    if (typeof window !== "undefined" && window.location?.origin) {
      headers["HTTP-Referer"] = window.location.origin;
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
        }),
      }
    );

    if (!response.ok) throw new Error("Moderation request failed");

    const data = await response.json();
    const verdictRaw = extractResponseText(data).trim();
    const verdict = verdictRaw.toUpperCase();
    if (!verdict) return { allowed: true };
    if (verdict.startsWith("ALLOW")) return { allowed: true };
    if (verdict.startsWith("REJECT")) {
      const reason = verdictRaw.split(":").slice(1).join(":").trim();
      return {
        allowed: false,
        reason: reason || "Message contains inappropriate content",
      };
    }
    return { allowed: true };
  } catch (error) {
    console.error("AI moderation failed", error);
    return { allowed: false, reason: "Moderation failed, please try again" };
  }
};

// Simple rate limiter utility
const useRateLimiter = (maxAttempts = 3, windowMs = 60000) => {
  const [attempts, setAttempts] = useState([]);

  const isRateLimited = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    return recentAttempts.length >= maxAttempts;
  };

  const recordAttempt = () => {
    setAttempts(prev => [...prev, Date.now()]);
  };

  const getRemainingTime = () => {
    if (!isRateLimited()) return 0;
    const oldestAttempt = Math.min(...attempts);
    return Math.ceil((windowMs - (Date.now() - oldestAttempt)) / 1000);
  };

  return { isRateLimited, recordAttempt, getRemainingTime };
};

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [complaintsByUid, setComplaintsByUid] = useState([]);
  const [complaintsByUserId, setComplaintsByUserId] = useState([]);
  const complaintsByUidRef = useRef([]);
  const complaintsByUserIdRef = useRef([]);
  const [closingComplaints, setClosingComplaints] = useState(new Set());
  const [confirmClose, setConfirmClose] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector(selectCurrentUser);
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const rateLimiter = useRateLimiter(3, 60000); // 3 attempts per minute
  const [followUps, setFollowUps] = useState({});
  const [sendingFollowUps, setSendingFollowUps] = useState(new Set());
  const chatContainerRef = useRef(null);

  // Pagination
  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
  } = usePagination(complaints, 4, {
    resetKeys: [complaints.length], // Reset to page 1 when complaints change
  });

  // Merge current snapshots from queries (uid and legacy userId)
  const mergeComplaints = (uidDocs, userIdDocs) => {
    const map = new Map();
    [...uidDocs, ...userIdDocs].forEach((item) => {
      if (!item) return;
      map.set(item.id, item);
    });
    const merged = Array.from(map.values()).sort((a, b) => {
      const aDate = a.createdAt?.toMillis?.() || a.createdAt || 0;
      const bDate = b.createdAt?.toMillis?.() || b.createdAt || 0;
      return bDate - aDate;
    });
    setComplaints(merged);
  };

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribers = [];

    const qUid = query(collection(db, "support"), where("uid", "==", user.uid));
    const unsubUid = onSnapshot(
      qUid,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => {
            const raw = doc.data();
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

            const userMessagesArray = Array.isArray(raw.userMessages)
              ? raw.userMessages
              : raw.userFollowUp
              ? [{
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  message: raw.userFollowUp,
                  sender: "user",
                  timestamp: raw.updatedAt || raw.createdAt
                }]
              : [];

            return {
              id: doc.id,
              ...raw,
              status: normalizedStatus,
              replies: repliesArray,
              userMessages: userMessagesArray
            };
          });
          setComplaintsByUid(data);
          complaintsByUidRef.current = data;
          mergeComplaints(complaintsByUidRef.current, complaintsByUserIdRef.current);
          setLoading(false);
        } catch (err) {
          console.error("Error processing complaints data (uid):", err);
          setError("Failed to process complaints data");
          setLoading(false);
          toast.error("Failed to load complaints");
        }
      },
      (err) => {
        console.error("Error fetching complaints (uid):", err);
        setError("Failed to load complaints");
        setLoading(false);
        toast.error("Failed to load complaints");
      }
    );
    unsubscribers.push(unsubUid);

    const qUserId = query(collection(db, "support"), where("userId", "==", user.uid));
    const unsubUserId = onSnapshot(
      qUserId,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => {
            const raw = doc.data();
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

            const userMessagesArray = Array.isArray(raw.userMessages)
              ? raw.userMessages
              : raw.userFollowUp
              ? [{
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  message: raw.userFollowUp,
                  sender: "user",
                  timestamp: raw.updatedAt || raw.createdAt
                }]
              : [];

            return {
              id: doc.id,
              ...raw,
              status: normalizedStatus,
              replies: repliesArray,
              userMessages: userMessagesArray
            };
          });
          setComplaintsByUserId(data);
          complaintsByUserIdRef.current = data;
          mergeComplaints(complaintsByUidRef.current, complaintsByUserIdRef.current);
          setLoading(false);
        } catch (err) {
          console.error("Error processing complaints data (userId):", err);
          setError("Failed to process complaints data");
          setLoading(false);
          toast.error("Failed to load complaints");
        }
      },
      (err) => {
        console.error("Error fetching complaints (userId):", err);
        setError("Failed to load complaints");
        setLoading(false);
        toast.error("Failed to load complaints");
      }
    );
    unsubscribers.push(unsubUserId);

    return () => {
      unsubscribers.forEach((fn) => fn && fn());
    };
  }, [user?.uid]);

  // Auto-scroll to bottom when replies change
  useEffect(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [complaints]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30";
      case "in-progress":
        return "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30";
      case "resolved":
        return "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30";
      case "closed":
        return "text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30";
      default:
        return "text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30";
    }
  };

  const handleCloseClick = (complaintId) => {
    setConfirmClose(complaintId);
  };

  const confirmCloseComplaint = async () => {
    if (!confirmClose) return;

    if (rateLimiter.isRateLimited()) {
      const remainingTime = rateLimiter.getRemainingTime();
      toast.error(t("common.rateLimitExceeded", { seconds: remainingTime }));
      return;
    }

    try {
      rateLimiter.recordAttempt();
      setClosingComplaints(prev => new Set([...prev, confirmClose]));
      const complaintRef = doc(db, "support", confirmClose);
      await updateDoc(complaintRef, {
        status: "closed",
        closedAt: new Date(),
        closedBy: "user"
      });
      toast.success(t("account.complaints_actions.complaint_closed", "Complaint closed successfully"));
      setConfirmClose(null);
    } catch (error) {
      console.error("Error closing complaint:", error);
      toast.error("Failed to close complaint");
    } finally {
      setClosingComplaints(prev => {
        const newSet = new Set(prev);
        newSet.delete(confirmClose);
        return newSet;
      });
    }
  };

  const cancelCloseComplaint = () => {
    setConfirmClose(null);
  };

  const handleSendFollowUp = async (complaintId) => {
    const text = (followUps[complaintId] || "").trim();
    if (!text) {
      toast.error(t("account.complaints_actions.follow_up_placeholder", "Please add details first"));
      return;
    }

    try {
      setSendingFollowUps((prev) => new Set(prev).add(complaintId));

      // Moderate the message
      const moderationVerdict = await moderateMessage(text);
      if (!moderationVerdict.allowed) {
        toast.error(t("account.moderation.inappropriate_content", "Your message contains inappropriate content. Please revise and try again."));
        return;
      }

      const complaintRef = doc(db, "support", complaintId);

      // Get current complaint data to append to user messages array
      const complaintSnap = await getDoc(complaintRef);
      const currentData = complaintSnap.data() || {};
      const currentUserMessages = Array.isArray(currentData.userMessages) ? currentData.userMessages : [];

      const newUserMessage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message: text,
        sender: "user",
        timestamp: new Date()
      };

      await updateDoc(complaintRef, {
        userMessages: [...currentUserMessages, newUserMessage],
        updatedAt: new Date()
      });

      toast.success(t("account.complaints_actions.follow_up_saved", "Follow-up sent"));
      // Clear the text after sending
      setFollowUps((prev) => ({ ...prev, [complaintId]: "" }));
    } catch (error) {
      console.error("Error sending follow-up:", error);
      toast.error("Failed to send follow-up");
    } finally {
      setSendingFollowUps((prev) => {
        const next = new Set(prev);
        next.delete(complaintId);
        return next;
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("account.login_required_title", "Please log in to view your complaints")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {t("account.login_required_subtitle", "You need to be logged in to access your complaint history.")}
          </p>
        </div>
      </div>
    );
  }

  const heroSurface = isDark
  ? "from-green-950 via-green-950 to-green-950 text-white"
  : "from-emerald-100 via-emerald-50 to-emerald-50 text-slate-900";

  const cardSurface = isDark
  ? "bg-green-990 border-green-200 text-green-200"
  : "bg-white border-emerald-200 text-slate-900";

  const metaText = isDark ? "text-slate-300" : "text-slate-600";

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-white'} py-8`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
          }`}>
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t("account.complaints_title", "My Inquiries")}
          </h1>
          <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            {t("account.complaints_subtitle", "Track your submitted inquiries and their resolution status.")}
          </p>
          <div className="mt-6">
            <Button
              onClick={() => navigate("/account/support")}
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold min-w-[200px] bg-emerald-600 text-white hover:bg-emerald-700"
              aria-label={t("account.submit_new_complaint", "Submit New Inquiry")}
            >
              {t("account.submit_new_complaint", "Submit New Inquiry")}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className={`rounded-2xl border p-8 text-center shadow-sm ${cardSurface}`}>
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
            <p className={metaText}>
              {t("common.loading", "Loading your inquiries...")}
            </p>
          </div>
        ) : error ? (
          <div className={`rounded-2xl border p-8 text-center shadow-sm ${cardSurface}`}>
            <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-lg font-semibold mb-1 text-red-600 dark:text-red-400">
              {t("common.error", "Error")}
            </h3>
            <p className={metaText}>
              {error}
            </p>
            <Button
              text={t("common.retry", "Retry")}
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            />
          </div>
        ) : complaints.length === 0 ? (
          <div className={`rounded-2xl border p-8 text-center shadow-sm ${cardSurface}`}>
            <AlertCircle className="mx-auto h-10 w-10 text-amber-500 mb-3" />
            <h3 className="text-lg font-semibold mb-1">
              {t("account.no_complaints_title", "No inquiries yet")}
            </h3>
            <p className={metaText}>
              {t("account.no_complaints_subtitle", "You haven't submitted any inquiries yet. Click the button above to submit your first inquiry.")}
            </p>
          </div>
        ) : (
          <div>
            <div className="grid gap-4 md:grid-cols-2">
              {paginatedData.map((complaint) => {
              const topicKey = complaint.category
                ? `account.complaints_topics.${complaint.category}`
                : "account.complaints_topic_fallback";
              const statusKey = complaint.status
                ? `account.complaints_status.${complaint.status}`
                : "account.complaints_status.pending";
              const created = complaint.createdAt?.toDate?.()?.toLocaleDateString?.() || complaint.createdAt;

              return (
                <article
                  key={complaint.id}
                  className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition ${cardSurface}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-mono font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                          {complaint.ticketId || `#${complaint.id.slice(-6)}`}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                          {t(statusKey, complaint.status || "Pending")}
                        </span>
                      </div>
                      <p className={`text-xs uppercase tracking-[0.12em] font-semibold ${isDark ? "text-emerald-200" : "text-emerald-700"}`}>
                        {t("account.complaints_topic_fallback", "Topic")}
                      </p>
                      <h3 className="text-xl font-semibold leading-tight">
                        {t(topicKey, complaint.category || t("account.complaints_topic_fallback", "General support"))}
                      </h3>
                      {(complaint.originalMessage || complaint.message || complaint.description) && (
                        <div className={`mt-2 p-3 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                          <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                            {t("account.complaints_your_message", "Your Message")}
                          </p>
                          <p className={`text-sm ${metaText} mt-1`}>{complaint.originalMessage || complaint.message || complaint.description}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <div className={`flex items-center justify-end gap-2 text-xs ${metaText}`}>
                        <CalendarDays className="h-4 w-4" />
                        <span>{created}</span>
                      </div>
                    </div>
                  </div>

                  {/* Response Section */}
                  {complaint.status === "pending" && !complaint.adminResponse && (
                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"}`}>
                      <MessageSquare className={`h-5 w-5 mt-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDark ? "text-blue-300" : "text-blue-800"}`}>
                          {t("account.complaints_actions.no_response_yet", "No response yet")}
                        </p>
                        <p className={`text-xs ${metaText}`}>
                          {t("account.complaints_actions.awaiting_response", "We're reviewing your complaint and will respond soon.")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Chat-style conversation */}
                  {((complaint.replies && complaint.replies.length > 0) ||
                    (complaint.userMessages && complaint.userMessages.length > 0) ||
                    complaint.adminResponse) ? (
                    <div className={`rounded-lg border ${
                      isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                    }`}>
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Conversation ({(() => {
                            const allMessages = [
                              // Original customer message
                              {
                                id: 'original-customer',
                                message: complaint.originalMessage || complaint.message || complaint.description,
                                sender: 'user',
                                timestamp: complaint.createdAt,
                                type: 'original'
                              },
                              // User follow-ups
                              ...(complaint.userMessages || []).map(msg => ({ ...msg, sender: 'user', type: 'followup' })),
                              // Admin replies
                              ...(complaint.replies || []).map(reply => ({ ...reply, sender: 'admin', type: 'admin' })),
                              // Legacy admin response
                              ...(complaint.adminResponse && (!complaint.replies || complaint.replies.length === 0) ? [{
                                id: 'legacy-admin',
                                message: complaint.adminResponse,
                                sender: 'admin',
                                timestamp: complaint.respondedAt || complaint.updatedAt || complaint.createdAt,
                                type: 'admin'
                              }] : [])
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
                            return groupedMessages.length;
                          })()} message groups)
                        </h4>
                      </div>
                      <div ref={chatContainerRef} className="min-h-[300px] max-h-96 overflow-y-auto p-3 space-y-3 scroll-smooth">
                        {/* Combine all messages: original, user follow-ups, admin replies */}
                        {(() => {
                          const allMessages = [
                            // Original customer message
                            {
                              id: 'original-customer',
                              message: complaint.originalMessage || complaint.message || complaint.description,
                              sender: 'user',
                              timestamp: complaint.createdAt,
                              type: 'original'
                            },
                            // User follow-ups
                            ...(complaint.userMessages || []).map(msg => ({ ...msg, sender: 'user', type: 'followup' })),
                            // Admin replies
                            ...(complaint.replies || []).map(reply => ({ ...reply, sender: 'admin', type: 'admin' })),
                            // Legacy admin response
                            ...(complaint.adminResponse && (!complaint.replies || complaint.replies.length === 0) ? [{
                              id: 'legacy-admin',
                              message: complaint.adminResponse,
                              sender: 'admin',
                              timestamp: complaint.respondedAt || complaint.updatedAt || complaint.createdAt,
                              type: 'admin'
                            }] : [])
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

                          return groupedMessages.map((group, groupIndex) => (
                            <div
                              key={group.messages[0].id}
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
                                      <MessageSquare className="w-4 h-4" />
                                      <span className="text-sm font-medium">You</span>
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
                                      <p className="text-xs mt-2 opacity-70">
                                        {message.timestamp?.toDate ? message.timestamp.toDate().toLocaleString() : new Date(message.timestamp).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-3">
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                      <Phone className="h-4 w-4 text-pink-500" />
                      <span className={metaText}>{complaint.phoneNumber || complaint.phone || t("account.complaints.phone_placeholder", "Not provided")}</span>
                    </div>

                    {/* Close Button - Only allow closing if resolved */}
                    {complaint.status !== "closed" && complaint.status === "resolved" && (
                      <Button
                        text={closingComplaints.has(complaint.id)
                          ? t("account.complaints_actions.closing", "Closing...")
                          : t("account.complaints_actions.close_complaint", "Close Inquiry")
                        }
                        onClick={() => handleCloseClick(complaint.id)}
                        disabled={closingComplaints.has(complaint.id)}
                        className="px-3 py-1 text-xs"
                        variant="outline"
                        aria-label={t("account.complaints_actions.close_complaint", "Close Inquiry")}
                      />
                    )}

                    {/* Show message for unresolved complaints */}
                    {complaint.status !== "closed" && complaint.status !== "resolved" && !complaint.adminResponse && (
                      <div className={`text-xs ${metaText} text-center`}>
                        {t("account.complaints_actions.wait_for_resolution", "Our support team is reviewing this request.")}
                      </div>
                    )}
                  </div>

                  {/* Follow-up form */}
                  {complaint.status !== "closed" && (
                    <div className={`rounded-lg border p-3 space-y-2 ${isDark ? "border-slate-800 bg-slate-900" : "border-emerald-100 bg-emerald-50/60"}`}>
                      <label className="text-sm font-semibold">
                        {t("account.complaints_actions.add_follow_up", "Add follow-up")}
                      </label>
                      <textarea
                        value={followUps[complaint.id] ?? ""}
                        onChange={(e) => setFollowUps((prev) => ({ ...prev, [complaint.id]: e.target.value }))}
                        rows={3}
                        className={`w-full rounded-md border px-3 py-2 text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-emerald-200 text-slate-900"}`}
                        placeholder={t("account.complaints_actions.follow_up_placeholder", "Add details to clarify your issue")}
                      />
                      <div className="flex justify-end">
                        <Button
                          text={sendingFollowUps.has(complaint.id)
                            ? t("common.sending", "Sending...")
                            : t("account.complaints_actions.send_follow_up", "Send follow-up")}
                          onClick={() => handleSendFollowUp(complaint.id)}
                          disabled={sendingFollowUps.has(complaint.id)}
                          className="px-4 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
            </div>

            {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onPageChange={setPage}
            className="mt-8"
          />
          </div>
        )}

      </div>

      {/* Confirmation Dialog for Closing Complaints */}
      {confirmClose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl border shadow-xl max-w-md w-full p-6 ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${isDark ? "bg-amber-900/30" : "bg-amber-100"}`}>
                <AlertCircle className={`h-6 w-6 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {t("account.complaints_actions.close_complaint", "Close Inquiry")}
              </h3>
            </div>

            <p className={`text-sm mb-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {t("account.confirm_close_message", "Are you sure you want to close this inquiry? This action cannot be undone.")}
            </p>

            <div className="flex gap-3">
              <Button
                text={t("common.cancel", "Cancel")}
                onClick={cancelCloseComplaint}
                variant="outline"
                className={`flex-1 ${isDark ? "border-slate-600 text-slate-300 hover:bg-slate-800" : ""}`}
                aria-label={t("common.cancel", "Cancel closing complaint")}
              />
              <Button
                text={closingComplaints.has(confirmClose)
                  ? t("account.complaints_actions.closing", "Closing...")
                  : t("account.complaints_actions.close_complaint", "Close Inquiry")
                }
                onClick={confirmCloseComplaint}
                disabled={closingComplaints.has(confirmClose)}
                className={`flex-1 ${isDark ? "bg-red-700 hover:bg-red-800" : "bg-red-600 hover:bg-red-700"} text-white`}
                aria-label={t("account.complaints_actions.close_complaint", "Confirm close inquiry")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
