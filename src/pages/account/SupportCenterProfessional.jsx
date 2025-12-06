import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { sendSupportMessage } from "../UserSettings/services/userSettingsService";
import { HeadphonesIcon } from "lucide-react";
import { UseTheme } from "../../theme/ThemeProvider";
import toast from "react-hot-toast";

// Import moderateMessage from Complaints.jsx
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

const moderateMessage = async (text) => {
  const API_KEY = import.meta.env.VITE_OR_KEY || import.meta.env.VITE_OPENAI_KEY;
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
        reason: reason || "Message contains inappropriate content",
      };
    }
    return { allowed: true };
  } catch (error) {
    return { allowed: false, reason: "Moderation failed, please try again" };
  }
};

import SupportFormStep1 from "./components/SupportFormStep1";
import SupportFormStep2 from "./components/SupportFormStep2";
import SupportFormStep3 from "./components/SupportFormStep3";
import SupportFormStep4 from "./components/SupportFormStep4";
import SupportFormProgress from "./components/SupportFormProgress";
import SupportFormNavigation from "./components/SupportFormNavigation";

const SupportCenterProfessional = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const isDark = theme === "dark";

  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: "",
    phoneNumber: "",
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Categories for the form
  const categories = [
    {
      id: "orders",
      title: t("support.topics.orders"),
      description: t("support.topics.orders_desc")
    },
    {
      id: "billing",
      title: t("support.topics.billing"),
      description: t("support.topics.billing_desc")
    },
    {
      id: "products",
      title: t("support.topics.product"),
      description: t("support.topics.product_desc")
    },
    {
      id: "technical",
      title: t("support.topics.technical"),
      description: t("support.topics.technical_desc")
    },
    {
      id: "account",
      title: t("support.topics.account"),
      description: t("support.topics.account_desc")
    },
    {
      id: "other",
      title: t("support.topics.other"),
      description: t("support.topics.other_desc")
    }
  ];



  // Validation functions
  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return t("support.validation.phoneRequired");
    if (digits.length !== 11) return t("support.validation.phoneInvalidLength");
    if (!/^01[0-2,5]\d{8}$/.test(digits)) return t("support.validation.phoneInvalidFormat");
    return "";
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.category) newErrors.category = t("support.validation.categoryRequired");
        break;
      case 2:
        if (!formData.subject.trim()) newErrors.subject = t("support.validation.subjectRequired");
        if (!formData.description.trim()) newErrors.description = t("support.validation.descriptionRequired");
        break;
      case 3: {
        const phoneError = validatePhone(formData.phoneNumber);
        if (phoneError) newErrors.phoneNumber = phoneError;
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // AI moderation for the message
      const moderationVerdict = await moderateMessage(formData.description);
      if (!moderationVerdict.allowed) {
        toast.error(moderationVerdict.reason);
        return;
      }

      await sendSupportMessage(user, {
        category: formData.category,
        subject: formData.subject,
        description: formData.description,
        phoneNumber: formData.phoneNumber,
        attachments: formData.attachments
      });

      toast.success(t("support.messages.submitSuccess"));
      navigate("/account/complaints");
    } catch (error) {
      toast.error(error.message || t("support.messages.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  return (
    <div className={`min-h-screen py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 `}>
            <HeadphonesIcon className="w-8 h-8" />
          </div>
          <h1 className={`text-3xl font-bold mb-2  `}>
            {t("support.title")}
          </h1>
          <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            {t("support.subtitle")}
          </p>
        </div>

        {/* Progress Indicator */}
        <SupportFormProgress currentStep={currentStep} isDark={isDark} />

        {/* Form Container */}
        <div className={`rounded-2xl shadow-xl overflow-hidden ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        } border`}>

          {/* Step Content */}
          {currentStep === 1 && (
            <SupportFormStep1
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              isDark={isDark}
            />
          )}

          {currentStep === 2 && (
            <SupportFormStep2
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              isDark={isDark}
            />
          )}

          {currentStep === 3 && (
            <SupportFormStep3
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              isDark={isDark}
            />
          )}

          {currentStep === 4 && (
            <SupportFormStep4
              formData={formData}
              selectedCategory={selectedCategory}
              isDark={isDark}
            />
          )}

          {/* Navigation */}
          <SupportFormNavigation
            currentStep={currentStep}
            totalSteps={4}
            handlePrev={handlePrev}
            handleNext={handleNext}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default SupportCenterProfessional;