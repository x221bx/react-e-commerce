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
import { selectCurrentUser, signOut as signOutThunk } from "../../features/auth/authSlice";
import Footer from "../../Authcomponents/Footer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const navItems = [
  { to: "settings", labelKey: "account.profile_preferences", descriptionKey: "account.profile_description", icon: Settings },
  { to: "payments", labelKey: "account.payment_methods", descriptionKey: "account.payment_description", icon: CreditCard },
  { to: "OrderHistory", labelKey: "account.order_history", descriptionKey: "account.order_description", icon: ReceiptText },
  { to: "tracking", labelKey: "account.order_tracking", descriptionKey: "account.tracking_description", icon: Truck },
  { to: "saved", labelKey: "account.saved_products", descriptionKey: "account.saved_description", icon: Bookmark },
  { to: "articles", labelKey: "account.favorite_articles", descriptionKey: "account.articles_description", icon: FileText },
  { to: "support", labelKey: "account.feedback_support", descriptionKey: "account.support_description", icon: LifeBuoy },
  { to: "complaints", labelKey: "account.complaints", descriptionKey: "account.complaints_description", icon: MessageSquareWarning },
];

export default function AccountLayout() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const isRTL = lang.startsWith("ar");
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initials = (user?.name || "User")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    dispatch(signOutThunk());
    navigate("/");
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12 flex flex-col gap-6">
        <PageHeader
          title={t("account.my_account", "Your Account")}
          subtitle={t("account.subtitle", "Manage your orders, payments, and preferences")}
          icon={<Settings size={18} />}
        />

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <Card className="w-full lg:w-72 shrink-0 p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-accent)] font-semibold text-lg">
                {user?.photoURL || user?.photoUrl ? (
                  <img src={user.photoURL || user.photoUrl} alt="Profile avatar" className="h-full w-full object-cover rounded-[var(--radius-lg)]" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold leading-tight truncate">
                  {user?.name || t("account.my_account", "Your Account")}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
                <Badge tone="accent" className="mt-1 text-[10px] px-2 py-1">
                  {t("account.secure_area", "Secure Area")}
                </Badge>
              </div>
            </div>

            <nav className="space-y-2" aria-label={t("account.menu_label", "Account menu")}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `
                      group flex items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-sm
                      transition-all duration-200
                      ${isActive ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10" : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]"}
                    `
                    }
                  >
                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold leading-tight">{t(item.labelKey)}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{t(item.descriptionKey)}</p>
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-danger)] hover:bg-[var(--color-surface-muted)] transition"
            >
              <LogOut size={16} /> {t("account.logout", "Logout")}
            </button>
          </Card>

          {/* Main content */}
          <Card className="flex-1 min-h-[60vh] p-4 md:p-5">
            <Outlet />
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
