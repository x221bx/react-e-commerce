import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FiBell, FiMessageSquare, FiPackage, FiCheck } from "react-icons/fi";

import { selectCurrentUser } from "../features/auth/authSlice";
import { useUserNotifications } from "../hooks/useUserNotifications";
import Button from "../components/ui/Button";
import { UseTheme } from "../theme/ThemeProvider";
import Footer from "../Authcomponents/Footer";

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

  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
  } = useUserNotifications(user?.uid);

  const isDark = theme === "dark";
  const baseSurface = isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900";
  const cardSurface = isDark
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-200";
  const accentText = isDark ? "text-emerald-300" : "text-emerald-600";

  const groupedNotifications = useMemo(() => {
    if (!notifications.length) return {};
    return notifications.reduce((groups, notification) => {
      const key = notification.category || "system";
      if (!groups[key]) groups[key] = [];
      groups[key].push(notification);
      return groups;
    }, {});
  }, [notifications]);

  const handleItemClick = async (notification) => {
    await markRead(notification.id);
    if (notification.target) {
      navigate(notification.target);
    }
  };

  const handleMarkAll = async () => {
    if (!unreadCount) return;
    await markAllRead();
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header
          className={`rounded-3xl border shadow-sm p-6 sm:p-8 flex flex-col gap-6 ${cardSurface}`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className={`text-xs uppercase tracking-[0.25em] font-semibold ${accentText}`}>
                {t("notifications.center_label", "Notifications Center")}
              </p>
              <h1 className="text-3xl font-bold">
                {t("notifications.title", "Stay updated with every action")}
              </h1>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                {t(
                  "notifications.subtitle",
                  "Track order progress, support replies, and important system updates in one place."
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  unreadCount
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : "bg-slate-200/50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
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
                onClick={handleMarkAll}
                disabled={!unreadCount}
                className={`whitespace-nowrap ${
                  !unreadCount ? "opacity-60 pointer-events-none" : ""
                }`}
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div className={`rounded-2xl border p-8 text-center shadow-sm ${cardSurface}`}>
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center shadow-sm ${cardSurface}`}>
            <FiBell className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {t("notifications.empty_title", "No notifications yet")}
            </h3>
            <p className={isDark ? "text-slate-300" : "text-slate-600"}>
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
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("notifications.group_count", "{{count}} updates", {
                        count: items.length,
                      })}
                    </p>
                  </div>
                </div>

                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((notification) => {
                    const ItemIcon = categoryIconMap[notification.category] || FiBell;
                    return (
                      <li
                        key={notification.id}
                        className={`px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
                          notification.read
                            ? ""
                            : isDark
                            ? "bg-emerald-950/40"
                            : "bg-emerald-50/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`mt-1 h-9 w-9 rounded-full grid place-items-center ${
                              notification.read
                                ? "bg-slate-200/40 dark:bg-slate-800"
                                : "bg-emerald-500/20 text-emerald-500"
                            }`}
                          >
                            <ItemIcon size={16} />
                          </div>
                          <div>
                            <p className="text-base font-semibold">
                              {notification.title}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {notification.message}
                            </p>
                            <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                              {formatTimestamp(notification.timestamp, i18n.language)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                              <FiBell size={12} />
                              {t("notifications.new_badge", "New")}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleItemClick(notification)}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                              isDark
                                ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {notification.read ? (
                              <>
                                <FiCheck size={14} />
                                {t("notifications.marked", "Read")}
                              </>
                            ) : notification.target ? (
                              <>
                                {t("notifications.view_details", "View details")}
                              </>
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
          })
        )}
      </div>

      <Footer />
    </div>
  );
}