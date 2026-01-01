// src/Authcomponents/PasswordField.jsx
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
        className="block text-[0.95rem] font-semibold text-[var(--color-text)]"
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
          className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 pr-12 text-[16px] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] placeholder:opacity-70 shadow-[var(--shadow-sm)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-4 focus:ring-[rgba(15,118,110,0.2)]"
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-2 my-1 flex items-center rounded-[var(--radius-sm)] px-2 text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[rgba(15,118,110,0.4)]"
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

      <div className="mt-1 h-5">
        <ErrorMessage
          name={name}
          component="p"
          className="text-xs font-medium text-[var(--color-danger)]"
        />
      </div>
    </div>
  );
}
