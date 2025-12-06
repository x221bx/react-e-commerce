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
  // const { t } = useTranslation();

  const initials = (user?.name || "Farmer")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    dispatch(signOutThunk());
    navigate("/");
  };

  // Unified with Products theme
  const containerBg = isDark
    ? "bg-gradient-to-b from-transparent to-slate-800/30 text-white"
    : "bg-gradient-to-b from-transparent to-gray-50/50 text-slate-900";

  const asideBg = isDark
    ? "bg-[#0f1d1d]/70 border border-white/10 shadow-md"
    : "bg-white border border-gray-200 shadow-md";

  const sectionBg = isDark
    ? "bg-[#0f1d1d]/70 border border-white/10 shadow-md"
    : "bg-white border border-gray-200 shadow-md";

  const avatarBg = isDark
    ? "bg-slate-800 text-white ring-white/20"
    : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  const navActive = isDark
    ? "border-emerald-900/40 bg-emerald-900/30 text-emerald-200 shadow-sm"
    : "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm";

  const navIdle = isDark
    ? "border-transparent text-white/70 hover:border-white/20 hover:bg-white/10"
    : "border-transparent text-slate-600 hover:border-gray-200 hover:bg-gray-50";


  const navDescription = isDark ? "text-white/60" : "text-slate-500";

  const logoutBtn = isDark
    ? "border-red-900/40 text-red-300 hover:bg-red-900/30"
    : "border-red-200 text-red-600 hover:bg-red-50";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`min-h-screen flex flex-col transition-colors ${containerBg}`}>
      <div className="flex-1 pt-10 pb-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">

          {/* Aside panel */}
          <aside
            className={`w-full shrink-0 rounded-3xl p-6 ${asideBg} backdrop-blur-md lg:w-72`}
          >
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-lg font-semibold ring-1 ${avatarBg}`}
              >
                {user?.photoURL || user?.photoUrl ? (
                  <img
                    src={user.photoURL || user.photoUrl}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div>
                <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {user?.name || "Your Account"}
                </p>
                <p className={`text-sm ${isDark ? "text-white/60" : "text-slate-500"}`}>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-6 space-y-2" aria-label="Account menu">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${isActive ? navActive : navIdle}`
                    }
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{t(item.labelKey)}</p>
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
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${logoutBtn}`}
            >
              <LogOut className="h-4 w-4" />
              {t("account.logout")}
            </button>
          </aside>

          {/* Main Content */}
          <section
            className={`flex-1 rounded-3xl p-6 backdrop-blur-md ${sectionBg} transition-colors`}
          >
            <Outlet />
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
