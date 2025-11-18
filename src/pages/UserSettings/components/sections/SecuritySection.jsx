import React from "react";
import SectionCard from "../SectionCard";
import { PasswordInput, PasswordStrengthIndicator } from "../FormComponents";

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
  securityErrors
}) => (
  <SectionCard
    sectionId={sectionId}
    innerRef={securityRef}
    eyebrow="Security"
    title="Keep your account protected"
    description="Use a unique password and refresh it frequently."
    tone="highlight"
  >
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
      <PasswordInput
        label="Current Password"
        name="currentPassword"
        value={securityForm.currentPassword}
        onChange={(e) => handleSecurityChange("currentPassword", e.target.value)}
        showPassword={showCurrentPassword}
        onToggleVisibility={() => setShowCurrentPassword(!showCurrentPassword)}
        error={securityErrors.currentPassword}
        required
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <PasswordInput
            label="New Password"
            name="newPassword"
            value={securityForm.newPassword}
            onChange={(e) => handleSecurityChange("newPassword", e.target.value)}
            showPassword={showNewPassword}
            onToggleVisibility={() => setShowNewPassword(!showNewPassword)}
            error={securityErrors.newPassword}
            required
          />
          {securityForm.newPassword && (
            <PasswordStrengthIndicator strength={passwordStrength} />
          )}
        </div>
        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          value={securityForm.confirmPassword}
          onChange={(e) => handleSecurityChange("confirmPassword", e.target.value)}
          showPassword={showConfirmPassword}
          onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
          error={securityErrors.confirmPassword}
          required
        />
      </div>

      <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
        Tip: combine at least 12 characters with numbers and symbols. Avoid
        reusing passwords from other services.
      </div>

      <button
        type="submit"
        disabled={isUpdatingPassword}
        className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70 dark:bg-emerald-500 dark:hover:bg-emerald-600"
      >
        {isUpdatingPassword ? "Updating..." : "Update password"}
      </button>
    </form>
  </SectionCard>
);

export default SecuritySection;