import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthLayout from "../Authcomponents/AuthLayout";
import { useDispatch } from "react-redux";
import { resetPassword, clearAuthError } from "../features/auth/authSlice";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ResetSchema = Yup.object({
  emailOrUsername: Yup.string().required("Required"),
});

export default function Reset() {
  const dispatch = useDispatch();
  const [serverMsg, setServerMsg] = useState(null);

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="We will send you a reset link."
    >
      {serverMsg && (
        <div className="mb-3 rounded-lg bg-green-200/70 text-green-900 p-2 text-sm text-center">
          {serverMsg}
        </div>
      )}

      <Formik
        initialValues={{ emailOrUsername: "" }}
        validationSchema={ResetSchema}
        onSubmit={async (vals, { setSubmitting, setFieldError }) => {
          const result = await dispatch(resetPassword(vals));
          setSubmitting(false);

          if (resetPassword.rejected.match(result)) {
            const err = result.payload;
            if (err?.fieldErrors) {
              Object.entries(err.fieldErrors).forEach(([k, msg]) =>
                setFieldError(k, msg)
              );
            }
          } else {
            setServerMsg("If the account exists, a reset email has been sent.");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <div>
              <label className="text-white">Email or Username</label>
              <Field
                name="emailOrUsername"
                className="mt-1 w-full rounded-lg p-2 border border-gray-300"
              />
              <ErrorMessage
                name="emailOrUsername"
                component="p"
                className="text-xs text-red-200 mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white
                        py-3 rounded-xl text-lg font-semibold shadow-md"
            >
              {isSubmitting ? "Sending…" : "Send email"}
            </button>

            <p className="text-sm text-gray-200 text-center">
              Back to{" "}
              <Link to="/login" className="text-white underline">
                Login
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
