// src/components/layout/Navbar.jsx
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiBell,
  FiGlobe,
  FiSun,
  FiMoon,
  FiMenu,
  FiBook,
  FiLogOut,
  FiLogIn,
  FiUserPlus,
  FiFeather,
  FiTruck,
  FiSettings,
} from "react-icons/fi";
import toast from "react-hot-toast";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

import SearchBar from "../search/SearchBar";
import Button from "../ui/Button";
import { useUserNotifications } from "../../hooks/useUserNotifications";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");

  const { theme, toggle } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const cartItems = useSelector((state) => state.cart?.items || []);
  const favorites = useSelector((state) => state.favorites?.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isAdminUser = user?.role === "admin" || user?.isAdmin;
  const isDeliveryUser = user?.role === "delivery" || user?.isDelivery;
  const isRTL = currentLang === "ar";

  const { unreadCount } = useUserNotifications(user?.uid);

  const toggleLanguage = async () => {
    const newLang = currentLang === "en" ? "ar" : "en";
    await i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const handleLogout = () => {
    dispatch(signOut());
    toast.success(t("navbar.logout_success"));
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDark = theme === "dark";

  // 🎨 ألوان الناف بار (Glass + Gradient)
  const navbarColorDark = `
    bg-[#020a0a]/90 
    backdrop-blur-2xl 
    text-[#C8F4EC]
    border-b border-emerald-900/50
    shadow-[0_12px_35px_rgba(0,0,0,0.75)]
  `;
  const navbarColorLight = `
    bg-gradient-to-r from-[#0d2626]/90 via-[#123033]/90 to-[#0d2626]/90
    backdrop-blur-2xl 
    text-[#E4FAF3]
    border-b border-emerald-500/25
    shadow-[0_12px_35px_rgba(15,23,42,0.55)]
  `;

  const navbarBg = `
    ${isDark ? navbarColorDark : navbarColorLight}
    ${scrolled ? "shadow-2xl scale-[1.01]" : ""}
    transition-all duration-500
  `;

  const mobileMenuBg = isDark
    ? "bg-[#050909]/98 backdrop-blur-2xl text-[#C8F4EC]"
    : "bg-[#102526]/98 backdrop-blur-2xl text-[#E4FAF3]";

  const subtleControlBg = `
    bg-white/10 hover:bg-white/20 text-white 
    dark:bg-emerald-900/40 dark:hover:bg-emerald-800/60
    border border-white/10 dark:border-emerald-800
    shadow-[0_0_12px_rgba(15,118,110,0.35)]
    transition-all duration-300
  `;

  const navLinkBase =
    "relative text-sm font-semibold tracking-tight transition-colors duration-300";
  const navLinkActive =
    "text-emerald-300 dark:text-emerald-300";
  const navLinkIdle =
    "text-[#B8E4E6]/80 hover:text-white";

  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item?.quantity || 1),
    0
  );

  const hideNavbar =
    ["/login", "/register", "/reset"].includes(location.pathname) ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/delivery");

  if (hideNavbar) return null;

  return (
    <header
      className={`sticky top-0 z-50 ${navbarBg}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* خط إضاءة خفيف تحت النافبار عند السكرول */}
      <div
        className={`absolute inset-x-0 bottom-0 h-px pointer-events-none ${
          scrolled
            ? "bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent"
            : "bg-transparent"
        }`}
      />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8">
        <Motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex items-center gap-4 py-3"
        >
          {/* LOGO + BRAND */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <NavLink
              className="text-lg sm:text-xl font-semibold tracking-tight"
              to="/"
            >
              <span className="inline-flex items-center gap-2">
                <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 dark:bg-emerald-500/15 border border-emerald-400/40 shadow-[0_0_18px_rgba(16,185,129,0.55)]">
                  <FiFeather className="w-4 h-4 text-emerald-300" />
                </span>
                <span className="hidden sm:inline-block">
                  {t("brand.name")}
                </span>
              </span>
            </NavLink>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav
            className={`hidden md:flex items-center gap-6 text-sm font-semibold ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
              }
            >
              {({ isActive }) => (
                <span className="inline-flex items-center gap-1">
                  {t("nav.home", "Home")}
                  {isActive && (
                    <span className="h-[2px] w-5 rounded-full bg-emerald-400 block" />
                  )}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
              }
            >
              {({ isActive }) => (
                <span className="inline-flex items-center gap-1">
                  {t("nav.products")}
                  {isActive && (
                    <span className="h-[2px] w-5 rounded-full bg-emerald-400 block" />
                  )}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/articles"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
              }
            >
              {({ isActive }) => (
                <span className="inline-flex items-center gap-1">
                  {t("nav.articles", "Articles")}
                  {isActive && (
                    <span className="h-[2px] w-5 rounded-full bg-emerald-400 block" />
                  )}
                </span>
              )}
            </NavLink>

            {(isDeliveryUser || isAdminUser) && (
              <NavLink
                className={`${navLinkBase} ${navLinkIdle}`}
                to="/delivery"
              >
                {t("delivery.portal", "Delivery Hub")}
              </NavLink>
            )}

            {isAdminUser && (
              <NavLink
                className={`${navLinkBase} ${navLinkIdle}`}
                to="/admin"
              >
                {t("admin.dashboard")}
              </NavLink>
            )}
          </nav>

          {/* DESKTOP SEARCH */}
          <div className="hidden lg:block flex-1">
            <SearchBar placeholder={t("navbar.search_placeholder")} />
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-2 ml-auto">
            {/* LANGUAGE */}
            <button
              onClick={toggleLanguage}
              className={`h-9 w-9 rounded-xl flex items-center justify-center ${subtleControlBg}`}
            >
              <FiGlobe className="w-4 h-4" />
              <span className="sr-only">
                {t("navbar.toggle_language", "Toggle language")}
              </span>
            </button>

            {/* THEME */}
            <button
              onClick={toggle}
              className={`h-9 w-9 rounded-xl flex items-center justify-center ${subtleControlBg}`}
            >
              {theme === "dark" ? (
                <FiSun className="w-4 h-4 text-yellow-300" />
              ) : (
                <FiMoon className="w-4 h-4 text-sky-200" />
              )}
              <span className="sr-only">
                {t("navbar.toggle_theme", "Toggle theme")}
              </span>
            </button>

            {/* FAV / CART / USER / NOTIFICATIONS (DESKTOP) */}
            <div className="hidden md:flex items-center gap-2">
              {/* Favorites */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/favorites");
                }}
                className={`relative h-9 w-9 rounded-xl flex items-center justify-center ${subtleControlBg}`}
                aria-label={t("navbar.favorites")}
              >
                <FiHeart size={18} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 rtl:left-1 rtl:right-0 bg-pink-500 text-xs rounded-full px-1">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/cart");
                }}
                className={`relative h-9 w-9 rounded-xl flex items-center justify-center ${subtleControlBg}`}
                aria-label={t("navbar.cart")}
              >
                <FiShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 rtl:left-1 rtl:right-0 bg-cyan-600 text-xs rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </button>

              {user && (
                <>
                  {/* Notifications */}
                  <button
                    onClick={() => navigate("/notifications")}
                    className="relative h-9 w-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white dark:bg-emerald-900/40 dark:hover:bg-emerald-800/70 border border-white/15 dark:border-emerald-800 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-300"
                    aria-label={t("navbar.notifications", "Notifications")}
                  >
                    <FiBell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 rtl:left-1 rtl:right-0 min-w-[18px] px-1 py-0.5 text-[10px] font-semibold rounded-full bg-red-500 text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Account */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/account/settings");
                    }}
                    className="flex h-9 w-9 rounded-full items-center justify-center bg-white/10 hover:bg-white/20 text-white dark:bg-emerald-900/40 dark:hover:bg-emerald-800/70 border border-white/15 dark:border-emerald-800 transition-all duration-300"
                    aria-label={t("navbar.account")}
                  >
                    <FiUser size={18} />
                  </button>
                </>
              )}
            </div>

            {/* AUTH BUTTONS (DESKTOP) */}
            {!user && (
              <>
                <Button
                  text={t("auth.login")}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                  className="hidden md:block px-3 py-1 text-sm bg-emerald-500 text-white hover:bg-emerald-400 rounded-xl shadow-[0_6px_18px_rgba(16,185,129,0.45)]"
                />
                <Button
                  text={t("auth.register")}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/register");
                  }}
                  className="hidden md:block px-3 py-1 text-sm bg-transparent border border-emerald-400 text-emerald-100 hover:bg-emerald-500/10 rounded-xl"
                />
              </>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="hidden md:block px-3 py-1 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-[0_6px_18px_rgba(220,38,38,0.45)]"
              >
                {t("auth.logout")}
              </button>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileOpen((open) => !open)}
              className={`md:hidden h-10 w-10 rounded-xl flex items-center justify-center ${subtleControlBg}`}
              aria-label={t("navbar.toggle_menu", {
                defaultValue: "Toggle menu",
              })}
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>
        </Motion.div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`lg:hidden border-t border-white/10 ${mobileMenuBg}`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div
              className={`px-6 py-4 flex flex-col gap-4 ${
                isRTL ? "text-right items-end" : ""
              }`}
            >
              <SearchBar placeholder={t("navbar.search_placeholder")} />

              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/");
                }}
                className="flex items-center gap-3 py-2"
              >
                <FiFeather className="w-4 h-4" />
                {t("nav.home", "Home")}
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigate("/favorites");
                }}
                className={`py-2 w-full ${
                  isRTL ? "text-right" : "text-left"
                } inline-flex items-center gap-2`}
              >
                <FiHeart className="w-4 h-4" />
                {t("navbar.favorites")}
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigate("/cart");
                }}
                className={`py-2 w-full ${
                  isRTL ? "text-right" : "text-left"
                } inline-flex items-center gap-2`}
              >
                <FiShoppingCart className="w-4 h-4" />
                {t("navbar.cart")}
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigate("/articles");
                }}
                className={`py-2 w-full ${
                  isRTL ? "text-right" : "text-left"
                } inline-flex items-center gap-2`}
              >
                <FiBook className="w-4 h-4" />
                {t("nav.articles", "Articles")}
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigate("/notifications");
                }}
                className={`py-2 w-full ${
                  isRTL ? "text-right" : "text-left"
                } flex items-center justify-between`}
              >
                <span className="inline-flex items-center gap-2">
                  <FiBell className="w-4 h-4" />
                  {t("navbar.notifications")}
                </span>
                {unreadCount > 0 && (
                  <span className="rtl-ml-auto rtl-mr-3 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs px-2 py-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {(isDeliveryUser || isAdminUser) && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    navigate("/delivery");
                  }}
                  className={`py-2 w-full ${
                    isRTL ? "text-right" : "text-left"
                  } inline-flex items-center gap-2`}
                >
                  <FiTruck className="w-4 h-4" />
                  {t("delivery.portal", "Delivery Hub")}
                </button>
              )}

              {isAdminUser && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    navigate("/admin");
                  }}
                  className={`py-2 w-full ${
                    isRTL ? "text-right" : "text-left"
                  } inline-flex items-center gap-2`}
                >
                  <FiSettings className="w-4 h-4" />
                  {t("admin.dashboard")}
                </button>
              )}

              {user && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      navigate("/account/settings");
                    }}
                    className={`py-2 w-full ${
                      isRTL ? "text-right" : "text-left"
                    } inline-flex items-center gap-2`}
                  >
                    👤 {t("navbar.account")}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className={`text-red-400 py-2 w-full ${
                      isRTL ? "text-right" : "text-left"
                    } inline-flex items-center gap-2`}
                  >
                    🚪 {t("navbar.logout")}
                  </button>
                </>
              )}

              {!user && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      navigate("/login");
                    }}
                    className={`py-2 w-full ${
                      isRTL ? "text-right" : "text-left"
                    } inline-flex items-center gap-2`}
                  >
                    <FiLogIn className="w-4 h-4" />
                    {t("navbar.login")}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      navigate("/register");
                    }}
                    className={`py-2 w-full ${
                      isRTL ? "text-right" : "text-left"
                    } inline-flex items-center gap-2`}
                  >
                    <FiUserPlus className="w-4 h-4" />
                    {t("navbar.register")}
                  </button>
                </>
              )}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
