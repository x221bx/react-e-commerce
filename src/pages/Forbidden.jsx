import { NavLink } from "react-router-dom";
import { FiAlertTriangle, FiLock } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Footer from "../Authcomponents/Footer";

export default function Forbidden() {
  const { t } = useTranslation();
  return (
    <section
      aria-labelledby="forbidden-title"
      className="relative min-h-[calc(100svh-var(--nav-h))] overflow-hidden bg-gradient-to-br from-[#49BBBD] via-[#36A2A4] to-[#2F7E80] text-white"
    >
      {/* subtle 'forbidden' accents (no horizontal scroll) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* diagonal red wash */}
        <div className="absolute -top-10 right-[-30%] h-[140%] w-[60%] rotate-12 bg-gradient-to-b from-rose-500/25 to-transparent blur-2xl" />
        {/* soft red glow */}
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-rose-400/20 blur-3xl" />
      </div>

      {/* centered content */}
      <div className="mx-auto flex min-h-[inherit] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white/90 ring-1 ring-white/20">
            <FiAlertTriangle className="text-rose-300" />
            <span className="tracking-wide">Access Restricted</span>
          </div>

          <h1
            id="forbidden-title"
            className="text-[56px] leading-none font-extrabold sm:text-[80px] md:text-[96px]"
          >
            {t("errors.403_code")}
          </h1>

          <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
            {t("errors.403_title")}– {t("errors.403_message")}.
          </h2>
          <p className="mt-3 text-white/90">
            If you think this is a mistake, contact an administrator or try
            signing in with a different account.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <NavLink
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/80 bg-white/10 px-6 py-3 text-base font-semibold backdrop-blur-sm transition hover:bg-white hover:text-[#2F7E80] focus:ring-2 focus:ring-white/80 focus:outline-none"
            >
              {t("common.go_home")}
            </NavLink>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500/90 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-rose-500 focus:ring-2 focus:ring-white/80 focus:outline-none"
            >
              <FiLock aria-hidden />
              Back
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}
