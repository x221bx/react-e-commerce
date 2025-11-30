// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";
import SearchBar from "../search/SearchBar";
import Button from "../../components/ui/Button";

import {
  Home,
  Package,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
} from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { theme, toggle } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const cart = useSelector((state) => state.cart?.items || []);
  const favorites = useSelector((state) => state.favorites?.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isDark = theme === "dark";
  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const favCount = favorites.length;

  const hideNavbar = ["/login", "/register", "/reset"].includes(
    location.pathname
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = async () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    await i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const handleLogout = () => {
    dispatch(signOut());
    navigate("/");
    setMobileOpen(false);
  };

  if (hideNavbar) return null;

  return (
    <>
      {/* Fixed Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                FarmVet
              </h1>
            </div>

            {/* Desktop Links */}
            <nav className="hidden md:flex items-center gap-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2 font-bold text-lg transition-colors ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-800 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400"
                  }`
                }
              >
                <Home className="w-5 h-5" /> {t("nav.home")}
              </NavLink>

              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `flex items-center gap-2 font-bold text-lg transition-colors ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-800 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400"
                  }`
                }
              >
                <Package className="w-5 h-5" /> {t("nav.products")}
              </NavLink>

              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className="font-bold text-lg text-purple-600 hover:text-purple-700"
                >
                  {t("nav.admin")}
                </NavLink>
              )}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              {/* Desktop Search */}
              <div className="hidden lg:block">
                <SearchBar
                  placeholder={t("search_placeholder") || "ابحث عن منتج..."}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Language */}
                <button
                  onClick={toggleLanguage}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="تغيير اللغة"
                >
                  <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </button>

                {/* Theme */}
                <button
                  onClick={toggle}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="تغيير الثيم"
                >
                  {isDark ? (
                    <Sun className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <Moon className="w-6 h-6 text-emerald-600" />
                  )}
                </button>

                {/* Favorites */}
                <button
                  onClick={() => navigate("/favorites")}
                  className="relative p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      favCount > 0
                        ? "text-red-500 fill-red-500"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  />
                  {favCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {favCount}
                    </span>
                  )}
                </button>

                {/* Cart */}
                <button
                  onClick={() => navigate("/cart")}
                  className="relative p-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Account - أيقونة واحدة بس */}
                <button
                  onClick={() =>
                    navigate(user ? "/account/settings" : "/login")
                  }
                  className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-3 rounded-xl bg-gray-100 dark:bg-gray-800"
                >
                  {mobileOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white dark:bg-gray-900 border 경 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-6 py-8 space-y-6">
                <NavLink
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400"
                >
                  الرئيسية
                </NavLink>
                <NavLink
                  to="/products"
                  onClick={() => setMobileOpen(false)}
                  className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400"
                >
                  المنتجات
                </NavLink>
                <NavLink
                  to="/favorites"
                  onClick={() => setMobileOpen(false)}
                  className="block text-xl text-gray-700 dark:text-gray-300"
                >
                  المفضلة ({favCount})
                </NavLink>
                <NavLink
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="block text-xl text-gray-700 dark:text-gray-300"
                >
                  السلة ({cartCount})
                </NavLink>

                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition"
                  >
                    تسجيل الخروج
                  </button>
                ) : (
                  <>
                    <Button
                      text="تسجيل الدخول"
                      onClick={() => {
                        navigate("/login");
                        setMobileOpen(false);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    />
                    <Button
                      text="إنشاء حساب"
                      onClick={() => {
                        navigate("/register");
                        setMobileOpen(false);
                      }}
                      className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold"
                    />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer عشان المحتوى ميختفيش تحت النافبار */}
      <div className="h-20" />
    </>
  );
}
