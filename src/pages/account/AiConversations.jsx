import { UseTheme } from "../../theme/ThemeProvider";

const conversations = [
  {
    id: "soil-qa",
    topic: "Soil remediation plan",
    summary:
      "Discussed microbial boosters for 32 acres of depleted corn fields.",
    timestamp: "Yesterday, 3:10 PM",
  },
  {
    id: "nutrition-bot",
    topic: "Dairy herd nutrition",
    summary: "Adjusted ration to prepare for hotter evenings next week.",
    timestamp: "Jul 20, 2024",
  },
];

export default function AiConversations() {
  const { theme } = UseTheme();
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

  return (
    <div className={`space-y-6 ${pageText}`}>
      <header>
        <p className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
          Coaching assistant
        </p>
        <h1 className="text-3xl font-semibold">
          AI Conversations
        </h1>
        <p className={`text-sm ${muted}`}>
          Revisit strategic chats with the agronomy copilot and resume from
          where you left off.
        </p>
      </header>

      <div className="space-y-4">
        {conversations.map((conversation) => (
          <article
            key={conversation.id}
            className={`rounded-3xl border p-5 shadow-sm transition-colors ${cardSurface}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {conversation.topic}
              </h2>
              <span className={`text-xs uppercase tracking-wide ${muted}`}>
                {conversation.timestamp}
              </span>
            </div>
            <p className={`mt-2 text-sm ${muted}`}>
              {conversation.summary}
            </p>
            <div className="mt-4 flex gap-2">
              <button className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${ghostButton}`}>
                Export transcript
              </button>
              <button className={`rounded-xl px-4 py-1.5 text-sm font-semibold text-white transition ${solidButton}`}>
                Reopen chat
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
