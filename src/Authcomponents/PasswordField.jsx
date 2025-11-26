import { useState } from "react";
import { Field, ErrorMessage } from "formik";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function PasswordField({
  name,
  label = "Password",
  placeholder,
  autoComplete = "current-password", // or 'new-password'
}) {
  const [show, setShow] = useState(false);
  const toggle = () => setShow((v) => !v);

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[0.95rem] font-medium text-gray-800"
      >
        {label}
      </label>

      <div className="relative mt-1">
        <Field
          id={name}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-3 pr-12 text-[16px] shadow-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-2 my-1 flex items-center rounded-lg px-2 icon-secondary hover:icon-primary focus:ring-2 focus:ring-blue-600 focus:outline-none"
        >
          {show ? (
            <FiEyeOff className="h-5 w-5" />
          ) : (
            <FiEye className="h-5 w-5" />
          )}
          <span className="sr-only">
            {show ? "Hide password" : "Show password"}
          </span>
        </button>
      </div>

      {/* fixed error row to avoid layout shift */}
      <div className="mt-1 h-5">
        <ErrorMessage
          name={name}
          component="p"
          className="text-xs text-red-600"
        />
      </div>
    </div>
  );
}
