import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import toast from "react-hot-toast";

import SearchBar from "../search/SearchBar";
import Button from "../../components/ui/Button";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🎨 Navbar background
  const navbarBg =
    theme === "dark"
      ? scrolled
        ? "bg-[#0b1616]/80 text-[#B8E4E6] backdrop-blur-md shadow-[0_2px_15px_rgba(184,228,230,0.15)]"
        : "bg-[#0e1b1b]/85 text-[#B8E4E6] backdrop-blur-md"
      : scrolled
      ? "bg-[#101d1d]/85 text-[#B8E4E6] backdrop-blur-md"
      : "bg-[#142727]/85 text-[#B8E4E6] backdrop-blur-md";

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 border-[#B8E4E6]/20 ${navbarBg}`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 sm:px-6 md:px-8 py-3 gap-y-4">
        {/* 🌿 Logo */}
        <NavLink
          to="/"
          className="text-lg sm:text-xl font-bold tracking-wide hover:opacity-80 transition"
        >
          🌿 Farm Vet Shop
        </NavLink>

        {/* 🧭 Navigation */}
        <nav className="hidden md:flex items-center gap-x-4 lg:gap-x-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive
                  ? "underline font-semibold text-[#B8E4E6]"
                  : "hover:text-white/90"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive
                  ? "underline font-semibold text-[#B8E4E6]"
                  : "hover:text-white/90"
              }`
            }
          >
            Products
          </NavLink>

          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className="text-sm font-medium hover:text-white/90 transition"
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

          {/* 🌙 Theme */}
          <button
            onClick={toggle}
            className="h-10 w-10 rounded-lg flex items-center justify-center bg-white/20 hover:bg-white/30 transition"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {/* ❤️ Favorites */}
          <button
            onClick={() => navigate("/favorites")}
            className="relative h-10 w-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
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
            className="relative h-10 w-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <FiShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-600/65 text-xs rounded-full px-1.5 py-0.5">
                {cart.length}
              </span>
            )}
          </button>

          {/* 👤 Auth */}
          {user ? (
            <>
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
                className="text-sm font-medium hover:text-white/90 transition"
              >
                Register
              </NavLink>
            </>
          )}

          {/* 📱 Menu */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden h-10 w-10 rounded-lg bg-white/15 hover:bg-white/25 transition"
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
            className="md:hidden border-t border-[#B8E4E6]/20 bg-[#142727]/95 dark:bg-[#0e1b1b]/95 text-[#B8E4E6]"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <SearchBar placeholder="Search products..." />
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
