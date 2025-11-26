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
  if (Array.isArray(payload.choices) && payload.choices[0]?.text) {
    return payload.choices[0].text;
  }
  return "";
};

export default function SupportCenter() {
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const isDark = theme === "dark";

  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState("orders");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const API_KEY = import.meta.env.VITE_OPENAI_KEY;
  const toastMessage = (message, tone = "info", id = undefined) => {
    const toneClasses = {
      success: "bg-emerald-50 text-emerald-800 border-emerald-200",
      error: "bg-red-50 text-red-800 border-red-200",
      info: "bg-slate-50 text-slate-800 border-slate-200",
    };
    const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : AlertCircle;
    const closeText = tone === "success" ? t("common.ok", "OK") : "×";
    toast.custom(
      (toastItem) => (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-md ${toneClasses[tone]} ${toastItem.visible ? "animate-enter" : "animate-leave"}`}
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
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: prompt,
        }),
      });

      if (!response.ok) throw new Error("Moderation request failed");

      const data = await response.json();
      const verdictRaw = extractResponseText(data).trim();
      const verdict = verdictRaw.toUpperCase();
      if (!verdict) return { allowed: true };
      if (verdict.startsWith("ALLOW")) return { allowed: true };
      if (verdict.startsWith("REJECT")) {
        const reason = verdictRaw.split(":").slice(1).join(":").trim();
        return { allowed: false, reason: reason || t("support.messageInappropriate") };
      }
      return { allowed: true };
    } catch (error) {
      console.error("AI moderation failed", error);
      return { allowed: false, reason: t("support.moderationFailed") };
    }
  };

  const validatePhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, "");
    return /^01(0|1|2|5)\d{8}$/.test(digits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toastMessage(t("support.messageRequired", "Please enter a message"), "error");
      return;
    }
    if (!phoneNumber.trim()) {
      toastMessage(t("support.phoneRequired", "Please provide your phone number for contact purposes"), "error");
      return;
    }
    if (!validatePhoneNumber(phoneNumber.trim())) {
      toastMessage(t("support.phoneInvalid", "Please enter a valid Egyptian mobile (11 digits starting 010/011/012/015)"), "error");
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
        phoneNumber: phoneNumber.trim(),
      });
      toastMessage(t("support.messageSent", "Your message has been sent successfully!"), "success");
      setMessage("");
      setTopic("orders");
      setPhoneNumber(user?.phone || "");
    } catch (error) {
      toastMessage(error.message || t("support.messageError", "Failed to send message. Please try again."), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"} py-8`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
            <span className="text-2xl">✉</span>
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            {t("support.title", "Feedback & Support")}
          </h1>
          <p className={isDark ? "text-slate-300" : "text-slate-600"}>
            {t("support.subtitle", "We're here to help! Share your feedback, report issues, or get assistance from our team of experts.")}
          </p>
        </div>

        <div className={`rounded-xl shadow-sm p-8 ${isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("support.topic", "Topic")}
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${isDark ? "border-slate-700 bg-slate-800 text-white" : "border-gray-300 bg-white text-slate-900"}`}
              >
                <option value="orders">{t("support.topics.orders", "Orders & Logistics")}</option>
                <option value="billing">{t("support.topics.billing", "Billing & Payments")}</option>
                <option value="product">{t("support.topics.product", "Product Feedback")}</option>
                <option value="ai">{t("support.topics.ai", "AI Assistant")}</option>
                <option value="technical">{t("support.topics.technical", "Technical Issues")}</option>
                <option value="other">{t("support.topics.other", "Other")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("support.phoneNumber", "Phone Number")} *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${isDark ? "border-slate-700 bg-slate-800 text-white" : "border-gray-300 bg-white text-slate-900"}`}
                placeholder={t("support.phonePlaceholder", "Enter your phone number for contact purposes")}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("support.phoneRequired", "Required for us to contact you regarding your support request")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("support.message", "Message")}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none ${isDark ? "border-slate-700 bg-slate-800 text-white" : "border-gray-300 bg-white text-slate-900"}`}
                placeholder={t("support.placeholder", "Please describe your issue, feedback, or question in detail...")}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? t("support.sending", "Sending...") : t("support.sendMessage", "Send Message")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



