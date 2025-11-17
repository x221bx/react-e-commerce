import { Formik, Form } from "formik";
import * as Yup from "yup";
import AuthLayout from "../Authcomponents/AuthLayout";
import FieldRow from "../Authcomponents/InputField";
import PasswordField from "../Authcomponents/PasswordField";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  signInWithIdentifier,
  clearAuthError,
  selectCurrentUser,
} from "../features/auth/authSlice";
import { Link, useNavigate, useLocation } from "react-router-dom";

const LoginSchema = Yup.object({
  identifier: Yup.string().required("Required"),
  password: Yup.string().min(6, "Too short").required("Required"),
});

export default function Login() {
  const [serverMsg, setServerMsg] = useState(null);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectTo = new URLSearchParams(search).get("redirect") || "/";

  const onSuccess = () => navigate(redirectTo, { replace: true });

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Welcome back! Please login to continue."
    >
      {serverMsg && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
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

          if (signInWithIdentifier.rejected.match(resultAction)) {
            const err = resultAction.payload;
            err?.fieldErrors &&
              Object.entries(err.fieldErrors).forEach(([k, msg]) => {
                setFieldError(k, msg);
              });
            setServerMsg(err?.message || "Login failed.");
          } else onSuccess();
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <FieldRow
              name="identifier"
              label="Email or Username"
              placeholder="email@example.com"
            />

            <PasswordField name="password" label="Password" />

            <div className="flex justify-end">
              <Link
                to="/reset"
                className="text-sm font-medium text-[#2F7E80] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#2F7E80] text-white py-3 font-semibold shadow-md hover:bg-[#276e70]"
            >
              {isSubmitting ? "Signing in…" : "Login"}
            </button>

            <p className="text-center text-sm text-gray-700">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-[#2F7E80] font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>

            {user && (
              <div className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 text-center">
                Signed in as {user.name || user.email}
              </div>
            )}
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
