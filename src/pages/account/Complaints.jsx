import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Phone, CalendarDays, AlertCircle, X, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

import { selectCurrentUser } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { db } from "../../services/firebase";
import Button from "../../components/ui/Button";

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
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
      const complaintRef = doc(db, "support", complaintId);
      await updateDoc(complaintRef, {
        userFollowUp: text,
        updatedAt: new Date()
      });
      toast.success(t("account.complaints_actions.follow_up_saved", "Follow-up sent"));
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
    ? "from-slate-900 via-slate-900 to-slate-900/90 text-white"
    : "from-emerald-50 via-white to-white text-slate-900";
  const cardSurface = isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900";
  const metaText = isDark ? "text-slate-300" : "text-slate-600";

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"} py-10`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className={`rounded-3xl border shadow-sm p-6 sm:p-8 bg-gradient-to-br ${heroSurface}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.18em] font-semibold text-emerald-700 dark:text-emerald-300">
                {t("account.complaints_title", "My Inquiries")}
              </p>
              <h1 className="text-3xl font-bold leading-tight">
                {t("account.complaints_subtitle", "Track your submitted inquiries and their resolution status.")}
              </h1>
              <p className={`text-sm ${metaText}`}>
                {t("account.complaints_helper", "Check status, contact info, and priority in one glance.")}
              </p>
            </div>
            <Button
              text={t("account.submit_new_complaint", "Submit New Inquiry")}
              onClick={() => navigate("/account/support")}
              className="px-8 py-3 text-lg font-semibold min-w-[200px]"
              aria-label={t("account.submit_new_complaint", "Submit New Inquiry")}
            />
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
          <div className="grid gap-4 md:grid-cols-2">
            {complaints.map((complaint) => {
              const topicKey = complaint.topic
                ? `account.complaints_topics.${complaint.topic}`
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
                      <p className={`text-xs uppercase tracking-[0.12em] font-semibold ${isDark ? "text-emerald-200" : "text-emerald-700"}`}>
                        {t("account.complaints_topic_fallback", "Topic")}
                      </p>
                      <h3 className="text-xl font-semibold leading-tight">
                        {t(topicKey, complaint.topic || t("account.complaints_topic_fallback", "General support"))}
                      </h3>
                      {complaint.description && (
                        <p className={`${metaText} line-clamp-2`}>{complaint.description}</p>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                        {t(statusKey, complaint.status || "Pending")}
                      </span>
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

                  {/* Admin Response */}
                  {complaint.adminResponse && (
                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${isDark ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"}`}>
                      <MessageSquare className={`h-5 w-5 mt-0.5 ${isDark ? "text-green-400" : "text-green-600"}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDark ? "text-green-300" : "text-green-800"}`}>
                          {t("common.admin_response", "Support Response")}
                        </p>
                        <p className={`text-xs ${metaText}`}>{complaint.adminResponse}</p>
                      </div>
                    </div>
                  )}
                  {complaint.userFollowUp && (
                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${isDark ? "bg-emerald-900/15 border-emerald-800" : "bg-emerald-50 border-emerald-200"}`}>
                      <MessageSquare className={`h-5 w-5 mt-0.5 ${isDark ? "text-emerald-300" : "text-emerald-600"}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDark ? "text-emerald-200" : "text-emerald-800"}`}>
                          {t("account.user_follow_up", "Your Follow-up")}
                        </p>
                        <p className={`text-xs ${metaText}`}>{complaint.userFollowUp}</p>
                      </div>
                    </div>
                  )}

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
                    {complaint.status !== "closed" && complaint.status !== "resolved" && (
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
                        value={followUps[complaint.id] ?? complaint.userFollowUp ?? ""}
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
