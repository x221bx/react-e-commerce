import { useState } from "react";
import { UseTheme } from "../../theme/ThemeProvider";

export default function SupportCenter() {
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState("orders");
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const accent = isDark ? "text-emerald-300" : "text-emerald-600";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const panelSurface = isDark
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-100 bg-white";
  const labelColor = isDark ? "text-slate-200" : "text-slate-700";
  const inputBase = isDark
    ? "border-slate-700 bg-slate-900 text-slate-100"
    : "border-slate-200 bg-white text-slate-700";
  const focusState = isDark
    ? "focus:border-emerald-500 focus:ring-emerald-500/30"
    : "focus:border-emerald-400 focus:ring-emerald-100";
  const outlineButton = isDark
    ? "border-slate-700 text-slate-200 hover:bg-slate-800/70"
    : "border-slate-200 text-slate-600 hover:bg-slate-50";

  return (
    <div className="space-y-6">
      <header>
        <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
          We're here to help
        </p>
        <h1 className={`text-3xl font-semibold ${headingColor}`}>Feedback & Support</h1>
        <p className={`text-sm ${muted}`}>
          Share product feedback or open a ticket with our logistics and vet specialists.
        </p>
      </header>

      <form className={`rounded-3xl border p-6 shadow-sm ${panelSurface}`}>
        <label className={`text-sm font-medium ${labelColor}`}>
          Topic
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={`mt-2 block w-full rounded-xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${inputBase} ${focusState}`}
          >
            <option value="orders">Orders & logistics</option>
            <option value="billing">Billing</option>
            <option value="product">Product feedback</option>
            <option value="ai">AI assistant</option>
          </select>
        </label>

        <label className={`mt-4 block text-sm font-medium ${labelColor}`}>
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className={`mt-2 block w-full rounded-2xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${inputBase} ${focusState}`}
            placeholder="Describe the issue or idea..."
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${outlineButton}`}
          >
            Attach file
          </button>
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Send message
          </button>
        </div>
      </form>
    </div>
  );
}
