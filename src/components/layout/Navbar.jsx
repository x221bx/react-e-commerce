import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

import SearchBar from "../search/SearchBar";
import Button from "../../components/ui/Button";

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

  // Hide navbar on login/register screens
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  const toggleLanguage = async () => {
    const newLang = currentLang === "en" ? "ar" : "en";
    await i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navbarBg = isDark
    ? scrolled
      ? "bg-[#0b1616]/80 text-[#B8E4E6] backdrop-blur-md shadow"
      : "bg-[#0e1b1b]/85 text-[#B8E4E6]"
    : scrolled
    ? "bg-white/95 text-slate-900 backdrop-blur-md shadow"
    : "bg-[#f4fbf5]/95 text-slate-800";

  const subtleControlBg = isDark
    ? "bg-white/20 hover:bg-white/30 text-white"
    : "bg-emerald-50 text-slate-700 hover:bg-emerald-100";

  const navLinkBase = "text-sm font-semibold tracking-tight transition-colors";
  const navLinkActive = isDark ? "text-white" : "text-emerald-700";
  const navLinkIdle = isDark
    ? "text-[#B8E4E6]/85 hover:text-white"
    : "text-slate-600 hover:text-emerald-600";

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (hideNavbar) return null;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${navbarBg}`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <NavLink
          to="/"
          className={`text-lg sm:text-xl font-semibold hover:opacity-80 transition`}
        >
          🌿 Farm Vet Shop
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
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
            {t("nav.products")}
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
            }
          >
            About Us
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
              }
            >
              Admin Dashboard
            </NavLink>
          )}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden sm:block w-40 md:w-56">
            <SearchBar placeholder="Search..." />
          </div>

          {/* Language */}
          <button
            onClick={toggleLanguage}
            className={`h-10 w-10 rounded-lg flex items-center justify-center ${subtleControlBg}`}
          >
            {currentLang === "en" ? "🇺🇸" : "🇸🇦"}
          </button>

          {/* Theme */}
          <button
            onClick={toggle}
            className={`h-10 w-10 rounded-lg flex items-center justify-center ${subtleControlBg}`}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {/* Favorites */}
          <button
            onClick={() => navigate("/favorites")}
            className={`relative h-10 w-10 rounded-lg flex items-center justify-center ${subtleControlBg}`}
          >
            <FiHeart size={20} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-xs rounded-full px-1">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            className={`relative h-10 w-10 rounded-lg flex items-center justify-center ${subtleControlBg}`}
          >
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-600 text-xs rounded-full px-1">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth */}
          {user ? (
            <>
              <button
                onClick={() => navigate("/account/settings")}
                className="px-3 py-1 text-sm rounded-md bg-slate-900 text-white"
              >
                Account
              </button>
              <Button
                text="Logout"
                onClick={() => dispatch(signOut())}
                className="px-3 py-1 text-sm rounded-md bg-red-700 text-white"
              />
            </>
          ) : (
            <>
              <Button
                text="Login"
                onClick={() => navigate("/login")}
                className="px-3 py-1 text-sm rounded-md bg-emerald-700 text-white"
              />
              <NavLink
                to="/register"
                className="text-sm hover:text-emerald-600"
              >
                Register
              </NavLink>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className={`md:hidden h-10 w-10 rounded-lg ${subtleControlBg}`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`md:hidden px-6 py-4 ${
              isDark ? "bg-[#0e1b1b]" : "bg-white"
            }`}
          >
            <SearchBar placeholder="Search..." />

            <div className="flex flex-col gap-4 mt-3">
              <NavLink to="/" onClick={() => setMobileOpen(false)}>
                Home
              </NavLink>

              <NavLink to="/products" onClick={() => setMobileOpen(false)}>
                Products
              </NavLink>

              <NavLink to="/about" onClick={() => setMobileOpen(false)}>
                About Us
              </NavLink>

              {isAdmin && (
                <NavLink to="/admin" onClick={() => setMobileOpen(false)}>
                  Admin Dashboard
                </NavLink>
              )}

              {user && !isAdmin && (
                <NavLink to="/userorders" onClick={() => setMobileOpen(false)}>
                  My Orders
                </NavLink>
              )}

              <NavLink to="/favorites" onClick={() => setMobileOpen(false)}>
                Favorites ❤️
              </NavLink>
              <NavLink to="/cart" onClick={() => setMobileOpen(false)}>
                Cart 🛒
              </NavLink>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
