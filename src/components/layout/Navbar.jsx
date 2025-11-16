import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import toast from "react-hot-toast";
import i18n from "../../i18n";

import SearchBar from "../search/SearchBar";
import Button from "../../components/ui/Button";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const { theme, toggle } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const cart = useSelector((state) => state.cart.items);
  const favorites = useSelector((state) => state.favorites);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(signOut());
    toast.success("Logged out successfully 👋");
  };

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    toast.success(`Language changed to ${newLang === 'en' ? 'English' : 'العربية'}`);
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
            Products
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
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
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
                Account
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
            onClick={() => setOpen((o) => !o)}
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
        {open && (
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
                  setOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                🌐 {currentLang === 'en' ? 'العربية' : 'English'}
              </button>

              {user && (
                <NavLink to="/account/settings" onClick={() => setOpen(false)}>
                  Account & Settings
                </NavLink>
              )}
              <NavLink to="/favorites" onClick={() => setOpen(false)}>
                Favorites ❤️
              </NavLink>
              <NavLink to="/cart" onClick={() => setOpen(false)}>
                Cart 🛒
              </NavLink>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
