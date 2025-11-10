import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";


export default function NotFound() {
  const { t } = useTranslation();
  return (
    <section
      aria-labelledby="nf-title"
      className="
        relative
        min-h-[calc(100svh-var(--nav-h))]
        overflow-hidden
        bg-gradient-to-br from-[#49BBBD] via-[#36A2A4] to-[#2F7E80]
        text-white
      "
    >
      {/* soft blobs (no horizontal scroll) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* centered content. no nested scroller; window will scroll if ever needed */}
      <div className="mx-auto flex min-h-[inherit] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <h1
            id="nf-title"
            className="text-[70px] font-extrabold leading-none sm:text-[96px]"
          >
            {t("errors.404_code")}
          </h1>
          <p className="mt-2 text-xl font-semibold sm:text-2xl">
            {t("errors.404_title")}
          </p>
          <p className="mt-3 text-white/90">
            {t("errors.404_message")}
          </p>

          <div className="mt-8">
            <NavLink
              to="/"
              className="
                inline-flex items-center justify-center
                rounded-xl border border-white/80 bg-white/10
                px-6 py-3 text-base font-semibold
                backdrop-blur-sm transition
                hover:bg-white hover:text-[#2F7E80]
                focus:outline-none focus:ring-2 focus:ring-white/80
              "
            >
              {t("common.go_home")}
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
}
