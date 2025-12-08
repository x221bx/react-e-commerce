import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { Phone, CalendarDays, AlertCircle, MessageSquare } from "lucide-react";
import ChatConversation from "../admin/components/ChatConversation";
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

const formatDateTime = (value) => {
  if (!value) return "";
  if (value.toDate) return value.toDate().toLocaleString();
  if (value.seconds) return new Date(value.seconds * 1000).toLocaleString();
  return new Date(value).toLocaleString();
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
  const [activeChat, setActiveChat] = useState(null);
  const user = useSelector(selectCurrentUser);
  const { theme } = UseTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const isRTL = (i18n.dir && i18n.dir() === "rtl") || (i18n.language || "").startsWith("ar");
  const rateLimiter = useRateLimiter(3, 60000); // 3 attempts per minute
  const [followUps, setFollowUps] = useState({});
  const [sendingFollowUps, setSendingFollowUps] = useState(new Set());
  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [activeFollowUp, setActiveFollowUp] = useState(null);

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

  const FollowUpModal = () =>
    activeFollowUp && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border ${isDark ? "bg-slate-950 border-slate-800" : "bg-white border-gray-100"}`}>
          <div className={`px-6 py-4 flex items-center justify-between border-b ${isDark ? "border-slate-800" : "border-gray-200"}`}>
            <div>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>{t("account.complaints_actions.add_follow_up", "Add follow-up")}</p>
              <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {activeFollowUp.subject || activeFollowUp.category || t("account.complaints_topic_fallback", "General support")}
              </h3>
            </div>
            <button
              onClick={() => setActiveFollowUp(null)}
              className={`px-3 py-1 rounded-lg text-sm ${isDark ? "bg-slate-800 text-slate-200" : "bg-gray-100 text-gray-700"}`}
            >
              {t("common.close", "Close")}
            </button>
          </div>
          <div className="p-6 space-y-3">
            <textarea
              value={followUps[activeFollowUp.id] ?? ""}
              onChange={(e) => setFollowUps((prev) => ({ ...prev, [activeFollowUp.id]: e.target.value }))}
              rows={4}
              className={`w-full rounded-2xl border px-3 py-2 text-sm ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
              placeholder={t("account.complaints_actions.follow_up_placeholder", "Add details to clarify your issue")}
            />
            <div className="flex justify-end gap-2">
              <Button
                text={t("common.cancel", "Cancel")}
                onClick={() => setActiveFollowUp(null)}
                variant="outline"
                className="px-4 py-2 text-sm"
              />
              <Button
                text={sendingFollowUps.has(activeFollowUp.id) ? t("common.sending", "Sending...") : t("account.complaints_actions.send_follow_up", "Send follow-up")}
                onClick={() => handleSendFollowUp(activeFollowUp.id)}
                disabled={sendingFollowUps.has(activeFollowUp.id)}
                className="px-4 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    );

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
      setActiveFollowUp(null);
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
      <div className="min-h-screen flex items-center justify-center bg-white ">
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

  const cardSurface = isDark
  ? "bg-green-990 border-green-200 text-green-200"
  : "bg-white border-emerald-200 text-slate-900";

  const metaText = isDark ? "text-slate-300" : "text-slate-600";
  const getStatusStyles = (status) => {
    const key = (status || "").toLowerCase();
    switch (key) {
      case "resolved":
      case "closed":
        return {
          badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
          card: isDark ? "bg-emerald-950/30 border-emerald-900" : "bg-emerald-50/60 border-emerald-200",
        };
      case "pending":
      case "new":
        return {
          badge: "bg-sky-50 text-sky-700 border border-sky-100",
          card: isDark ? "bg-slate-800/60 border-slate-700" : "bg-sky-50/60 border-sky-200",
        };
      case "in-progress":
      case "open":
        return {
          badge: "bg-amber-50 text-amber-700 border border-amber-100",
          card: isDark ? "bg-amber-900/30 border-amber-800" : "bg-amber-50/60 border-amber-200",
        };
      default:
        return {
          badge: "bg-slate-100 text-slate-700 border border-slate-200",
          card: isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50/60 border-slate-200",
        };
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`min-h-screen ${isDark ? "bg-[#0c1f1a]" : "bg-white"} py-8`}>
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
            <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
              {paginatedData.map((complaint) => {
              const topicKey = complaint.category
                ? `account.complaints_topics.${complaint.category}`
                : "account.complaints_topic_fallback";
              const statusKey = complaint.status
                ? `account.complaints_status.${complaint.status}`
                : "account.complaints_status.pending";
              const created = formatDateTime(complaint.createdAt);
              const lastAdminReply = complaint.replies?.[complaint.replies.length - 1];
              const lastUserReply = complaint.userMessages?.[complaint.userMessages.length - 1];
              const statusStyles = getStatusStyles(complaint.status);

              return (
                <article
                  key={complaint.id}
                  className={`relative rounded-3xl border shadow-sm p-6 flex flex-col gap-5 hover:shadow-lg transition ${statusStyles.card}`}
                >
                  <div className="flex flex-col gap-4 w-full">
                    {/* Top meta row */}
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <span className={`text-sm font-mono font-semibold rounded-full px-3 py-1 ${isDark ? "bg-slate-800 text-emerald-300 border border-slate-700" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                        {complaint.ticketId || `#${complaint.id.slice(-6)}`}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles.badge}`}>
                        {t(statusKey, complaint.status || "Pending")}
                      </span>
                      <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${isDark ? "bg-slate-800 text-slate-200 border border-slate-700" : "bg-white text-slate-700 border border-slate-200"}`}>
                        <CalendarDays className="h-4 w-4" />
                        {created}
                      </span>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${isDark ? "bg-slate-800 text-slate-100 border border-slate-700" : "bg-white text-slate-800 border border-slate-200"}`}>
                        <Phone className="h-4 w-4 text-pink-500" />
                        <span className={metaText}>{complaint.phoneNumber || complaint.phone || t("account.complaints.phone_placeholder", "Not provided")}</span>
                      </span>
                    </div>

                    {/* Title & subject */}
                    <div className="space-y-1">
                      <p className={`text-xs uppercase tracking-[0.14em] font-semibold ${isDark ? "text-emerald-200" : "text-emerald-700"}`}>
                        {t("account.complaints_topic_fallback", "Topic")}
                      </p>
                      <h3 className="text-xl font-semibold leading-tight">
                        {t(topicKey, complaint.category || t("account.complaints_topic_fallback", "General support"))}
                      </h3>
                      <p className={`text-sm ${metaText}`}>
                        {complaint.subject || complaint.title || t("account.complaints_description", "Support inquiry")}
                      </p>
                    </div>

                    {/* Replies and customer message */}
                    <div className="grid sm:grid-cols-2 gap-3 w-full">
                      <div className={`rounded-2xl p-3 border w-full ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                        <p className={`text-xs font-semibold ${metaText}`}>
                          {t("account.complaints_last_admin", "Last admin reply:")}
                        </p>
                        <p className="text-sm font-medium mt-1 leading-relaxed">
                          {lastAdminReply?.message ? lastAdminReply.message : t("account.complaints_actions.no_response_yet", "No response yet")}
                        </p>
                        <p className={`text-xs mt-1 ${metaText}`}>
                          {lastAdminReply?.timestamp ? formatDateTime(lastAdminReply.timestamp) : "—"}
                        </p>
                      </div>
                      <div className={`rounded-2xl p-3 border w-full ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                        <p className={`text-xs font-semibold ${metaText}`}>
                          {t("account.complaints_last_user", "Last customer reply:")}
                        </p>
                        <p className="text-sm font-medium mt-1 leading-relaxed">
                          {lastUserReply?.message ? lastUserReply.message : (complaint.originalMessage || complaint.message || complaint.description || t("account.complaints_your_message", "Your Message"))}
                        </p>
                        <p className={`text-xs mt-1 ${metaText}`}>
                          {lastUserReply?.timestamp ? formatDateTime(lastUserReply.timestamp) : created}
                        </p>
                      </div>
                    </div>

                    {(complaint.originalMessage || complaint.message || complaint.description) && (
                      <div className={`p-4 rounded-2xl border w-full ${isDark ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                        <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                          {t("account.complaints_your_message", "Your Message")}
                        </p>
                        <p className={`text-sm ${metaText} mt-2 leading-relaxed`}>
                          {complaint.originalMessage || complaint.message || complaint.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Response state notice */}
                  {complaint.status === "pending" && !complaint.adminResponse && (
                    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"}`}>
                      <MessageSquare className={`h-5 w-5 mt-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${isDark ? "text-blue-200" : "text-blue-800"}`}>
                          {t("account.complaints_actions.no_response_yet", "No response yet")}
                        </p>
                        <p className={`text-xs ${metaText}`}>
                          {t("account.complaints_actions.awaiting_response", "We're reviewing your complaint and will respond soon.")}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {complaint.status !== "closed" && (
                      <div className="flex gap-2">
                        <Button
                          text={t("account.complaints_actions.add_follow_up", "Add follow-up")}
                          onClick={() => setActiveFollowUp(complaint)}
                          variant="outline"
                          className="px-4 py-2 text-xs rounded-xl"
                        />
                        <Button
                          text={t("account.complaints_actions.open_chat", "عرض المحادثة")}
                          onClick={() => setActiveChat(complaint)}
                          className="px-4 py-2 text-xs rounded-xl"
                        />
                      </div>
                    )}

                    {complaint.status !== "closed" && (
                      <Button
                        text={closingComplaints.has(complaint.id)
                          ? t("account.complaints_actions.closing", "Closing...")
                          : t("account.complaints_actions.close_complaint", "Close Inquiry")
                        }
                        onClick={() => handleCloseClick(complaint.id)}
                        disabled={closingComplaints.has(complaint.id)}
                        className="px-4 py-2 text-xs rounded-xl"
                        variant="outline"
                        aria-label={t("account.complaints_actions.close_complaint", "Close Inquiry")}
                      />
                    )}

                    {complaint.status !== "closed" && complaint.status !== "resolved" && !complaint.adminResponse && (
                      <div className={`text-xs ${metaText} text-center`}>
                        {t("account.complaints_actions.wait_for_resolution", "Our support team is reviewing this request.")}
                      </div>
                    )}
                  </div>
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

      {FollowUpModal()}

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

      {activeChat && (() => {
        const statusTone =
          (activeChat.status || "").toLowerCase() === "closed"
            ? "bg-gray-100 text-gray-700 border border-gray-200"
            : (activeChat.status || "").toLowerCase() === "resolved"
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
            : (activeChat.status || "").toLowerCase() === "in-progress"
            ? "bg-blue-100 text-blue-700 border border-blue-200"
            : "bg-yellow-100 text-yellow-700 border border-yellow-200";

        return (
          <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
            <div className={`w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border ${isDark ? "bg-slate-950 border-slate-800" : "bg-white border-gray-100"}`}>
              <div className={`px-6 py-4 flex items-center justify-between border-b ${isDark ? "border-slate-800" : "border-gray-200"}`}>
                <div className="space-y-1">
                  <p className={`text-sm uppercase tracking-[0.14em] ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>Conversation</p>
                  <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {activeChat.subject || "Support inquiry"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${statusTone}`}>
                      {t(`account.complaints_status.${(activeChat.status || "pending").toLowerCase()}`, activeChat.status || "pending")}
                    </span>
                    {activeChat.category && (
                      <span className={`px-2 py-1 rounded-full ${isDark ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-700"}`}>
                        {activeChat.category}
                      </span>
                    )}
                    <span className={`${isDark ? "text-slate-400" : "text-gray-600"}`}>
                      {formatDateTime(activeChat.createdAt)}
                    </span>
                  </div>
                  {activeChat.phoneNumber && (
                    <p className={`text-sm mt-2 flex items-center gap-2 ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                      <Phone className="w-4 h-4 text-pink-500" />
                      {activeChat.phoneNumber}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveChat(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${isDark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
                >
                  {t("common.close", "Close")}
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-4 px-6 py-6 bg-[radial-gradient(circle_at_20%_20%,#ecfdf3,transparent_35%),radial-gradient(circle_at_80%_0%,#e0f2fe,transparent_28%)] dark:bg-[radial-gradient(circle_at_20%_20%,#0c1f1a,transparent_30%),radial-gradient(circle_at_80%_0%,#0b3b27,transparent_30%)]">
                <ChatConversation
                  selectedComplaint={activeChat}
                  isDark={isDark}
                  lastMessageRef={lastMessageRef}
                />
              </div>

              {activeChat.status !== "closed" && (
                <div className={`px-6 py-4 border-t flex flex-col gap-3 ${isDark ? "border-slate-800 bg-slate-900" : "border-gray-200 bg-gray-50"}`}>
                  <label className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {t("account.complaints_actions.add_follow_up", "Add follow-up")}
                  </label>
                  <textarea
                    rows={3}
                    value={followUps[activeChat.id] ?? ""}
                    onChange={(e) => setFollowUps((prev) => ({ ...prev, [activeChat.id]: e.target.value }))}
                    placeholder={t("account.complaints_actions.follow_up_placeholder", "Add details or order reference...")}
                    className={`w-full rounded-2xl border px-3 py-2 text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      text={t("common.cancel", "Cancel")}
                      variant="outline"
                      onClick={() => setActiveChat(null)}
                      className="px-4 py-2 text-sm"
                    />
                    <Button
                      text={sendingFollowUps.has(activeChat.id) ? t("common.sending", "Sending...") : t("account.complaints_actions.send_follow_up", "Send follow-up")}
                      onClick={() => handleSendFollowUp(activeChat.id)}
                      disabled={sendingFollowUps.has(activeChat.id)}
                      className="px-4 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
