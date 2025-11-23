import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiShoppingCart, FiBell, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

import SearchBar from "../search/SearchBar";
import Button from "../../components/ui/Button";
import { useNotifications } from "../../hooks/useNotifications";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");

  const { theme, toggle } = UseTheme();

  const user = useSelector(selectCurrentUser);
  const cart = useSelector((state) => state.cart.items);
  const favorites = useSelector((state) => state.favorites.items);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { unreadCount, connectionError } = useNotifications({
    uid: user?.uid,
    role: user?.role,
  });


  const toggleLanguage = async () => {
    const newLang = currentLang === "en" ? "ar" : "en";
    await i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const handleLogout = () => {
    dispatch(signOut());
    toast.success("Logged out successfully 👋");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    if (connectionError) {
      toast.error("Real-time notifications are blocked. Please disable ad blockers for this site.", {
        duration: 6000,
      });
    }
  }, [connectionError]);

  const isDark = theme === "dark";

  const navbarColorDark =
    "bg-[#0c1717]/45 backdrop-blur-2xl text-[#B8E4E6] shadow-[0_2px_5px_rgba(0,0,0,0.45)] border-b border-white/10";

  const navbarColorLight =
    "bg-[#123033]/55 backdrop-blur-2xl text-[#B8E4E6] shadow-[0_6px_20px_rgba(0,0,0,0.28)] border-b border-white/12";

  const navbarBg = `
    ${isDark ? navbarColorDark : navbarColorLight}
    ${scrolled ? "shadow-xl border-b border-white/20" : ""}
  `;

  const mobileMenuBg = isDark
    ? "bg-[#0e1b1b]/95 backdrop-blur-xl text-[#B8E4E6]"
    : "bg-[#142727]/95 backdrop-blur-xl text-[#B8E4E6]";

  const subtleControlBg =
    "bg-white/20 hover:bg-white/30 text-white transition";

  const navLinkBase = "text-sm font-semibold tracking-tight transition-colors";
  const navLinkActive = "text-white";
  const navLinkIdle = "text-[#B8E4E6]/80 hover:text-white";

  const cartCount = Array.isArray(cart) ? cart.reduce((s, i) => s + (i.quantity || 1), 0) : 0;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${navbarBg}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap px-4 sm:px-6 md:px-8 py-3 gap-y-3">
        
        {/* 🌿 Logo */}
        <NavLink className="text-lg sm:text-xl font-semibold tracking-tight" to="/">
          🌿 Farm Vet Shop
        </NavLink>

        {/* 🧭 Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-x-6 lg:gap-x-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
            }
          >
            {t("nav.home", "Home")}
          </NavLink>

          <NavLink to="/products" className={({ isActive }) =>
            `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`}>{t("nav.products")}</NavLink>

          <NavLink to="/articles" className={({ isActive }) =>
            `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`}>{t("nav.articles", "Articles")}</NavLink>

          {user?.role === "admin" && (
            <NavLink className={`${navLinkBase} ${navLinkIdle}`} to="/admin">
              Admin Dashboard
            </NavLink>
          )}
        </nav>

        {/* 🎛 Controls */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-1 lg:gap-1">

          {/* 🔍 Search */}
          <div className="hidden lg:block w-73 xl:w-90">
            <SearchBar placeholder="Search..." />
          </div>

          {/* Lang */}
          <button onClick={toggleLanguage} className={`h-9 w-9 rounded-lg flex items-center justify-center ${subtleControlBg}`}>
            {currentLang === "en" ? "🇺🇸" : "🇸🇦"}
          </button>

          {/* Theme */}
          <button onClick={toggle} className={`h-9 w-9 rounded-lg flex items-center justify-center ${subtleControlBg}`}>
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {/* Favorites */}
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate("/favorites");
            }}
            className={`relative h-9 w-9 rounded-lg flex items-center justify-center ${subtleControlBg}`}
          >
            <FiHeart size={18} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-xs rounded-full px-1">
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
            className={`relative h-9 w-9 rounded-lg flex items-center justify-center ${subtleControlBg}`}
          >
            <FiShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-600 text-xs rounded-full px-1">
                {cartCount}
              </span>
            )}
          </button>

          {/* 🔔 Notifications */}
          {user && (
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate("/notifications");
              }}
              className={`relative h-9 w-9 rounded-lg flex items-center justify-center ${subtleControlBg}`}
            >
              <FiBell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-xs rounded-full px-1 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* 👤 Account Icon */}
          {user && (
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate("/account/settings");
              }}
              className="flex h-9 w-9 rounded-full items-center justify-center bg-white/20 hover:bg-white/30 text-white"
            >
              <FiUser size={18} />
            </button>
          )}

          {/* 🔐 LOGIN / REGISTER (Desktop) */}
          {!user && (
            <>
              <Button
                text="Login"
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
                Register
              </button>
            </>
          )}

          {/* 🚪 LOGOUT (Desktop) */}
          {user && (
            <button
              onClick={handleLogout}
              className="hidden md:block px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          )}

          {/* 📱 Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className={`lg:hidden h-10 w-10 rounded-lg ${subtleControlBg}`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`lg:hidden border-t border-white/10 ${mobileMenuBg}`}
          >
            <div className="px-6 py-4 flex flex-col gap-4">

              <SearchBar placeholder="Search..." />

              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 py-2"
              >
                🌐 {currentLang === "en" ? "العربية" : "English"}
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigate("/favorites");
                }}
                className="py-2 text-left w-full"
              >
                ❤️ Favorites
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigate("/cart");
                }}
                className="py-2 text-left w-full"
              >
                🛒 Cart
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigate("/articles");
                }}
                className="py-2 text-left w-full"
              >
                📰 {t("nav.articles", "Articles")}
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigate("/notifications");
                }}
                className="py-2 text-left w-full"
              >
                🔔 Notifications
              </button>

              {user && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      navigate("/account/settings");
                    }}
                    className="py-2 text-left w-full"
                  >
                    👤 Account
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="text-red-400 py-2 text-left w-full"
                  >
                    🚪 Logout
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
                    className="py-2 text-left w-full"
                  >
                    🔐 Login
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      navigate("/register");
                    }}
                    className="py-2 text-left w-full"
                  >
                    📝 Register
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
