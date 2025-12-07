// src/pages/UserSettings/components/sections/SecuritySection.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SectionCard from "../SectionCard";
import Input from "../../../../components/ui/Input";
import { Eye, EyeOff } from "lucide-react";
import { PasswordStrengthIndicator } from "../FormComponents";
import { sendPasswordReset } from "../../services/userSettingsService";
import toast from "react-hot-toast";

const SecuritySection = ({
  sectionId,
  securityRef,
  securityForm,
  handleSecurityChange,
  handlePasswordSubmit,
  isUpdatingPassword,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  setShowCurrentPassword,
  setShowNewPassword,
  setShowConfirmPassword,
  passwordStrength,
  securityErrors,
  user
}) => {
  const { t } = useTranslation();
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleForgotPassword = async () => {
    if (!user?.email) {
      toast.error(
        t(
          "settings.forgotPasswordNoEmail",
          "No email address found for your account."
        )
      );
      return;
    }

    setIsSendingReset(true);
    try {
      await sendPasswordReset(user.email);
      toast.success(
        t(
          "settings.forgotPasswordSuccess",
          "Password reset email sent! Check your inbox."
        )
      );
    } catch (error) {
      toast.error(
        error.message ||
          t("settings.forgotPasswordError", "Failed to send reset email.")
      );
    } finally {
      setIsSendingReset(false);
    }
  };

  // Utility to wrap Input + Password toggle
  const PasswordWrapper = ({
    label,
    name,
    value,
    error,
    show,
    onToggle,
    onChange
  }) => (
    <div className="relative">
      <Input
        label={label}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 bottom-3 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );

  return (
    <SectionCard
      sectionId={sectionId}
      innerRef={securityRef}
      eyebrow={t("settings.securitySection", "Security")}
      title={t("settings.securityTitle", "Keep your account protected")}
      description={t(
        "settings.securityDescription",
        "Use a unique password and refresh it frequently."
      )}
      tone="highlight"
    >
      <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
        
        {/* Current Password */}
        <PasswordWrapper
          label={t("settings.currentPassword", "Current Password")}
          name="currentPassword"
          value={securityForm.currentPassword}
          error={securityErrors.currentPassword}
          show={showCurrentPassword}
          onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
          onChange={(v) => handleSecurityChange("currentPassword", v)}
        />

        {/* Forgot Password link */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isSendingReset}
            className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline disabled:opacity-50"
          >
            {isSendingReset
              ? t("settings.sendingReset", "Sending...")
              : t("settings.forgotPassword", "Forgot password?")}
          </button>
        </div>

        {/* New + Confirm Password */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <PasswordWrapper
              label={t("settings.newPassword", "New Password")}
              name="newPassword"
              value={securityForm.newPassword}
              error={securityErrors.newPassword}
              show={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
              onChange={(v) => handleSecurityChange("newPassword", v)}
            />

            {securityForm.newPassword && (
              <PasswordStrengthIndicator strength={passwordStrength} />
            )}
          </div>

          <PasswordWrapper
            label={t("settings.confirmNewPassword", "Confirm New Password")}
            name="confirmPassword"
            value={securityForm.confirmPassword}
            error={securityErrors.confirmPassword}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            onChange={(v) => handleSecurityChange("confirmPassword", v)}
          />
        </div>

        {/* Password Tip */}
        <div className="rounded-2xl border px-4 py-3 text-sm border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-[#0f1d1d]/70 dark:text-emerald-200">
          {t(
            "settings.passwordTip",
            "نصيحة: كوّن كلمة مرور من 12 حرفاً فأكثر مع أرقام ورموز، وتجنّب إعادة استخدام كلمات المرور."
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isUpdatingPassword}
          className="inline-flex items-center rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70 dark:bg-green-500 dark:hover:bg-green-600"
        >
          {isUpdatingPassword
            ? t("settings.updatingPassword", "Updating...")
            : t("settings.updatePassword", "Update password")}
        </button>
      </form>
    </SectionCard>
  );
};

export default SecuritySection;
