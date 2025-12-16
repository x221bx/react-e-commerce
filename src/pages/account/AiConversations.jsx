import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { subscribeToUserChatHistory } from "../../services/userDataService";

const HISTORY_NAMESPACE = "chatHistory";
const getHistoryKey = (uid) => (uid ? `${HISTORY_NAMESPACE}_${uid}` : `${HISTORY_NAMESPACE}_guest`);

const readLocalHistory = (uid) => {
  if (typeof window === "undefined") return [];
  try {
    let saved = localStorage.getItem(getHistoryKey(uid));
    if (!saved && !uid) {
      saved = localStorage.getItem(HISTORY_NAMESPACE);
    }
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const sanitizeText = (value = "") =>
  value
    .replace(/<productCard[^>]*>/gi, "[Product recommendation]")
    .replace(/<\/productCard>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();

const formatTimestamp = (value, t) => {
  if (!value) return t("account.aiConversations.justNow", "Just now");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("account.aiConversations.justNow", "Just now");
  return date.toLocaleString("en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildEntries = (history = []) => {
  const entries = [];
  for (let i = 0; i < history.length; i += 1) {
    const current = history[i];
    if (!current || current.role !== "user") continue;
    const assistant = history.slice(i + 1).find((msg) => msg.role === "assistant");
    entries.push({
      id: `${current.createdAt || assistant?.createdAt || i}`,
      prompt: sanitizeText(current.content || ""),
      response: sanitizeText(assistant?.content || ""),
      createdAt: current.createdAt || assistant?.createdAt || new Date().toISOString(),
    });
  }
  return entries.reverse();
};

export default function AiConversations() {
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const [history, setHistory] = useState(() => readLocalHistory(null));

  const hydrateHistory = useCallback(() => {
    setHistory(readLocalHistory(user?.uid || null));
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      // hydrate from local cache while waiting for firestore
      hydrateHistory();
      const unsubscribe = subscribeToUserChatHistory(user.uid, (chatHistory) => {
        setHistory(chatHistory || []);
      });
      return () => unsubscribe();
    }

    hydrateHistory();
    const handleUpdate = () => hydrateHistory();
    window.addEventListener("chat-history-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("chat-history-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [hydrateHistory, user?.uid]);

  const entries = useMemo(() => buildEntries(history), [history]);
  const hasEntries = entries.length > 0;

  const isDark = theme === "dark";
  const pageText = isDark ? "text-slate-100" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const cardSurface = isDark
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-100 bg-white";
  const ghostButton = isDark
    ? "border-slate-700 text-slate-200 hover:bg-slate-800"
    : "border-slate-200 text-slate-600 hover:bg-slate-50";
  const solidButton = isDark
    ? "bg-emerald-600 hover:bg-emerald-500"
    : "bg-emerald-500 hover:bg-emerald-600";

  const handleExport = (entry) => {
    const lines = [
      `Prompt:\n${entry.prompt}`,
      entry.response ? `Assistant:\n${entry.response}` : "",
    ].filter(Boolean);
    const blob = new Blob([lines.join("\n\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `conversation-${entry.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleReopen = (entry) => {
    window.dispatchEvent(
      new CustomEvent("open-chatbot", {
        detail: { prefill: entry.prompt },
      })
    );
  };

  const handleStartChat = () => {
    window.dispatchEvent(new CustomEvent("open-chatbot"));
  };

  return (
    <div className={`space-y-6 ${pageText}`}>
      <header>
        <p
          className={`text-sm font-semibold uppercase tracking-wide ${
            isDark ? "text-emerald-300" : "text-emerald-600"
          }`}
        >
          {t("account.aiConversations.eyebrow", "Coaching assistant")}
        </p>
        <h1 className="text-3xl font-semibold">{t("account.aiConversations.title", "AI Conversations")}</h1>
        <p className={`text-sm ${muted}`}>
          {hasEntries
            ? t("account.aiConversations.subtitleWithEntries", "Revisit strategic chats with the agronomy copilot and resume from where you left off.")
            : t("account.aiConversations.subtitleWithoutEntries", "You have not started any copilot chats yet. Launch the assistant to begin a new conversation.")}
        </p>
      </header>

      {!hasEntries && (
        <div
          className={`rounded-3xl border px-6 py-10 text-center ${cardSurface}`}
        >
          <p className={`text-base ${muted}`}>
            {t("account.aiConversations.emptySubtitle", "No saved transcripts yet. Every prompt you send to the floating AI assistant will appear here for quick reference.")}
          </p>
          <button
            onClick={handleStartChat}
            className={`mt-4 inline-flex items-center justify-center rounded-xl px-5 py-2 font-semibold text-white ${solidButton}`}
          >
            {t("account.aiConversations.startChat", "Start a new chat")}
          </button>
        </div>
      )}

      {hasEntries && (
        <div className="space-y-4">
          {entries.map((conversation) => (
            <article
              key={conversation.id}
              className={`rounded-3xl border p-5 shadow-sm transition-colors ${cardSurface}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold line-clamp-1">
                    {conversation.prompt || t("account.aiConversations.untitledPrompt", "Untitled prompt")}
                  </h2>
                  <p className={`mt-1 text-sm line-clamp-2 ${muted}`}>
                    {conversation.response || t("account.aiConversations.waitingResponse", "Waiting for assistant response...")}
                  </p>
                </div>
                <span className={`text-xs uppercase tracking-wide ${muted}`}>
                  {formatTimestamp(conversation.createdAt, t)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${ghostButton}`}
                  onClick={() => handleExport(conversation)}
                >
                  {t("account.aiConversations.exportTranscript", "Export transcript")}
                </button>
                <button
                  className={`rounded-xl px-4 py-1.5 text-sm font-semibold text-white transition ${solidButton}`}
                  onClick={() => handleReopen(conversation)}
                >
                  {t("account.aiConversations.reopenChat", "Reopen chat")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
