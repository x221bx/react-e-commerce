import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiShoppingCart, FiBell } from "react-icons/fi";
import toast from "react-hot-toast";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

import SearchBar from "../search/SearchBar";
import Button from "../../components/ui/Button";
import { useNotifications } from "../../hooks/useNotifications";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const { theme, toggle } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const cart = useSelector((state) => state.cart.items);
  const favorites = useSelector((state) => state.favorites);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dropdownRef = useRef(null);

  const { notifications, unreadCount, markRead } = useNotifications({
    uid: user?.uid,
    role: user?.role,
  });

  const handleLogout = () => {
    dispatch(signOut());
    toast.success("Logged out successfully 👋");
  };

  const toggleLanguage = async () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    try {
      await i18n.changeLanguage(newLang);
      setCurrentLang(newLang);

      // Update document direction for RTL support
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;

      toast.success(`Language changed to ${newLang === 'en' ? 'English' : 'العربية'}`);
    } catch (error) {
      console.error('Language change failed:', error);
      toast.error('Failed to change language');
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLang(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = theme === "dark";

  const navbarBg = isDark
    ? scrolled
      ? "bg-[#0b1616]/80 text-[#B8E4E6] backdrop-blur-md shadow-[0_2px_15px_rgba(184,228,230,0.15)]"
      : "bg-[#0e1b1b]/85 text-[#B8E4E6] backdrop-blur-md"
    : scrolled
      ? "bg-white/95 text-slate-900 backdrop-blur-md shadow-[0_4px_20px_rgba(15,23,42,0.08)] border-b border-emerald-50"
      : "bg-[#f4fbf5]/95 text-slate-800 border-b border-emerald-50/50 backdrop-blur-md";

  const mobileMenuBg = isDark
    ? "bg-[#0e1b1b]/95 text-[#B8E4E6]"
    : "bg-white/95 text-slate-800 border-slate-200/70";

  const subtleControlBg = isDark
    ? "bg-white/20 hover:bg-white/30 text-white"
    : "bg-emerald-50 text-slate-700 hover:bg-emerald-100";
  const navLinkBase = "text-sm font-semibold tracking-tight transition-colors";
  const navLinkActive = isDark ? "text-white" : "text-emerald-700";
  const navLinkIdle = isDark
    ? "text-[#B8E4E6]/85 hover:text-white"
    : "text-slate-600 hover:text-emerald-600";

  // ✅ إجمالي عدد المنتجات في الكارت (بالـ quantity)
  const cartCount = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  const formatTimestamp = (value) => {
    if (!value) return "";
    if (value.toDate) {
      return value.toDate().toLocaleString();
    }
    if (value.seconds) {
      return new Date(value.seconds * 1000).toLocaleString();
    }
    return "";
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 border-[#B8E4E6]/20 ${navbarBg}`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 sm:px-6 md:px-8 py-3 gap-y-4">
        {/* 🌿 Logo */}
        <NavLink
          to="/"
          className={`text-lg sm:text-xl font-semibold tracking-tight hover:opacity-80 transition ${isDark ? "text-white" : "text-slate-900"}`}
        >
          🌿 Farm Vet Shop
        </NavLink>

        {/* 🧭 Navigation */}
        <nav className="hidden md:flex items-center gap-x-4 lg:gap-x-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
            }
          >
            {t('nav.products')}
          </NavLink>

          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={`${navLinkBase} ${navLinkIdle}`}
            >
              Admin Dashboard
            </NavLink>
          )}
        </nav>

        {/* 🎛️ Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* 🔍 Search */}
          <div className="hidden sm:block w-40 md:w-52 lg:w-64">
            <SearchBar placeholder="Search..." />
          </div>

          {/* 🌐 Language */}
          <button
            onClick={toggleLanguage}
            className={`h-10 w-10 rounded-lg flex items-center justify-center transition ${subtleControlBg}`}
            title={`Switch to ${currentLang === 'en' ? 'العربية' : 'English'}`}
          >
            {currentLang === 'en' ? '🇺🇸' : '🇸🇦'}
          </button>

          {/*  Theme */}
          <button
            onClick={toggle}
            className={`h-10 w-10 rounded-lg flex items-center justify-center transition ${subtleControlBg}`}
            title={t(theme === "dark" ? "common.light_mode" : "common.dark_mode")}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {/* ❤️ Favorites */}
          <button
            onClick={() => navigate("/favorites")}
            className={`relative h-10 w-10 rounded-lg flex items-center justify-center transition ${subtleControlBg}`}
          >
            <FiHeart size={20} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-xs rounded-full px-1.5 py-0.5">
                {favorites.length}
              </span>
            )}
          </button>

          {/* 🛒 Cart */}
          <button
            onClick={() => navigate("/cart")}
            className={`relative h-10 w-10 rounded-lg flex items-center justify-center transition ${subtleControlBg}`}
          >
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-600/65 text-xs rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </button>

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className={`relative h-10 w-10 rounded-lg flex items-center justify-center transition ${subtleControlBg}`}
                aria-label="Notifications"
              >
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-rose-500 text-[11px] font-semibold text-white px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <Motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`absolute right-0 mt-3 w-[22rem] max-h-96 overflow-auto rounded-2xl border shadow-2xl ${
                      isDark
                        ? "bg-[#0e1b1b] border-teal-100/10 text-[#B8E4E6]"
                        : "bg-white border-emerald-100 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-semibold">
                        {t("notifications.title", { defaultValue: "Notifications" })}
                      </p>
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate("/notifications");
                        }}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-500"
                      >
                        {t("notifications.view_all", { defaultValue: "See all" })}
                      </button>
                    </div>

                    <div className="divide-y divide-emerald-50/60 dark:divide-white/5">
                      {notifications.length === 0 && (
                        <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
                          {t("notifications.empty", { defaultValue: "No notifications yet" })}
                        </p>
                      )}

                      {notifications.slice(0, 20).map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={async () => {
                            if (!notification.read) {
                              await markRead(notification.id);
                            }
                            setNotificationsOpen(false);
                            if (notification.orderId) {
                              navigate(`/orders/${notification.orderId}`);
                            } else if (notification.productId) {
                              navigate(`/products/${notification.productId}`);
                            } else {
                              navigate("/notifications");
                            }
                          }}
                          className={`w-full text-left px-4 py-3 flex items-start justify-between gap-3 transition ${
                            notification.read
                              ? ""
                              : isDark
                              ? "bg-emerald-300/10"
                              : "bg-emerald-50"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold">{notification.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {formatTimestamp(notification.createdAt)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 👤 Auth */}
          {user ? (
            <>
              <button
                onClick={() => navigate("/account/settings")}
                className={`px-3 py-1 text-[13px] rounded-md font-medium transition ${
                  isDark
                    ? "bg-white/15 text-white hover:bg-white/25"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {t('nav.account')}
              </button>
              <Button
                text="Logout"
                onClick={handleLogout}
                className="px-3 py-1 text-[13px] rounded-md font-medium bg-[#2F7E80]/70 text-white hover:bg-[#2F7E80]/90 transition"
              />
            </>
          ) : (
            <>
              <Button
                text="Login"
                onClick={() => navigate("/login")}
                className="px-3 py-1 text-[13px] rounded-md font-medium bg-[#2F7E80] text-white hover:bg-[#256b6d] transition"
              />
              <NavLink
                to="/register"
                className={`text-sm font-medium transition ${
                  isDark ? "hover:text-white/90" : "text-slate-600 hover:text-emerald-600"
                }`}
              >
                Register
              </NavLink>
            </>
          )}

          {/* 📱 Menu */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className={`md:hidden h-10 w-10 rounded-lg transition ${
              isDark ? "bg-white/15 hover:bg-white/25" : "bg-emerald-50 hover:bg-emerald-100 text-slate-700"
            }`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* 📱 Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={`md:hidden border-t border-[#B8E4E6]/20 ${mobileMenuBg}`}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <SearchBar placeholder="Search products..." />

              {/* Language Toggle in Mobile */}
              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                🌐 {currentLang === 'en' ? 'العربية' : 'English'}
              </button>

              {user && (
                <NavLink to="/account/settings" onClick={() => setMobileOpen(false)}>
                  {t('nav.account')} & Settings
                </NavLink>
              )}
              <NavLink to="/favorites" onClick={() => setMobileOpen(false)}>
                {t('nav.favorites')} ❤️
              </NavLink>
              <NavLink to="/cart" onClick={() => setMobileOpen(false)}>
                {t('nav.cart')} 🛒
              </NavLink>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
