// src/pages/UserSettings/components/sections/SecuritySection.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SectionCard from "../SectionCard";
import Input from "../../../../components/ui/Input";
import { Eye, EyeOff, ShieldCheck, Lock, KeyRound } from "lucide-react";
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
  user,
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

  // Password input wrapper with toggle
  const PasswordWrapper = ({
    label,
    name,
    value,
    error,
    show,
    onToggle,
    onChange,
    Icon = Lock,
  }) => (
    <div className="relative group">
      <Input
        label={
          <span className="inline-flex items-center gap-2">
            <Icon className="h-4 w-4 text-emerald-400" />
            {label}
          </span>
        }
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        className="!pr-12"
      />

      {/* Show/Hide button */}
      <button
        type="button"
        onClick={onToggle}
        className="
          absolute right-3 bottom-3 text-emerald-300/70 
          hover:text-emerald-300 transition-all
          group-hover:scale-110
        "
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>

      {/* glow animation */}
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 bg-emerald-500/20 blur-xl transition-all"></div>
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
        "Use a strong password and refresh it frequently."
      )}
      className="relative overflow-hidden rounded-3xl border border-emerald-900/40
      bg-[#032221]/60 backdrop-blur-xl
      shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all duration-300"
    >
      {/* Floating emerald effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 right-0 h-40 w-40 rounded-full bg-emerald-600/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 left-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
      </div>

      {/* FORM */}
      <form
        onSubmit={handlePasswordSubmit}
        className="relative z-[5] space-y-6 text-slate-100"
        noValidate
      >
        {/* Current Password */}
        <PasswordWrapper
          label={t("settings.currentPassword")}
          name="currentPassword"
          value={securityForm.currentPassword}
          error={securityErrors.currentPassword}
          show={showCurrentPassword}
          onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
          onChange={(v) => handleSecurityChange("currentPassword", v)}
          Icon={KeyRound}
        />

        {/* Forgot password link */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isSendingReset}
            className="
              text-sm text-emerald-400 hover:text-emerald-300 underline 
              transition disabled:opacity-50
            "
          >
            {isSendingReset
              ? t("settings.sendingReset", "Sending...")
              : t("settings.forgotPassword")}
          </button>
        </div>

        {/* NEW + CONFIRM PASSWORD */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* New Password */}
          <div className="space-y-3">
            <PasswordWrapper
              label={t("settings.newPassword")}
              name="newPassword"
              value={securityForm.newPassword}
              error={securityErrors.newPassword}
              show={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
              onChange={(v) => handleSecurityChange("newPassword", v)}
              Icon={ShieldCheck}
            />

            {/* Strength meter */}
            {securityForm.newPassword && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <PasswordStrengthIndicator strength={passwordStrength} />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <PasswordWrapper
            label={t("settings.confirmNewPassword")}
            name="confirmPassword"
            value={securityForm.confirmPassword}
            error={securityErrors.confirmPassword}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            onChange={(v) => handleSecurityChange("confirmPassword", v)}
            Icon={Lock}
          />
        </div>

        {/* Password Tips */}
        <div
          className="
          rounded-2xl border border-emerald-600/40 bg-emerald-900/20 
          px-4 py-3 text-sm text-emerald-200 backdrop-blur-sm
          shadow-[0_0_18px_rgba(16,185,129,0.15)]
        "
        >
          {t(
            "settings.passwordTip",
            "نصيحة: كوّن كلمة مرور من 12 حرفاً فأكثر مع أرقام ورموز، وتجنّب إعادة استخدام كلمات المرور."
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUpdatingPassword}
          className="
            inline-flex items-center gap-2 rounded-xl bg-emerald-600 
            px-6 py-2.5 text-sm font-semibold text-white
            shadow hover:bg-emerald-500 
            active:scale-[0.97] transition disabled:opacity-60
          "
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
