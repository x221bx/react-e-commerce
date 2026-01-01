// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AuthLayout from "../Authcomponents/AuthLayout";
import InputField from "../Authcomponents/InputField";
import PasswordField from "../Authcomponents/PasswordField";
import AuthActions from "../Authcomponents/AuthActions";
import { signUp, clearAuthError } from "../features/auth/authSlice";

const SignupSchema = Yup.object({
  name: Yup.string().min(2).required(),
  email: Yup.string().email().required(),
  username: Yup.string().min(3).required(),
  password: Yup.string().min(6).required(),
  confirm: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required(),
});

export default function Register() {
  const { t } = useTranslation();
  const [serverMsg, setServerMsg] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const onSuccess = () => {
    setServerMsg(t("auth.signup_success", "Account created!"));
    navigate("/", { replace: true });
  };

  return (
    <AuthLayout
      eyebrow={t("auth.register_eyebrow", "New to Farm Vet?")}
      title={t("auth.register_title", "Create your account")}
      subtitle={t("auth.register_subtitle", "Join us today!")}
      variant="simple"
      note={t(
        "auth.register_note",
        "Use your clinic or professional email to speed up verification. You can add teammates after signing up."
      )}
    >
      <div className="space-y-5">
        {serverMsg && (
          <div className="rounded-[var(--radius-md)] border border-emerald-600/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
            {serverMsg}
          </div>
        )}

        <Formik
          initialValues={{ name: "", email: "", username: "", password: "", confirm: "" }}
          validationSchema={SignupSchema}
          onSubmit={async (vals, { setSubmitting, setFieldError }) => {
            setServerMsg(null);
            const { confirm, ...payload } = vals;
            const resultAction = await dispatch(signUp(payload));
            setSubmitting(false);

            if (signUp.rejected.match(resultAction)) {
              const err = resultAction.payload;
              err?.fieldErrors && Object.entries(err.fieldErrors).forEach(([k, msg]) => setFieldError(k, msg));
              setServerMsg(err?.message || t("auth.signup_failed", "Signup failed."));
            } else onSuccess();
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <InputField name="name" label={t("auth.full_name", "Full name")} autoComplete="name" />
              <InputField name="username" label={t("auth.username", "Username")} autoComplete="username" />
              <InputField
                name="email"
                label={t("auth.email", "Email")}
                type="email"
                autoComplete="email"
              />
              <PasswordField
                name="password"
                label={t("auth.password", "Password")}
                autoComplete="new-password"
              />
              <PasswordField
                name="confirm"
                label={t("auth.confirm_password", "Confirm password")}
                autoComplete="new-password"
              />

              <AuthActions
                isSubmitting={isSubmitting}
                submitLabel={t("auth.register", "Create Account")}
                altText={t("auth.have_account", "Already have an account?")}
                altLink="/login"
                altLabel={t("auth.sign_in", "Sign in")}
              />
            </Form>
          )}
        </Formik>
      </div>
    </AuthLayout>
  );
}
