// src/pages/account/AccountLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Settings,
  ReceiptText,
  Truck,
  Bookmark,
  FileText,
  LifeBuoy,
  LogOut,
  CreditCard,
  MessageSquareWarning,
} from "lucide-react";
import {
  selectCurrentUser,
  signOut as signOutThunk,
} from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import Footer from "../../Authcomponents/Footer";

const navItems = [
  {
    to: "settings",
    labelKey: "account.profile_preferences",
    descriptionKey: "account.profile_description",
    icon: Settings,
  },
  {
    to: "payments",
    labelKey: "account.payment_methods",
    descriptionKey: "account.payment_description",
    icon: CreditCard,
  },
  {
    to: "OrderHistory",
    labelKey: "account.order_history",
    descriptionKey: "account.order_description",
    icon: ReceiptText,
  },
  {
    to: "tracking",
    labelKey: "account.order_tracking",
    descriptionKey: "account.tracking_description",
    icon: Truck,
  },
  {
    to: "saved",
    labelKey: "account.saved_products",
    descriptionKey: "account.saved_description",
    icon: Bookmark,
  },
  {
    to: "articles",
    labelKey: "account.favorite_articles",
    descriptionKey: "account.articles_description",
    icon: FileText,
  },
  {
    to: "support",
    labelKey: "account.feedback_support",
    descriptionKey: "account.support_description",
    icon: LifeBuoy,
  },
  {
    to: "complaints",
    labelKey: "account.complaints",
    descriptionKey: "account.complaints_description",
    icon: MessageSquareWarning,
  },
];

export default function AccountLayout() {
  const { t, i18n } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const isRTL = (i18n.language || "en").startsWith("ar");

  const initials = (user?.name || "Farmer")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    dispatch(signOutThunk());
    navigate("/");
  };

  // 🌌 خلفية عامة للموقع (Neon Emerald Glass)
  const containerBg = isDark
    ? "bg-[radial-gradient(circle_at_top,_#064e3b_0,_#020617_45%,_#020617_100%)] text-white"
    : "bg-gradient-to-b from-emerald-50 via-white to-emerald-50/60 text-slate-900";

  const asideBg = isDark
    ? "bg-emerald-950/40 border border-emerald-900/60 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
    : "bg-white border border-emerald-100 shadow-md";

  const mainBg = isDark
    ? "bg-slate-950/60 border border-emerald-900/60 shadow-[0_0_30px_rgba(15,118,110,0.4)]"
    : "bg-white border border-emerald-100 shadow-lg";

  const avatarBg = isDark
    ? "bg-slate-900 text-emerald-200 ring-1 ring-emerald-500/40"
    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

  const navActive = isDark
    ? "border-emerald-500/70 bg-emerald-900/40 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.65)]"
    : "border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm";

  const navIdle = isDark
    ? "border-transparent text-white/70 hover:text-white hover:bg-white/5 hover:border-white/10"
    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-emerald-50/60 hover:border-emerald-100";

  const navDescription = isDark ? "text-white/50" : "text-slate-500";

  const logoutBtn = isDark
    ? "border-red-900/50 text-red-300 hover:bg-red-950/40 hover:text-red-100"
    : "border-red-200 text-red-600 hover:bg-red-50";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen flex flex-col transition-colors duration-300 ${containerBg}`}
    >
      {/* طبقة جلو خفيفة في الخلفية */}
      {isDark && (
        <div className="pointer-events-none fixed inset-0 opacity-60 mix-blend-screen">
          <div className="absolute -top-40 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-700/20 blur-3xl" />
        </div>
      )}

      <div className="relative flex-1 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">

          {/* ======================= SIDEBAR ======================= */}
          <aside
            className={`
              w-full lg:w-72 shrink-0 rounded-3xl p-6 backdrop-blur-2xl
              transition-all duration-300 ${asideBg}
            `}
          >
            {/* Top label */}
            <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-emerald-400/80">
              <span>{t("account.sidebar_title", "Account Center")}</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                {t("account.secure_area", "Secure Area")}
              </span>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div
                className={`
                  relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl
                  font-semibold text-lg ${avatarBg}
                `}
              >
                {/* inner soft glow ring */}
                {isDark && (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border border-emerald-500/40 shadow-[0_0_18px_rgba(16,185,129,0.45)]" />
                )}

                {user?.photoURL || user?.photoUrl ? (
                  <img
                    src={user.photoURL || user.photoUrl}
                    alt="Profile avatar"
                    className="h-full w-full object-cover relative z-[1]"
                  />
                ) : (
                  <span className="relative z-[1]">{initials}</span>
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-base font-semibold leading-tight">
                  {user?.name || t("account.my_account", "Your Account")}
                </p>
                <p className={`text-xs ${navDescription}`}>{user?.email}</p>
                <p className="text-[11px] font-medium text-emerald-400/90">
                  {t("account.member_since", "FarmVet member")}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav
              className="mt-6 space-y-2"
              aria-label={t("account.menu_label", "Account menu")}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `
                        group flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm
                        transition-all duration-200 cursor-pointer
                        ${
                          isActive
                            ? `${navActive} scale-[1.02]`
                            : `${navIdle} scale-[1.0]`
                        }
                      `
                    }
                  >
                    {/* Icon Pill */}
                    <div
                      className={`
                        mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl
                        bg-emerald-500/10 text-emerald-300
                        group-hover:bg-emerald-500/20 group-hover:text-emerald-200
                      `}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="space-y-0.5">
                      <p className="font-semibold leading-tight">
                        {t(item.labelKey)}
                      </p>
                      <p className={`text-xs ${navDescription}`}>
                        {t(item.descriptionKey)}
                      </p>
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`
                mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2
                text-sm font-semibold transition-all duration-200
                ${logoutBtn}
                hover:shadow-[0_0_18px_rgba(239,68,68,0.45)]
                hover:scale-[1.02] active:scale-[0.97]
              `}
            >
              <LogOut className="h-4 w-4" />
              {t("account.logout", "Logout")}
            </button>
          </aside>

          {/* ======================= MAIN CONTENT ======================= */}
          <section
            className={`
              relative flex-1 rounded-3xl p-6 sm:p-7 lg:p-8 backdrop-blur-2xl
              transition-all duration-300 ${mainBg}
            `}
          >
            {/* subtle top line accent */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            {/* small header above content */}
            <div className="mb-4 flex items-center justify-between gap-2 text-xs">
              <span className="uppercase tracking-[0.2em] text-emerald-400/80">
                {t("account.dashboard_label", "Account Dashboard")}
              </span>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-medium text-emerald-200">
                {t("account.environment", "Personal settings")}
              </span>
            </div>

            <Outlet />
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
