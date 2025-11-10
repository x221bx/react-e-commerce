import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../Authcomponents/AuthLayout";
import InputField from "../Authcomponents/InputField";
import PasswordField from "../Authcomponents/PasswordField";
import { signUp, clearAuthError } from "../features/auth/authSlice";

const SignupSchema = Yup.object({
  name: Yup.string().min(2, "Too short").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  username: Yup.string().min(3, "Min 3 chars").required("Required"),
  password: Yup.string().min(6, "Min 6 chars").required("Required"),
  confirm: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Required"),
  locale: Yup.string().oneOf(["en", "ar"]).default("en"),
});

export default function Register() {
  const [serverMsg, setServerMsg] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // مسح أي خطأ عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSuccess = () => {
    setServerMsg("Account created! You are now signed in.");
    navigate("/", { replace: true });
  };

  return (
    <AuthLayout title="Create your account" imageSrc="/register.svg">
      {serverMsg && (
        <div
          role="status"
          aria-live="polite"
          className={`-mt-6 mb-4 rounded-lg px-3 py-2 text-sm ${
            serverMsg.startsWith("Account created")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {serverMsg}
        </div>
      )}

      <Formik
        initialValues={{
          name: "",
          email: "",
          username: "",
          password: "",
          confirm: "",
          locale: "en",
        }}
        validationSchema={SignupSchema}
        onSubmit={async (vals, { setSubmitting, setFieldError }) => {
          setServerMsg(null);
          const { confirm: _confirm, ...payload } = vals;

          const resultAction = await dispatch(signUp(payload));
          setSubmitting(false);

          if (signUp.rejected.match(resultAction)) {
            const err = resultAction.payload;
            if (err?.fieldErrors) {
              Object.entries(err.fieldErrors).forEach(([k, msg]) => {
                setFieldError(k, msg);
              });
            }
            setServerMsg(err?.message || "Signup failed.");
          } else {
            onSuccess();
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <InputField name="name" label="Full name" />
            <InputField name="username" label="Username" />
            <InputField
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
            />
            <PasswordField name="password" label="Password" />
            <PasswordField name="confirm" label="Confirm password" />

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#49BBBD] px-4 py-3.5 text-[17px] font-semibold text-white shadow-sm hover:bg-[#3ca6a8] focus:ring-2 focus:ring-[#49BBBD] focus:outline-none disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "Create Account"}
            </button>

            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#49BBBD] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
