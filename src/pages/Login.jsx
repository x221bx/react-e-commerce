// src/pages/Login.jsx
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AuthLayout from "../Authcomponents/AuthLayout";
import FieldRow from "../Authcomponents/InputField";
import PasswordField from "../Authcomponents/PasswordField";
import AuthActions from "../Authcomponents/AuthActions";
import { signInWithIdentifier, clearAuthError, selectCurrentUser } from "../features/auth/authSlice";
import Section from "../components/ui/Section";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

const LoginSchema = Yup.object({
  identifier: Yup.string()
    .required("Required")
    .test("email-or-username", "Invalid email format", (value) => {
      if (value && value.includes("@")) {
        return Yup.string().email().isValidSync(value);
      }
      return true;
    }),
  password: Yup.string().min(6, "Too short").required("Required"),
});

export default function Login() {
  const [serverMsg, setServerMsg] = useState(null);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const { search } = location;
  const redirectTo = new URLSearchParams(search).get("redirect") || "/";

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user?.isAdmin && location.pathname !== "/admin") {
      navigate("/admin", { replace: true });
    } else if ((user?.role === "delivery" || user?.isDelivery) && location.pathname !== "/delivery") {
      navigate("/delivery", { replace: true });
    }
  }, [user, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Section
          title={t("auth.login_title", "Sign in to your account")}
          subtitle={t("auth.login_subtitle", "Welcome back! Please login to continue.")}
        >
          {serverMsg && (
            <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
              {serverMsg}
            </div>
          )}

          <Formik
            initialValues={{ identifier: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={async (vals, { setSubmitting, setFieldError }) => {
              setServerMsg(null);
              const resultAction = await dispatch(signInWithIdentifier(vals));
              setSubmitting(false);

              if (signInWithIdentifier.fulfilled.match(resultAction)) {
                const signedUser = resultAction.payload;
                if (signedUser?.isAdmin) {
                  navigate("/admin", { replace: true });
                } else if (signedUser?.role === "delivery" || signedUser?.isDelivery) {
                  navigate("/delivery", { replace: true });
                } else {
                  navigate(redirectTo, { replace: true });
                }
              } else if (signInWithIdentifier.rejected.match(resultAction)) {
                const err = resultAction.payload;
                err?.fieldErrors &&
                  Object.entries(err.fieldErrors).forEach(([k, msg]) => {
                    setFieldError(k, msg);
                  });
                setServerMsg(err?.message || t("auth.login_failed", "Login failed."));
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <FieldRow
                  name="identifier"
                  label={t("auth.email_or_username", "Email or Username")}
                  placeholder="email@example.com"
                />

                <PasswordField name="password" label={t("auth.password", "Password")} />

                <div className="flex justify-end">
                  <Link to="/reset" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
                    {t("auth.forgot_password", "Forgot password?")}
                  </Link>
                </div>

                <AuthActions
                  isSubmitting={isSubmitting}
                  submitLabel={t("auth.login", "Login")}
                  altText={t("auth.no_account", "Don't have an account?")}
                  altLink="/register"
                  altLabel={t("auth.create_one", "Create one")}
                  buttonClass="rounded-[var(--radius-md)] bg-[var(--color-accent)] hover:brightness-95"
                />

                {user && (
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-success)]/10 px-3 py-2 text-xs text-[var(--color-success)] text-center">
                    {t("auth.signed_in_as", "Signed in as")} {user.name || user.email}
                  </div>
                )}
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
