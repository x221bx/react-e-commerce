// src/pages/account/SupportCenterProfessional.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { HeadphonesIcon } from "lucide-react";
import toast from "react-hot-toast";

import { selectCurrentUser } from "../../features/auth/authSlice";
import { sendSupportMessage } from "../UserSettings/services/userSettingsService";
import SupportFormStep1 from "./components/SupportFormStep1";
import SupportFormStep2 from "./components/SupportFormStep2";
import SupportFormStep3 from "./components/SupportFormStep3";
import SupportFormStep4 from "./components/SupportFormStep4";
import SupportFormProgress from "./components/SupportFormProgress";
import SupportFormNavigation from "./components/SupportFormNavigation";
import Section from "../../components/ui/Section";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

const moderateMessage = async (text) => {
  const API_KEY = import.meta.env.VITE_OR_KEY || import.meta.env.VITE_OPENAI_KEY;
  if (!API_KEY) return { allowed: true };

  const prompt = `You are a strict content moderator. Respond ALLOW or REJECT: <reason> for this text:\n${text}`;
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "X-Title": "Farm-Vet E-Shop Support",
    };
    if (typeof window !== "undefined" && window.location?.origin) {
      headers["HTTP-Referer"] = window.location.origin;
    }
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 120,
      }),
    });
    if (!res.ok) throw new Error("Moderation request failed");
    const data = await res.json();
    const verdictRaw =
      data?.choices?.[0]?.message?.content ||
      data?.output_text ||
      (Array.isArray(data?.output) ? data.output.map((o) => o?.content?.[0]?.text?.value || "").join(" ") : "");
    const verdict = String(verdictRaw || "").toUpperCase();
    if (verdict.startsWith("REJECT")) {
      return { allowed: false, reason: verdict.split(":").slice(1).join(":").trim() || "Content not allowed" };
    }
    return { allowed: true };
  } catch (err) {
    console.error("Moderation failed", err);
    return { allowed: false, reason: "Moderation failed, please try again." };
  }
};

const SupportCenterProfessional = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: "",
    phone: "",
    email: "",
    priority: "medium",
    attachments: [],
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.uid) {
      toast.error(t("support.login_required", "Please log in to submit a ticket."));
      navigate("/login");
      return;
    }

    if (!formData.subject || !formData.description) {
      toast.error(t("support.required_fields", "Subject and description are required."));
      return;
    }

    // Moderate content
    const verdict = await moderateMessage(`${formData.subject}\n${formData.description}`);
    if (!verdict.allowed) {
      toast.error(verdict.reason || t("support.blocked", "Message blocked by moderation."));
      return;
    }

    setSubmitting(true);
    try {
      await sendSupportMessage(user.uid, formData);
      toast.success(t("support.submitted", "Your ticket has been submitted"));
      setCurrentStep(4);
    } catch (error) {
      console.error("Support submission failed", error);
      toast.error(t("support.failed", "Failed to submit. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Section title={t("support.title", "Support Center")}>
        <EmptyState
          title={t("support.login_required", "Please log in to submit a ticket.")}
          message={t("support.login_subtitle", "Sign in to contact support and track your requests.")}
          action={<Button onClick={() => navigate("/login")}>{t("common.login", "Login")}</Button>}
        />
      </Section>
    );
  }

  return (
    <Section
      title={t("support.title", "Support Center")}
      subtitle={t("support.subtitle", "Submit a ticket and our team will get back to you.")}
      actions={
        <div className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 px-3 py-2 text-sm font-semibold text-[var(--color-text)]">
          <HeadphonesIcon className="h-4 w-4 text-[var(--color-accent)]" />
          {t("support.response_sla", "We typically respond within 24h")}
        </div>
      }
    >
      <div className="space-y-6">
        <SupportFormProgress currentStep={currentStep} />

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-6">
          {currentStep === 1 && (
            <SupportFormStep1 formData={formData} setFormData={setFormData} t={t} />
          )}
          {currentStep === 2 && (
            <SupportFormStep2 formData={formData} setFormData={setFormData} t={t} />
          )}
          {currentStep === 3 && (
            <SupportFormStep3 formData={formData} setFormData={setFormData} t={t} />
          )}
          {currentStep === 4 && (
            <SupportFormStep4 formData={formData} t={t} />
          )}
        </div>

        <SupportFormNavigation
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          t={t}
        />
      </div>
    </Section>
  );
};

export default SupportCenterProfessional;
