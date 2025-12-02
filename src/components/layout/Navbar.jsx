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
  const navbarColorDark =
    "bg-[#0c1717]/45 backdrop-blur-2xl text-[#B8E4E6] shadow-[0_2px_5px_rgba(0,0,0,0.45)] border-b border-white/10";
  const navbarColorLight =
    "bg-[#123033]/55 backdrop-blur-2xl text-[#B8E4E6] shadow-[0_6px_20px_rgba(0,0,0,0.28)] border-b border-white/12";
  const navbarBg = `${isDark ? navbarColorDark : navbarColorLight} ${
    scrolled ? "shadow-xl border-b border-white/20" : ""
  }`;
  const mobileMenuBg = isDark
    ? "bg-[#0e1b1b]/95 backdrop-blur-xl text-[#B8E4E6]"
    : "bg-[#142727]/95 backdrop-blur-xl text-[#B8E4E6]";
  const subtleControlBg = "bg-white/20 hover:bg-white/30 text-white transition";
  const navLinkBase = "text-sm font-semibold tracking-tight transition-colors";
  const navLinkActive = "text-white";
  const navLinkIdle = "text-[#B8E4E6]/80 hover:text-white";
  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item?.quantity || 1),
    0
  );

  const hideNavbar =
    ["/login", "/register", "/reset"].includes(location.pathname) ||
    location.pathname.startsWith("/admin");

  if (hideNavbar) return null;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${navbarBg}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center gap-4 px-4 sm:px-6 md:px-8 py-3">
        <div className="flex items-center gap-4 flex-shrink-0">
          <NavLink className="text-lg sm:text-xl font-semibold tracking-tight" to="/">
            <span className="inline-flex items-center gap-2">
              <FiFeather className="w-5 h-5 text-emerald-400" />
              {t("brand.name")}
            </span>
          </NavLink>
        </div>

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
            {t("nav.home", "Home")}
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
            }
          >
            {t("nav.products")}
          </NavLink>
          <NavLink
            to="/articles"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
            }
          >
            {t("nav.articles", "Articles")}
          </NavLink>
          {isAdminUser && (
            <NavLink
              className={`${navLinkBase} ${navLinkIdle}`}
              to="/admin"
            >
              {t("admin.dashboard")}
            </NavLink>
          )}
        </nav>

        <div className="hidden lg:block flex-1">
          <SearchBar placeholder={t("navbar.search_placeholder")} />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggleLanguage}
            className={`h-9 w-9 rounded-lg flex items-center justify-center ${subtleControlBg}`}
          >
            <FiGlobe className="w-4 h-4" />
            <span className="sr-only">
              {t("navbar.toggle_language", "Toggle language")}
            </span>
          </button>

          <button
            onClick={toggle}
            className={`h-9 w-9 rounded-lg flex items-center justify-center ${subtleControlBg}`}
          >
            {theme === "dark" ? (
              <FiSun className="w-4 h-4" />
            ) : (
              <FiMoon className="w-4 h-4" />
            )}
            <span className="sr-only">
              {t("navbar.toggle_theme", "Toggle theme")}
            </span>
          </button>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate("/favorites");
              }}
              className={`relative h-9 w-9 rounded-lg flex items-center justify-center ${subtleControlBg}`}
              aria-label={t("navbar.favorites")}
            >
              <FiHeart size={18} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 rtl-left-1 rtl-right-0 bg-pink-500 text-xs rounded-full px-1">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                navigate("/cart");
              }}
              className={`relative h-9 w-9 rounded-lg flex items-center justify-center ${subtleControlBg}`}
              aria-label={t("navbar.cart")}
            >
              <FiShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 rtl-left-1 rtl-right-0 bg-cyan-600 text-xs rounded-full px-1">
                  {cartCount}
                </span>
              )}
            </button>

            {user && (
              <>
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative h-9 w-9 rounded-lg flex items-center justify-center bg-white/20 hover:bg-white/30 text-white"
                  aria-label={t("navbar.notifications", "Notifications")}
                >
                  <FiBell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 rtl-left-1 rtl-right-0 min-w-[18px] px-1 py-0.5 text-[10px] font-semibold rounded-full bg-red-500 text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/account/settings");
                  }}
                  className="flex h-9 w-9 rounded-full items-center justify-center bg-white/20 hover:bg-white/30 text-white"
                  aria-label={t("navbar.account")}
                >
                  <FiUser size={18} />
                </button>
              </>
            )}
          </div>

          {!user && (
            <>
              <Button
                text={t("auth.login")}
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
                className="hidden md:block px-3 py-1 text-sm bg-[#2F7E80] text-white hover:bg-[#236a6c]"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
                className="hidden md:block text-sm underline opacity-80 hover:opacity-100"
              >
                {t("auth.register")}
              </button>
            </>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="hidden md:block px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t("auth.logout")}
            </button>
          )}

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className={`md:hidden h-10 w-10 rounded-lg ${subtleControlBg}`}
            aria-label={t("navbar.toggle_menu", { defaultValue: "Toggle menu" })}
          >
            <FiMenu className="w-5 h-5" />
          </button>
        </div>
      </div>
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

  {/* 🔥 زر Home الجديد */}
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

  {/* ❌ حذف زر تغيير اللغة من هنا
  <button ...toggleLanguage> ... </button>
  */}


              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigate("/favorites");
                }}
                className={`py-2 w-full ${isRTL ? "text-right" : "text-left"} inline-flex items-center gap-2`}
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
                className={`py-2 w-full ${isRTL ? "text-right" : "text-left"} inline-flex items-center gap-2`}
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
                className={`py-2 w-full ${isRTL ? "text-right" : "text-left"} inline-flex items-center gap-2`}
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
                className={`py-2 w-full ${isRTL ? "text-right" : "text-left"} flex items-center justify-between`}
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
                    🔐 {t("navbar.login")}
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
                    📝 {t("navbar.register")}
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
