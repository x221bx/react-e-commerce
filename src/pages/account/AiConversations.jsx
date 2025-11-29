import { useMemo } from "react";
import { UseTheme } from "../../theme/ThemeProvider";
import { MessageSquare, Bot, Clock, Sparkles } from "lucide-react";

const mockThreads = [
  {
    id: "thread-1",
    title: "Product usage tips for Nitro Plus",
    summary: "AI suggested a step-by-step foliar spray routine with mixing ratios.",
    updatedAt: "2025-11-25T12:30:00Z",
    tone: "guide",
  },
  {
    id: "thread-2",
    title: "Troubleshooting irrigation clogging",
    summary: "Assistant provided a checklist to flush lines and monitor pressure.",
    updatedAt: "2025-11-20T09:15:00Z",
    tone: "technical",
  },
];

const toneBadge = {
  guide: { label: "Guide", color: "bg-emerald-100 text-emerald-700" },
  technical: { label: "Technical", color: "bg-sky-100 text-sky-700" },
  general: { label: "General", color: "bg-slate-100 text-slate-700" },
};

export default function AiConversations() {
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const threads = useMemo(() => mockThreads, []);

  return (
    <section
      className={`min-h-screen px-4 py-8 sm:px-6 lg:px-8 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-200">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">AI Conversations</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review the latest interactions with your farming assistant. Use them as quick playbooks for repeating tasks.
            </p>
          </div>
        </header>

        {threads.length === 0 ? (
          <div
            className={`rounded-3xl border p-8 text-center text-sm ${
              isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
            }`}
          >
            <Sparkles className="mx-auto mb-3 h-6 w-6 text-emerald-500" />
            <p className="font-medium">No conversations yet</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Start chatting with the AI assistant to see your history here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <article
                key={thread.id}
                className={`rounded-2xl border p-5 shadow-sm ${
                  isDark ? "border-slate-800 bg-slate-900" : "border-white bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-emerald-500" />
                    <h2 className="text-lg font-semibold">{thread.title}</h2>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      toneBadge[thread.tone]?.color || toneBadge.general.color
                    }`}
                  >
                    {toneBadge[thread.tone]?.label || toneBadge.general.label}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{thread.summary}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(thread.updatedAt).toLocaleString()}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
