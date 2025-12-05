import { useState } from "react";
import { UseTheme } from "../../theme/ThemeProvider";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { sendSupportMessage } from "../UserSettings/services/userSettingsService";
import { XCircle, CheckCircle2, AlertCircle } from "lucide-react";

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

export default function SupportCenter() {
  const { theme } = UseTheme();
  const { t, i18n } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const isDark = theme === "dark";
  const isRtl = ((i18n?.dir && i18n.dir()) || (typeof document !== "undefined" ? document.documentElement.dir : "ltr")) === "rtl";

  const normalizePhoneInput = (value = "") =>
    value.replace(/\D/g, "").slice(0, 11);

  const validatePhoneNumber = (value = "") => {
    const digits = normalizePhoneInput(value);
    if (!digits) {
      return t(
        "support.phoneRequired",
        "Please provide your phone number for contact purposes"
      );
    }
    if (digits.length < 11) {
      return t(
        "support.phoneInvalid",
        "Please enter a valid Egyptian mobile (11 digits starting 010/011/012/015)"
      );
    }
    if (!/^01(0|1|2|5)\d{8}$/.test(digits)) {
      return t(
        "support.phoneInvalid",
        "Please enter a valid Egyptian mobile (11 digits starting 010/011/012/015)"
      );
    }
    return "";
  };

  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState("orders");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(
    normalizePhoneInput(user?.phone || "")
  );
  const [phoneError, setPhoneError] = useState("");
  const API_KEY = import.meta.env.VITE_OR_KEY || import.meta.env.VITE_OPENAI_KEY;

  const toastMessage = (message, tone = "info", id = undefined) => {
    const toneClasses = {
      success: "bg-emerald-50 text-emerald-800 border-emerald-200",
      error: "bg-red-50 text-red-800 border-red-200",
      info: "bg-slate-50 text-slate-800 border-slate-200",
    };
    const Icon =
      tone === "success"
        ? CheckCircle2
        : tone === "error"
        ? AlertCircle
        : AlertCircle;
    const closeText = tone === "success" ? t("common.ok", "OK") : "×";
    toast.custom(
      (toastItem) => (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-md ${toneClasses[tone]} ${
            toastItem.visible ? "animate-enter" : "animate-leave"
          }`}
        >
          <Icon className="h-5 w-5 mt-0.5" />
          <div className="flex-1 text-sm leading-5">{message}</div>
          <button
            type="button"
            onClick={() => toast.dismiss(toastItem.id)}
            className="text-xs font-semibold underline decoration-2 underline-offset-2"
            aria-label={t("common.close", "Close")}
          >
            {closeText}
          </button>
        </div>
      ),
      { id: id || undefined, duration: 8000 }
    );
  };

  const moderateMessage = async (text) => {
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
          reason: reason || t("support.messageInappropriate"),
        };
      }
      return { allowed: true };
    } catch (error) {
      console.error("AI moderation failed", error);
      return { allowed: false, reason: t("support.moderationFailed") };
    }
  };

  const handlePhoneChange = (value) => {
    const sanitized = normalizePhoneInput(value);
    setPhoneNumber(sanitized);
    setPhoneError(validatePhoneNumber(sanitized));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toastMessage(
        t("support.messageRequired", "Please enter a message"),
        "error"
      );
      return;
    }
    const sanitizedPhone = normalizePhoneInput(phoneNumber);
    const phoneValidationMessage = validatePhoneNumber(sanitizedPhone);
    setPhoneNumber(sanitizedPhone);
    setPhoneError(phoneValidationMessage);
    if (phoneValidationMessage) {
      toastMessage(phoneValidationMessage, "error");
      return;
    }
    if (!user) {
      toastMessage("Please log in to send a message", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const moderationVerdict = await moderateMessage(message);
      if (!moderationVerdict.allowed) {
        toast.error(moderationVerdict.reason);
        return;
      }

      await sendSupportMessage(user, {
        topic,
        message,
        phoneNumber: sanitizedPhone,
      });
      toastMessage(
        t(
          "support.messageSent",
          "Your message has been sent successfully!"
        ),
        "success"
      );
      setMessage("");
      setTopic("orders");
      const resetPhone = normalizePhoneInput(user?.phone || "");
      setPhoneNumber(resetPhone);
      setPhoneError(validatePhoneNumber(resetPhone));
    } catch (error) {
      toastMessage(
        error.message ||
          t(
            "support.messageError",
            "Failed to send message. Please try again."
          ),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

 const shellBg = isDark
    ? "bg-[#0f1d1d] text-slate-100"
    : "bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 text-slate-900";


  const cardSurface = isDark
    ? "bg-[#0f1d1d]/80 border-white/10 ring-white/10"
    : "bg-white/95 border-slate-100 ring-slate-100";


  const mutedText = isDark ? "text-slate-400" : "text-slate-500";
  const accent = isDark ? "text-emerald-300" : "text-emerald-600";

  return (
    <div className={`min-h-screen ${shellBg} py-10`}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Shell card */}
        <div
          className={`rounded-3xl border shadow-lg ring-1 ${cardSurface} px-6 py-8 sm:px-8 sm:py-10`}
        >
          {/* Header */}
          <div className={`mb-8 space-y-4 text-center ${isRtl ? "sm:text-right" : "sm:text-left"}`}>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-200 shadow-sm">
              <span className="text-2xl">✉</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-semibold">
                {t("support.title", "Feedback & Support")}
              </h1>
              <p className={`text-sm ${mutedText}`}>
                {t(
                  "support.subtitle",
                  "We're here to help! Share your feedback, report issues, or get assistance from our team of experts."
                )}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                {t("support.topic", "Topic")}
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  isDark
                    ? "border-emerald-900/40 bg-emerald-900/20 text-white"
                    : "border-emerald-200 bg-emerald-50 text-slate-900"
                }`}
              >
                <option value="orders">
                  {t("support.topics.orders", "Orders & Logistics")}
                </option>
                <option value="billing">
                  {t("support.topics.billing", "Billing & Payments")}
                </option>
                <option value="product">
                  {t("support.topics.product", "Product Feedback")}
                </option>
                <option value="ai">
                  {t("support.topics.ai", "AI Assistant")}
                </option>
                <option value="technical">
                  {t("support.topics.technical", "Technical Issues")}
                </option>
                <option value="other">
                  {t("support.topics.other", "Other")}
                </option>
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                {t("support.phoneNumber", "Phone Number")} *
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={11}
                aria-invalid={!!phoneError}
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => setPhoneError(validatePhoneNumber(phoneNumber))}
                className={`w-full rounded-2xl border px-4 py-3 text-sm shadow-sm focus:outline-none ${
                  phoneError
                    ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                } ${
                  isDark
                    ? "border-emerald-900/40 bg-emerald-900/20 text-white placeholder-emerald-200/60"
                    : "border-emerald-200 bg-emerald-50 text-slate-900 placeholder-emerald-600/50"
                }`}
                placeholder={t(
                  "support.phonePlaceholder",
                  "Enter your phone number for contact purposes"
                )}
              />
              {phoneError ? (
                <p className="text-xs text-red-500">{phoneError}</p>
              ) : (
                <p className={`text-xs ${mutedText}`}>
                  {t(
                    "support.phoneRequired",
                    "Required for us to contact you regarding your support request"
                  )}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                {t("support.message", "Message")}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className={`w-full rounded-2xl border px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none ${
                  isDark
                    ? "border-emerald-900/40 bg-emerald-900/20 text-white placeholder-emerald-200/60"
                    : "border-emerald-200 bg-emerald-50 text-slate-900 placeholder-emerald-600/50"
                }`}
                placeholder={t(
                  "support.placeholder",
                  "Please describe your issue, feedback, or question in detail..."
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? t("support.sending", "Sending...")
                  : t("support.sendMessage", "Send Message")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
