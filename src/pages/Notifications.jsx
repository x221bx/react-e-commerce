// ===============================================
// Notifications — Ultra Polished Version
// Glass • Gradient • Pro UI • Light/Dark
// ===============================================

import { useMemo } from "react";
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

  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
  } = useUserNotifications(user?.uid);

  const isDark = theme === "dark";

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
                className={`
                  rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-lg
                  ${
                    unreadCount
                      ? "bg-emerald-600/10 text-emerald-600 dark:text-emerald-300"
                      : "bg-slate-300/30 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }
                `}
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
              <div key={idx} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-slate-300/30 dark:bg-slate-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/5 rounded bg-slate-300/30 dark:bg-slate-700"></div>
                  <div className="h-3 w-4/5 rounded bg-slate-300/30 dark:bg-slate-700"></div>
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
            <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {t(
                "notifications.empty_description",
                "Order updates, support messages, and alerts will appear here."
              )}
            </p>
          </div>
        )}

        {/* ============================
            📌 GROUPED NOTIFICATIONS
        ============================ */}
        {Object.keys(groupedNotifications).map((category) => {
          const Icon = categoryIconMap[category] || FiBell;
          const items = groupedNotifications[category];

          return (
            <section
              key={category}
              className={`rounded-3xl border shadow-xl overflow-hidden ${cardBase}`}
            >
              {/* ============ Group Header ============ */}
              <div className="flex items-center gap-4 px-8 py-6 border-b border-white/10 dark:border-slate-800/50">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 grid place-items-center">
                  <Icon size={20} />
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

                  return (
                    <li
                      key={ntf.id}
                      className={`px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition ${
                        ntf.read ? "" : unreadBg
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`
                            h-10 w-10 rounded-full grid place-items-center mt-1 
                            ${
                              ntf.read
                                ? "bg-slate-300/30 dark:bg-slate-800"
                                : "bg-emerald-500/20 text-emerald-500"
                            }
                          `}
                        >
                          <ItemIcon size={16} />
                        </div>

                        <div>
                          <p className="font-semibold text-lg">{ntf.title}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {ntf.message}
                          </p>
                          <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                            {formatTimestamp(ntf.timestamp, i18n.language)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!ntf.read && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                            {t("notifications.new_badge", "New")}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleItemClick(ntf)}
                          className={`
                            inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition
                            ${
                              isDark
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
