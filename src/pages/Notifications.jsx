import { useMemo, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiMessageSquare,
  FiPackage,
  FiCheck,
} from "react-icons/fi";

import { selectCurrentUser } from "../features/auth/authSlice";
import { useUserNotifications } from "../hooks/useUserNotifications";
import Button from "../components/ui/Button";
import { UseTheme } from "../theme/ThemeProvider";
import Footer from "../Authcomponents/Footer";
import { playFullNotification } from "../utils/voiceNotification";

// Mapping categories → icons
const categoryIconMap = {
  orders: FiPackage,
  support: FiMessageSquare,
  system: FiBell,
};

const formatTimestamp = (timestamp, locale = "en") => {
  try {
    return new Date(timestamp).toLocaleString(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
};

export default function Notifications() {
  const { theme } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";
  const previousUnreadCountRef = useRef(0);

  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
  } = useUserNotifications(user?.uid);

  // Play voice notification when new unread notifications arrive
  useEffect(() => {
    if (unreadCount > previousUnreadCountRef.current) {
      const newNotifications = notifications.filter(n => !n.read);
      if (newNotifications.length > 0) {
        // Play notification for the most recent unread notification
        const latestNotification = newNotifications[0];
        const message = latestNotification.message || latestNotification.title || "You have a new notification";
        playFullNotification(message, i18n.language === "ar" ? "ar-EG" : "en-US");
      }
    }
    previousUnreadCountRef.current = unreadCount;
  }, [unreadCount, notifications, i18n.language]);

  const isDark = theme === "dark";

  const cardSurface = isDark
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-200";
  const accentText = isDark ? "text-emerald-300" : "text-emerald-600";

  // ==========================
  // 🌈 Background (Same as Cart & Account)
  // ==========================
  const pageBg =
    isDark
      ? "bg-gradient-to-b from-[#091616] via-[#0c2424] to-[#0f3130]"
      : "bg-gradient-to-b from-[#f9fbfa] via-[#f1f8f5] to-[#e3f2ec]";

  const cardBase =
    isDark
      ? "bg-[#0f1d1d]/80 border-[#0d3a34] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
      : "bg-white/80 border-emerald-100 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

  const unreadBg = isDark ? "bg-emerald-900/30" : "bg-emerald-50/60";

  // ==========================
  // Group notifications by type
  // ==========================
  const groupedNotifications = useMemo(() => {
    if (!notifications.length) return {};
    return notifications.reduce((groups, n) => {
      const key = n.category || "system";
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
      return groups;
    }, {});
  }, [notifications]);

  const handleItemClick = async (item) => {
    await markRead(item.id);
    if (item.target) navigate(item.target);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen ${pageBg} text-slate-900 dark:text-slate-100 transition-colors`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* ============================
            🌟 HEADER
        ============================ */}
        <header
          className={`
            rounded-3xl border px-6 py-10 sm:px-10 shadow-xl
            ${cardBase}
          `}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] font-bold text-emerald-500 dark:text-emerald-300">
                {t("notifications.center_label", "NOTIFICATIONS CENTER")}
              </p>

              <h1 className="text-4xl font-extrabold leading-tight">
                {t("notifications.title", "Stay updated with every action")}
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-base">
                {t(
                  "notifications.subtitle",
                  "Track order status, support replies, and important alerts from one place."
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* unread badge */}
              <div
                className={`rounded-full px-4 py-2 text-sm font-semibold ${unreadCount
                    ? "bg-emerald-500/10 text-emerald-600  -emerald-300"
                    : "bg-slate-200/50 text-slate-500   -slate-400"
                  }`}
              >
                {unreadCount
                  ? t("notifications.unread_count", "{{count}} unread", {
                      count: unreadCount,
                    })
                  : t("notifications.all_caught_up", "All caught up")}
              </div>

              <Button
                type="button"
                text={t("notifications.mark_all_read", "Mark all read")}
                onClick={() => unreadCount && markAllRead()}
                disabled={!unreadCount}
                className={`${!unreadCount && "opacity-60 cursor-not-allowed"} whitespace-nowrap`}
              />
            </div>
          </div>
        </header>

        {/* ============================
            ⏳ LOADING
        ============================ */}
        {loading && (
          <div className={`rounded-3xl border p-10 shadow-xl space-y-6 ${cardBase}`}>
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-slate-200  " />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-slate-200  " />
                  <div className="h-3 w-2/3 rounded bg-slate-200  " />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================
            📭 EMPTY
        ============================ */}
        {!loading && notifications.length === 0 && (
          <div className={`rounded-3xl border p-16 text-center shadow-xl ${cardBase}`}>
            <FiBell className="mx-auto h-16 w-16 text-emerald-500 mb-6" />
            <h3 className="text-2xl font-bold mb-2">
              {t("notifications.empty_title", "No notifications yet")}
            </h3>
            <p className={isDark ? "text-slate-300" : " "}>
              {t("notifications.empty_description", "Important updates about your orders and inquiries will appear here.")}
            </p>
          </div>
        ) : (
          Object.keys(groupedNotifications).map((category) => {
            const items = groupedNotifications[category];
            const Icon = categoryIconMap[category] || FiBell;
            return (
              <section
                key={category}
                className={`rounded-2xl border shadow-sm ${cardSurface}`}
              >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 dark:border-slate-800/60">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 grid place-items-center">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500">
                      {category === "orders"
                        ? t("notifications.groups.orders", "Orders")
                        : category === "support"
                          ? t("notifications.groups.support", "Support")
                          : t("notifications.groups.system", "System")}
                    </p>
                    <p className="text-xs text-slate-500  -slate-400">
                      {t("notifications.group_count", "{{count}} updates", {
                        count: items.length,
                      })}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                    {category === "orders"
                      ? t("notifications.groups.orders", "Orders")
                      : category === "support"
                      ? t("notifications.groups.support", "Support")
                      : t("notifications.groups.system", "System")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("notifications.group_count", "{{count}} updates", {
                      count: items.length,
                    })}
                  </p>
                </div>
              </div>

              {/* ============ Items ============ */}
              <ul className="divide-y divide-white/10 dark:divide-slate-800/50">
                {items.map((ntf) => {
                  const ItemIcon = categoryIconMap[ntf.category] || FiBell;

                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((notification) => {
                    const ItemIcon = categoryIconMap[notification.category] || FiBell;
                    return (
                      <li
                        key={notification.id}
                        className={`px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${notification.read
                            ? ""
                            : isDark
                              ? "bg-emerald-950/40"
                              : "bg-emerald-50/50"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`mt-1 h-9 w-9 rounded-full grid place-items-center ${notification.read
                                ? "bg-slate-200/40  "
                                : "bg-emerald-500/20 text-emerald-500"
                              }`}
                          >
                            <ItemIcon size={16} />
                          </div>
                          <div>
                            <p className="text-base font-semibold">
                              {notification.title}
                            </p>
                            <p className="text-sm text-slate-600  -slate-300">
                              {notification.message}
                            </p>
                            <p className="text-xs mt-2 text-slate-500  -slate-400">
                              {formatTimestamp(notification.timestamp, i18n.language)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-600  ">
                              <FiBell size={12} />
                              {t("notifications.new_badge", "New")}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleItemClick(notification)}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${isDark
                                ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            }
                          `}
                        >
                          {ntf.read ? (
                            <>
                              <FiCheck size={14} />
                              {t("notifications.marked", "Read")}
                            </>
                          ) : ntf.target ? (
                            t("notifications.view_details", "View details")
                          ) : (
                            t("notifications.mark_read", "Mark read")
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
