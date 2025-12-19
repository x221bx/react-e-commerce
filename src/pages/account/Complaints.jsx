// src/pages/account/Complaints.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { Phone, CalendarDays, AlertCircle, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

import ChatConversation from "../admin/components/ChatConversation";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { db } from "../../services/firebase";
import Button from "../../components/ui/Button";
import Section from "../../components/ui/Section";
import EmptyState from "../../components/ui/EmptyState";
import LoadingGrid from "../../components/ui/LoadingGrid";
import Badge from "../../components/ui/Badge";

const formatDateTime = (value) => {
  if (!value) return "";
  if (value.toDate) return value.toDate().toLocaleString();
  if (value.seconds) return new Date(value.seconds * 1000).toLocaleString();
  return new Date(value).toLocaleString();
};

const useRateLimiter = (maxAttempts = 3, windowMs = 60000) => {
  const [attempts, setAttempts] = useState([]);
  const isRateLimited = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter((time) => now - time < windowMs);
    return recentAttempts.length >= maxAttempts;
  };
  const recordAttempt = () => {
    const now = Date.now();
    setAttempts((prev) => [...prev.filter((time) => now - time < windowMs), now]);
  };
  return { isRateLimited, recordAttempt };
};

export default function Complaints() {
  const { t, i18n } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [response, setResponse] = useState("");
  const [sending, setSending] = useState(false);
  const isRTL = (i18n.language || "en").startsWith("ar");
  const { isRateLimited, recordAttempt } = useRateLimiter();
  const chatRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, "complaints"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setComplaints(list);
        if (list.length && !selectedComplaint) setSelectedComplaint(list[0]);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [user?.uid, selectedComplaint]);

  const handleSelect = (c) => {
    setSelectedComplaint(c);
    setResponse("");
  };

  const handleSendResponse = async () => {
    if (!selectedComplaint) return;
    const text = response.trim();
    if (!text) return;
    if (isRateLimited()) {
      toast.error(t("complaints.rateLimit", "Please wait before sending more messages."));
      return;
    }
    recordAttempt();

    setSending(true);
    try {
      const ref = doc(db, "complaints", selectedComplaint.id);
      const snapshot = await getDoc(ref);
      if (!snapshot.exists()) throw new Error("Complaint not found");
      const data = snapshot.data();
      const arr = Array.isArray(data.adminResponses) ? data.adminResponses : [];
      const updated = [
        {
          message: text,
          sender: "customer",
          createdAt: new Date().toISOString(),
        },
        ...arr,
      ];
      await updateDoc(ref, { adminResponses: updated });
      setResponse("");
      toast.success(t("complaints.sent", "Message sent"));
    } catch (err) {
      toast.error(err.message || t("complaints.sendFailed", "Failed to send"));
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <EmptyState
        title={t("complaints.loginTitle", "Please log in")}
        message={t("complaints.loginSubtitle", "Sign in to view and send complaints.")}
        action={<Button onClick={() => navigate("/login")}>{t("common.login", "Login")}</Button>}
      />
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        <Section
          title={t("account.complaints", "Complaints & Support")}
          subtitle={t("account.complaints_description", "View your tickets and send follow-ups")}
        >
          {loading ? (
            <LoadingGrid items={3} />
          ) : complaints.length === 0 ? (
            <EmptyState
              title={t("complaints.emptyTitle", "No complaints yet")}
              message={t("complaints.emptySubtitle", "If you submit a complaint, it will appear here.")}
              action={
                <Button onClick={() => navigate("/support")} size="md">
                  {t("complaints.goSupport", "Go to support")}
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
              {/* List */}
              <div className="space-y-2">
                {complaints.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className={`w-full text-left rounded-[var(--radius-md)] border px-4 py-3 transition hover:bg-[var(--color-surface-muted)] ${
                      selectedComplaint?.id === c.id
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                        : "border-[var(--color-border)] bg-[var(--color-surface)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                          {c.subject || t("complaints.noSubject", "No subject")}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                          <CalendarDays className="inline-block mr-1 h-3 w-3" /> {formatDateTime(c.createdAt)}
                        </p>
                      </div>
                      <Badge tone={c.priority === "high" ? "danger" : c.priority === "medium" ? "warning" : "neutral"}>
                        {c.priority || t("complaints.priority", "Priority")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)] line-clamp-2">{c.message}</p>
                  </button>
                ))}
              </div>

              {/* Detail */}
              {selectedComplaint ? (
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                        {t("complaints.ticket", "Ticket")} #{selectedComplaint.id}
                      </p>
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        {selectedComplaint.subject || t("complaints.noSubject", "No subject")}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                        <Phone className="h-4 w-4" /> {selectedComplaint.phone || t("complaints.noPhone", "No phone")}
                      </p>
                    </div>
                    <Badge tone={statusTone(selectedComplaint.status)}>
                      {selectedComplaint.status || t("complaints.status", "Status")}
                    </Badge>
                  </div>

                  <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-sm text-[var(--color-text-muted)]">
                    {selectedComplaint.message}
                  </div>

                  <div ref={chatRef} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                    <ChatConversation
                      complaint={selectedComplaint}
                      adminResponses={selectedComplaint.adminResponses}
                      lastAdminResponse={selectedComplaint.adminResponse}
                      complaintId={selectedComplaint.id}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> {t("complaints.reply", "Send a reply")}
                    </label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                      rows={3}
                      placeholder={t("complaints.placeholder", "Write your message here...")}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={handleSendResponse} disabled={sending || !response.trim()}>
                        {t("complaints.send", "Send")}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:brightness-95"
                        onClick={() => setResponse("")}
                        disabled={sending || !response.trim()}
                      >
                        {t("complaints.clear", "Clear")}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title={t("complaints.select", "Select a ticket")}
                  message={t("complaints.selectSubtitle", "Choose a complaint on the left to view details.")}
                />
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
