import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion as Motion, AnimatePresence } from "framer-motion";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

import SearchBar from "../search/SearchBar";
import Button from "../../components/ui/Button";

// أيقونات احترافية من react-icons
import {
  AiOutlineHome,
  AiOutlineAppstore,
  AiOutlineLogout,
  AiOutlineUser,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineShopping,
  AiOutlineHeart,
} from "react-icons/ai";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");

  const { theme, toggle } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const cart = useSelector((state) => state.cart.items);
  const favorites = useSelector((state) => state.favorites);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isAdmin = user?.role === "admin";
  const isDark = theme === "dark";

  // إخفاء Navbar في صفحات الدخول أو التسجيل
  const hideNavbar = ["/login", "/register", "/reset"].includes(
    location.pathname
  );

  // حساب عدد المنتجات في الكارت
  const cartCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLanguage = async () => {
    const newLang = currentLang === "en" ? "ar" : "en";
    await i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const handleLogout = () => {
    dispatch(signOut());
    navigate("/");
  };

  const navbarBg = isDark
    ? scrolled
      ? "bg-gray-900/90 text-white shadow-md"
      : "bg-gray-900/80 text-white"
    : scrolled
    ? "bg-white/90 text-gray-900 shadow-md"
    : "bg-white/95 text-gray-800";

  const btnBg = isDark
    ? "bg-gray-700 hover:bg-gray-600 text-white"
    : "bg-emerald-500 hover:bg-emerald-600 text-white";

  const linkBase =
    "flex items-center gap-1 px-3 py-2 rounded-md transition-colors";
  const linkActive = isDark
    ? "bg-gray-800 text-white"
    : "bg-emerald-100 text-emerald-700";
  const linkIdle = isDark
    ? "hover:bg-gray-800 text-gray-200"
    : "hover:bg-emerald-50 text-gray-800";

  if (hideNavbar) return null;

  return (
    <header className={`sticky top-0 z-50 border-b ${navbarBg}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div
          className="cursor-pointer flex items-center"
          onClick={() => {
            navigate("/");
            setMobileOpen(false);
          }}
        >
          <AiOutlineAppstore size={28} className="mr-2" />
          <span className="text-xl font-bold">Farm Vet Shop</span>
        </div>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            <AiOutlineHome size={20} />
            {t("nav.home") || "Home"}
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            <AiOutlineAppstore size={20} />
            {t("nav.products") || "Products"}
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              <AiOutlineUser size={20} />
              {t("nav.admin") || "Admin"}
            </NavLink>
          )}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden sm:block w-40 md:w-52">
            <SearchBar placeholder={t("nav.search") || "Search..."} />
          </div>

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className={`h-10 w-10 flex items-center justify-center rounded-lg ${btnBg}`}
          >
            {currentLang === "en" ? "🇺🇸" : "🇸🇦"}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className={`h-10 w-10 flex items-center justify-center rounded-lg ${btnBg}`}
          >
            {isDark ? "🌙" : "☀️"}
          </button>

          {/* Favorites */}
          <button
            onClick={() => {
              navigate("/analysis-dashboard");
              setMobileOpen(false);
            }}
            className={`relative h-10 w-10 flex items-center justify-center rounded-lg ${btnBg}`}
          >
            <AiOutlineHeart size={20} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => {
              navigate("/cart");
              setMobileOpen(false);
            }}
            className={`relative h-10 w-10 flex items-center justify-center rounded-lg ${btnBg}`}
          >
            <AiOutlineShopping size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-600 text-xs text-white rounded-full px-1">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account / Auth */}
          {user ? (
            <>
              <button
                onClick={() => {
                  navigate("/account/settings");
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-md ${btnBg}`}
              >
                <AiOutlineUser size={18} />
                {t("nav.account") || "Account"}
              </button>
              <Button
                text={t("Logout") || "Logout"}
                onClick={handleLogout}
                className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-500 text-white"
              />
            </>
          ) : (
            <>
              <Button
                text={t("Login") || "Login"}
                onClick={() => {
                  navigate("/login");
                  setMobileOpen(false);
                }}
                className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white"
              />
              <NavLink
                to="/register"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-1 rounded-md ${
                  isDark ? "text-gray-200" : "text-gray-800"
                } hover:underline`}
              >
                {t("Register") || "Register"}
              </NavLink>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden h-10 w-10 flex items-center justify-center rounded-lg ${btnBg}`}
          >
            {mobileOpen ? (
              <AiOutlineClose size={24} />
            ) : (
              <AiOutlineMenu size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:hidden px-6 py-4 ${
              isDark ? "bg-gray-900" : "bg-white"
            }`}
          >
            <div className="flex flex-col gap-4">
              <NavLink
                to="/"
                onClick={() => setMobileOpen(false)}
                className={linkBase}
              >
                <AiOutlineHome size={20} />
                {t("nav.home") || "Home"}
              </NavLink>

              <NavLink
                to="/products"
                onClick={() => setMobileOpen(false)}
                className={linkBase}
              >
                <AiOutlineAppstore size={20} />
                {t("nav.products") || "Products"}
              </NavLink>

              {isUserLoaded && isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={linkBase}
                >
                  <AiOutlineUser size={20} />
                  {t("nav.admin") || "Admin Dashboard"}
                </NavLink>
              )}

              {user && !isAdmin && (
                <NavLink
                  to="/account/orders"
                  onClick={() => setMobileOpen(false)}
                  className={linkBase}
                >
                  {t("nav.myOrders") || "My Orders"}
                </NavLink>
              )}

              <NavLink
                to="/favorites"
                onClick={() => setMobileOpen(false)}
                className={linkBase}
              >
                <AiOutlineHeart size={20} />
                {t("nav.favorites") || "Favorites"}
              </NavLink>

              <NavLink
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className={linkBase}
              >
                <AiOutlineShopping size={20} />
                {t("nav.cart") || "Cart"}
              </NavLink>

              {user ? (
                <button
                  onClick={handleLogout}
                  className={`${linkBase} text-red-500`}
                >
                  <AiOutlineLogout size={20} />
                  {t("nav.logout") || "Logout"}
                </button>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className={linkBase}
                >
                  {t("nav.login") || "Login"}
                </NavLink>
              )}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
