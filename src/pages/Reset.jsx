// src/pages/Reset.jsx
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthLayout from "../Authcomponents/AuthLayout";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetPassword, clearAuthError } from "../features/auth/authSlice";
import { Link } from "react-router-dom";

const ResetSchema = Yup.object({
  emailOrUsername: Yup.string().required("Required"),
});

export default function Reset() {
  const [serverMsg, setServerMsg] = useState(null);
  const dispatch = useDispatch();
  // const error = useSelector(selectAuthError);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We’ll send a password reset link to your email."
      imageSrc="/reset-password.svg"
    >
      {serverMsg && (
        <div
          className={`-mt-10 mb-3 rounded-lg px-3 py-2 text-sm ${
            serverMsg.startsWith("If")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {serverMsg}
        </div>
      )}

      <Formik
        initialValues={{ emailOrUsername: "" }}
        validationSchema={ResetSchema}
        onSubmit={async (vals, { setSubmitting, setFieldError }) => {
          setServerMsg(null);
          const resultAction = await dispatch(resetPassword(vals));
          setSubmitting(false);

          if (resetPassword.rejected.match(resultAction)) {
            const err = resultAction.payload;
            if (err?.fieldErrors) {
              Object.entries(err.fieldErrors).forEach(([k, msg]) => {
                setFieldError(k, msg);
              });
            }
            setServerMsg(err?.message || "Reset failed.");
          } else {
            setServerMsg("If the account exists, a reset email has been sent.");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email or Username
              </label>
              <Field
                name="emailOrUsername"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="mt-1 h-5">
                <ErrorMessage
                  name="emailOrUsername"
                  component="p"
                  className="text-xs text-red-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send reset email"}
            </button>

            <p className="text-sm text-gray-600">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Back to login
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
