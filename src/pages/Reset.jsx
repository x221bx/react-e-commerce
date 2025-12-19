import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AuthLayout from "../Authcomponents/AuthLayout";
import InputField from "../Authcomponents/InputField";
import Section from "../components/ui/Section";
import { resetPassword, clearAuthError } from "../features/auth/authSlice";

const ResetSchema = Yup.object({
  emailOrUsername: Yup.string().required("Required"),
});

export default function Reset() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [serverMsg, setServerMsg] = useState(null);

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Section
          title={t("auth.reset_title", "Reset your password")}
          subtitle={t("auth.reset_subtitle", "Enter your email or username and we'll send you a reset link.")}
        >
          {serverMsg && (
            <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-success)]/10 px-3 py-2 text-sm text-[var(--color-success)]">
              {serverMsg}
            </div>
          )}

          <Formik
            initialValues={{ emailOrUsername: "" }}
            validationSchema={ResetSchema}
            onSubmit={async (vals, { setSubmitting, setFieldError }) => {
              setServerMsg(null);
              const result = await dispatch(resetPassword(vals));
              setSubmitting(false);

              if (resetPassword.rejected.match(result)) {
                const err = result.payload;
                if (err?.fieldErrors) {
                  Object.entries(err.fieldErrors).forEach(([k, msg]) =>
                    setFieldError(k, msg)
                  );
                }
                setServerMsg(err?.message || t("auth.reset_failed", "Unable to send reset link."));
              } else {
                setServerMsg(t("auth.reset_sent", "If the account exists, a reset email has been sent."));
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <InputField
                  name="emailOrUsername"
                  label={t("auth.email_or_username", "Email or Username")}
                  placeholder="email@example.com"
                />

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-3 text-base font-semibold text-white shadow-[var(--shadow-sm)] transition hover:brightness-95 disabled:opacity-70"
                  >
                    {isSubmitting
                      ? t("auth.reset_sending", "Sending...")
                      : t("auth.reset_cta", "Send reset link")}
                  </button>

                  <p className="text-center text-sm text-[var(--color-text-muted)]">
                    {t("auth.remember_password", "Remembered your password?")}{" "}
                    <Link to="/login" className="font-semibold text-[var(--color-accent)] hover:underline">
                      {t("auth.back_to_login", "Back to login")}
                    </Link>
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        </Section>

        <div className="mt-6">
          <AuthLayout.Footer />
        </div>
      </div>
    </div>
  );
}
