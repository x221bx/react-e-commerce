// src/pages/account/SupportCenterProfessional.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { sendSupportMessage } from "../UserSettings/services/userSettingsService";
import { HeadphonesIcon } from "lucide-react";
import { UseTheme } from "../../theme/ThemeProvider";
import toast from "react-hot-toast";

// (same extractResponseText & moderateMessage code — unchanged)

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

  // Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: "",
    phoneNumber: "",
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    {
      id: "orders",
      title: t("support.topics.orders"),
      description: t("support.topics.orders_desc"),
    },
    {
      id: "billing",
      title: t("support.topics.billing"),
      description: t("support.topics.billing_desc"),
    },
    {
      id: "products",
      title: t("support.topics.product"),
      description: t("support.topics.product_desc"),
    },
    {
      id: "technical",
      title: t("support.topics.technical"),
      description: t("support.topics.technical_desc"),
    },
    {
      id: "account",
      title: t("support.topics.account"),
      description: t("support.topics.account_desc"),
    },
    {
      id: "other",
      title: t("support.topics.other"),
      description: t("support.topics.other_desc"),
    },
  ];

  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return t("support.validation.phoneRequired");
    if (digits.length !== 11) return t("support.validation.phoneInvalidLength");
    if (!/^01[0-2,5]\d{8}$/.test(digits))
      return t("support.validation.phoneInvalidFormat");
    return "";
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.category)
          newErrors.category = t("support.validation.categoryRequired");
        break;

      case 2:
        if (!formData.subject.trim())
          newErrors.subject = t("support.validation.subjectRequired");
        if (!formData.description.trim())
          newErrors.description = t(
            "support.validation.descriptionRequired"
          );
        break;

      case 3:
        const phoneErr = validatePhone(formData.phoneNumber);
        if (phoneErr) newErrors.phoneNumber = phoneErr;
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const moderation = await moderateMessage(formData.description);
      if (!moderation.allowed) {
        toast.error(moderation.reason);
        return;
      }

      await sendSupportMessage(user, formData);

      toast.success(t("support.messages.submitSuccess"));
      navigate("/account/complaints");
    } catch (err) {
      toast.error(
        err.message || t("support.messages.submitError")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const selectedCategory = categories.find(
    (cat) => cat.id === formData.category
  );

  // ----------------------------------------------------------------
  // UI THEME UPGRADE — CYBER EMERALD GLASS
  // ----------------------------------------------------------------

  const pageBg = isDark
    ? "bg-gradient-to-b from-black via-emerald-950/40 to-black"
    : "bg-gradient-to-b from-white to-emerald-50/60";

  const cardGlass = `
    rounded-3xl border 
    ${isDark ? "border-emerald-900/40 bg-emerald-900/10" : "border-emerald-200 bg-white/80"}
    backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.25)] 
    transition-all duration-300 hover:shadow-[0_0_60px_rgba(16,185,129,0.35)]
  `;

  const headerGlow = `
    inline-flex items-center justify-center w-20 h-20 
    rounded-3xl bg-emerald-600/20 
    shadow-[0_0_35px_rgba(16,185,129,0.45)] backdrop-blur-xl
  `;

  const titleColor = isDark ? "text-emerald-200" : "text-emerald-700";

  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------

  return (
    <div className={`min-h-screen py-10 px-4 ${pageBg} transition-all`}>
      <div className="max-w-4xl mx-auto">

        {/* ------------------ HEADER ------------------ */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className={headerGlow}>
            <HeadphonesIcon className="w-10 h-10 text-emerald-400" />
          </div>

          <h1
            className={`text-4xl font-bold mt-6 mb-3 tracking-tight ${titleColor}`}
          >
            {t("support.title")}
          </h1>

          <p className={`text-lg ${isDark ? "text-emerald-100/70" : "text-slate-600"}`}>
            {t("support.subtitle")}
          </p>
        </div>

        {/* ------------------ PROGRESS ------------------ */}
        <SupportFormProgress currentStep={currentStep} isDark={isDark} />

        {/* ------------------ FORM WRAPPER (GLASS CARD) ------------------ */}
        <div
          className={`${cardGlass} p-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}
        >
          {/* Steps */}
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
