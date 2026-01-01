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
    "relative w-full overflow-hidden rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-strong)] px-4 py-3 text-base font-semibold text-white shadow-[var(--shadow-md)] transition hover:-translate-y-[1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <>
      <button type="submit" disabled={isSubmitting} className={btnClass} aria-busy={isSubmitting}>
        <span className={isSubmitting ? "opacity-0" : ""}>{submitLabel}</span>
        {isSubmitting && (
          <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium">
            <span className="h-2 w-2 animate-ping rounded-full bg-white" />
            <span className="h-2 w-2 animate-ping rounded-full bg-white delay-150" />
            <span>{submitLabel}...</span>
          </span>
        )}
      </button>

      {altText && (
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          {altText}{" "}
          <Link to={altLink} className="font-semibold text-[var(--color-accent)] hover:underline">
            {altLabel}
          </Link>
        </p>
      )}
    </>
  );
}
