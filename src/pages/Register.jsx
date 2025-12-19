// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AuthLayout from "../Authcomponents/AuthLayout";
import InputField from "../Authcomponents/InputField";
import PasswordField from "../Authcomponents/PasswordField";
import AuthActions from "../Authcomponents/AuthActions";
import { signUp, clearAuthError } from "../features/auth/authSlice";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";

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
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Section
          title={t("auth.register_title", "Create your account")}
          subtitle={t("auth.register_subtitle", "Join us today!")}
        >
          {serverMsg && (
            <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-success)]/10 px-3 py-2 text-sm text-[var(--color-success)]">
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
                err?.fieldErrors &&
                  Object.entries(err.fieldErrors).forEach(([k, msg]) => setFieldError(k, msg));
                setServerMsg(err?.message || t("auth.signup_failed", "Signup failed."));
              } else onSuccess();
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                <InputField name="name" label={t("auth.full_name", "Full name")} />
                <InputField name="username" label={t("auth.username", "Username")} />
                <InputField name="email" label={t("auth.email", "Email")} type="email" />
                <PasswordField name="password" label={t("auth.password", "Password")} />
                <PasswordField name="confirm" label={t("auth.confirm_password", "Confirm password")} />

                <AuthActions
                  isSubmitting={isSubmitting}
                  submitLabel={t("auth.register", "Create Account")}
                  altText={t("auth.have_account", "Already have an account?")}
                  altLink="/login"
                  altLabel={t("auth.sign_in", "Sign in")}
                  buttonClass="rounded-[var(--radius-md)] bg-[var(--color-accent)] hover:brightness-95"
                />
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
