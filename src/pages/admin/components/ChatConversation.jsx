import React, { useEffect, useMemo } from "react";
import { User } from "lucide-react";

 const getMs = (ts) => {
  if (!ts) return 0;

  // Firestore Timestamp
  if (typeof ts?.toDate === "function") return ts.toDate().getTime();

  // Firestore-like { seconds, nanoseconds }
  if (typeof ts?.seconds === "number") {
    const ns = typeof ts.nanoseconds === "number" ? ts.nanoseconds : 0;
    return ts.seconds * 1000 + Math.floor(ns / 1e6);
  }

  // Date object
  if (ts instanceof Date) return ts.getTime();

  // Number: seconds or ms
  if (typeof ts === "number") return ts < 1e12 ? ts * 1000 : ts;

  // String date
  if (typeof ts === "string") {
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  }

  return 0;
};

const formatTime = (ts) => {
  const ms = getMs(ts);
  if (!ms) return "";
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return "";
  }
};

const pickText = (m) =>
  m?.message ?? m?.text ?? m?.body ?? m?.content ?? "";

const safeId = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const buildStableId = (prefix, baseId, idx, ts, text) => {
  const ms = getMs(ts);
  const tiny = (text || "").slice(0, 16).replace(/\s+/g, "-");
  return `${prefix}-${baseId}-${idx}-${ms}-${tiny || "msg"}`;
};

const ChatConversation = ({ selectedComplaint, isDark, lastMessageRef }) => {
  // Guard
  if (!selectedComplaint) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_50%,#f8fafc_100%)] dark:bg-slate-900/40">
        <p className={isDark ? "text-slate-300" : "text-slate-600"}>
          Select a complaint to view the conversation
        </p>
      </div>
    );
  }

  // مهم: نعتمد على length + آخر timestamp لتفادي مشكلة mutation (push) بدون تغيير reference
  const repliesArr = Array.isArray(selectedComplaint.replies) ? selectedComplaint.replies : [];
  const userArr = Array.isArray(selectedComplaint.userMessages) ? selectedComplaint.userMessages : [];

  const repliesSig = `${repliesArr.length}-${getMs(
    repliesArr[repliesArr.length - 1]?.timestamp ??
      repliesArr[repliesArr.length - 1]?.createdAt ??
      repliesArr[repliesArr.length - 1]?.time
  )}`;

  const userSig = `${userArr.length}-${getMs(
    userArr[userArr.length - 1]?.timestamp ??
      userArr[userArr.length - 1]?.createdAt ??
      userArr[userArr.length - 1]?.time
  )}`;

  const flatMessages = useMemo(() => {
    const baseId = safeId(selectedComplaint.id) || "unknown";

    const originalText = pickText({
      message: selectedComplaint.description || selectedComplaint.message,
    });

    const original = {
      id: `original-${baseId}`,
      message: originalText || "",
      sender: "user",
      timestamp: selectedComplaint.createdAt,
      type: "original",
    };

    const admin = repliesArr.map((reply, idx) => {
      const ts = reply?.timestamp ?? reply?.createdAt ?? reply?.time;
      const text = pickText(reply) || "";
      const id =
        safeId(reply?.clientId) ||
        safeId(reply?.id) ||
        buildStableId("admin", baseId, idx, ts, text);

      return {
        ...reply,
        id,
        message: text,
        sender: "admin",
        type: "admin",
        timestamp: ts,
      };
    });

    const user = userArr.map((msg, idx) => {
      const ts = msg?.timestamp ?? msg?.createdAt ?? msg?.time;
      const text = pickText(msg) || "";
      const id =
        safeId(msg?.clientId) ||
        safeId(msg?.id) ||
        buildStableId("user", baseId, idx, ts, text);

      return {
        ...msg,
        id,
        message: text,
        sender: "user",
        type: "followup",
        timestamp: ts,
      };
    });

    return [original, ...admin, ...user]
      .filter((m) => m.type === "original" || (m.message || "").trim() !== "")
      .sort((a, b) => getMs(a.timestamp) - getMs(b.timestamp));
  }, [
    selectedComplaint.id,
    selectedComplaint.createdAt,
    selectedComplaint.description,
    selectedComplaint.message,
    selectedComplaint.updatedAt,
    repliesSig,
    userSig,
  ]);

  // Auto-scroll ثابت
  useEffect(() => {
    const el = lastMessageRef?.current;
    if (!el) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    });
  }, [flatMessages.length, selectedComplaint?.updatedAt, selectedComplaint?.id, lastMessageRef]);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_50%,#f8fafc_100%)] dark:bg-slate-900/40">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Conversation
        </h3>

        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-600"
          }`}
        >
          {flatMessages.length} messages
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 scroll-smooth min-h-0 px-2 pb-4">
        {flatMessages.map((message, idx) => (
          <div
            key={message.id}
            ref={idx === flatMessages.length - 1 ? lastMessageRef : null}
            className={`flex w-full ${message.sender === "user" ? "justify-start" : "justify-end"}`}
          >
            <div className="flex flex-col gap-2 max-w-[75%]">
              {/* Badge */}
              <div
                className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full w-fit ${
                  message.sender === "user"
                    ? isDark
                      ? "bg-blue-900/70 text-blue-100"
                      : "bg-blue-50 text-blue-700"
                    : isDark
                    ? "bg-emerald-800 text-emerald-50"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {message.sender === "user" ? (
                  <>
                    <User className="w-4 h-4" />
                    <span>Customer</span>
                  </>
                ) : (
                  <>
                    <span>Support Team</span>
                    <div className={`w-2 h-2 rounded-full ${isDark ? "bg-emerald-400" : "bg-emerald-500"}`} />
                  </>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`relative rounded-2xl px-4 py-3 shadow-sm border ${
                  message.sender === "user"
                    ? isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-white border-slate-200 text-slate-900"
                    : isDark
                    ? "bg-emerald-700 border-emerald-600 text-white"
                    : "bg-emerald-500 border-emerald-400 text-white"
                }`}
              >
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {message.message || ""}
                </p>

                <p className={`text-[11px] mt-2 text-right ${message.sender === "user" ? "opacity-70" : "opacity-80"}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatConversation;
