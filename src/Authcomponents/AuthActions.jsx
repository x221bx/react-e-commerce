// src/Authcomponents/AuthActions.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function AuthActions({
  isSubmitting,
  submitLabel = "Submit",
  altText = "",
  altLink = "/",
  altLabel = "",
  buttonClass,
}) {
  const btnClass =
    buttonClass ||
    "w-full rounded-xl bg-[var(--brand-primary)] text-white py-3 font-semibold shadow-md hover:opacity-95";

  return (
    <>
      <button type="submit" disabled={isSubmitting} className={btnClass}>
        {isSubmitting ? `${submitLabel}...` : submitLabel}
      </button>

      {altText && (
        <p className="text-center text-sm text-gray-700">
          {altText}{" "}
          <Link to={altLink} className="text-[var(--brand-primary)] font-semibold hover:underline">
            {altLabel}
          </Link>
        </p>
      )}
    </>
  );
}
