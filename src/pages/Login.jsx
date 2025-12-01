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
import AuthActions from "../Authcomponents/AuthActions";

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

  const onSuccess = () => {
    // If user is admin, redirect to admin dashboard
    if (user?.isAdmin) {
      navigate("/admin", { replace: true });
    } else {
      navigate(redirectTo, { replace: true });
    }
  };

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user?.isAdmin && location.pathname !== "/admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate, location.pathname]);

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
          }
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

            <AuthActions
              isSubmitting={isSubmitting}
              submitLabel="Login"
              altText={"Don’t have an account?"}
              altLink="/register"
              altLabel="Create one"
            />

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
