import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

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
  confirm: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required(),
});

export default function Register() {
  const [serverMsg, setServerMsg] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const onSuccess = () => {
    setServerMsg("Account created!");
    navigate("/", { replace: true });
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join us today!">
      {serverMsg && (
        <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
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
        }}
        validationSchema={SignupSchema}
        onSubmit={async (vals, { setSubmitting, setFieldError }) => {
          setServerMsg(null);
          const { confirm, ...payload } = vals;

          const resultAction = await dispatch(signUp(payload));
          setSubmitting(false);

          if (signUp.rejected.match(resultAction)) {
            const err = resultAction.payload;
            err?.fieldErrors &&
              Object.entries(err.fieldErrors).forEach(([k, msg]) =>
                setFieldError(k, msg)
              );

            setServerMsg(err?.message || "Signup failed.");
          } else onSuccess();
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <InputField name="name" label="Full name" />
            <InputField name="username" label="Username" />
            <InputField name="email" label="Email" type="email" />

            <PasswordField name="password" label="Password" />
            <PasswordField name="confirm" label="Confirm password" />

            <AuthActions
              isSubmitting={isSubmitting}
              submitLabel="Create Account"
              altText={"Already have an account?"}
              altLink="/login"
              altLabel="Sign in"
              buttonClass="w-full rounded-xl bg-[var(--brand-primary)] py-3 text-white font-semibold hover:opacity-95"
            />
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
