import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Settings,
  ReceiptText,
  Truck,
  Bookmark,
  FileText,
  Bot,
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
    to: "orders",
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
    to: "ai",
    labelKey: "account.ai_conversations",
    descriptionKey: "account.ai_description",
    icon: Bot,
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
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const { t } = useTranslation();

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

  const isSettingsRoute = location.pathname === "/account/settings";
  const mainBackground = isDark
    ? "bg-slate-950 text-slate-100"
    : "bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 text-slate-900";
  const asideSurface = isDark
    ? "bg-slate-900 ring-slate-800"
    : "bg-white/95 ring-slate-100";
  const avatarSurface = isDark
    ? "bg-slate-800 text-emerald-200 ring-slate-700"
    : "bg-emerald-50 text-emerald-700 ring-emerald-100";
  const helperCard = isDark
    ? "border-slate-700 bg-slate-800/70 text-slate-300"
    : "border-slate-100 bg-slate-50/70 text-slate-600";
  const navActive = isDark
    ? "border-emerald-900/40 bg-emerald-900/30 text-emerald-200 shadow-sm"
    : "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm";
  const navIdle = isDark
    ? "border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/70"
    : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50";
  const navDescription = isDark ? "text-slate-300" : "text-slate-500";
  const logoutButton = isDark
    ? "border-red-900/40 text-red-200 hover:bg-red-900/30"
    : "border-red-200 text-red-600 hover:bg-red-50";
  const sectionSurface =
    theme === "dark"
      ? "bg-slate-900"
      : isSettingsRoute
        ? "bg-slate-50"
        : "bg-white";
  const sectionRing = isDark ? "ring-slate-800" : "ring-slate-100";

  return (
    <div className={`min-h-screen py-10 transition-colors ${mainBackground}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
        <aside className={`w-full shrink-0 rounded-3xl p-6 shadow-lg ring-1 lg:w-72 ${asideSurface} text-slate-900 dark:text-slate-100`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-lg font-semibold ring-1 ${avatarSurface}`}>
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
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {user?.email}
              </p>
            </div>
          </div>

          <div className={`mt-6 rounded-2xl border p-4 text-xs ${helperCard}`}>
            {t('account.helper_text')}
          </div>

          <nav className="mt-6 space-y-2" aria-label="Account menu">
           {navItems.map((item) => {
             const IconComponent = item.icon;
             return (
               <NavLink
                 key={item.to}
                 to={item.to}
                 className={({ isActive }) =>
                   `flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                     isActive ? navActive : navIdle
                   }`
                 }
               >
                 <IconComponent className="h-5 w-5 flex-shrink-0" />
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
          <button
            onClick={handleLogout}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${logoutButton}`}
          >
            <LogOut className="h-4 w-4" />
            {t('account.logout')}
          </button>
        </aside>

        <section
          className={`flex-1 rounded-3xl p-6 shadow-lg ring-1 transition-colors ${sectionRing} ${sectionSurface} text-slate-900 dark:text-slate-100`}
        >
          <Outlet />
        </section>
      </div>
    </div>
  );
}


