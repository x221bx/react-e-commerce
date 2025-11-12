import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion as Motion, AnimatePresence } from "framer-motion";
import SearchBar from "../search/SearchBar";
import Button from "../../components/ui/Button"; // ✅ استيراد الزرار الموحد

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => dispatch(signOut());

  const links = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Learn", path: "/learn" },
    { name: "About Us", path: "/about" },
    ...(user ? [{ name: "Favorites ❤️", path: "/favorites" }] : []),
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMobileSearch = (query) => {
    if (query?.trim()) {
      setOpen(false);
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const navbarBg =
    theme === "dark"
      ? scrolled
        ? "bg-[#0b1616]/90 text-[#B8E4E6] backdrop-blur-md shadow-[0_2px_15px_rgba(184,228,230,0.15)]"
        : "bg-[#0e1b1b]/95 text-[#B8E4E6] backdrop-blur-md shadow-[0_2px_15px_rgba(184,228,230,0.12)]"
      : scrolled
      ? "bg-[#101d1d]/90 text-[#B8E4E6] backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.25)]"
      : "bg-[#142727]/95 text-[#B8E4E6] backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.18)]";

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
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "underline font-semibold text-[#B8E4E6]"
                    : "hover:text-white/90"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

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
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
          {/* 🔍 Search */}
          <div className="hidden sm:block w-40 md:w-52 lg:w-64 xl:w-72 flex-shrink">
            <SearchBar placeholder="Search..." />
          </div>

          {/* 🌙 Theme Toggle */}
          <button
            onClick={toggle}
            className="h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center text-lg
              bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20
              transition-all duration-300"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {/* 👤 Auth */}
          {user ? (
            <>
              <span className="hidden lg:flex text-sm bg-white/15 px-3 py-1 rounded-full items-center text-[#B8E4E6]">
                {user.role === "admin"
                  ? "Hi, Admin 👑"
                  : `Hi, ${user.name || "User"}`}
              </span>

              {/* ✅ زرار Logout كمبوننت موحد */}
              <Button
                text="Logout"
                onClick={handleLogout}
                className={`px-3 py-1 rounded-md text-[13px] font-medium transition-all duration-300
                ${
                  theme === "dark"
                    ? "bg-[#2F7E80]/70 text-[#0e1b1b] hover:bg-[#2F7E80]/90" // ← النص بقى غامق في الدارك
                    : "bg-[#2F7E80] text-white hover:bg-[#256b6d]"
                }`}
              />
            </>
          ) : (
            <>
              {/* ✅ زرار Login كمبوننت موحد */}
              <Button
                text="Login"
                onClick={() => navigate("/login")}
                className={`px-3 py-1 rounded-md text-[13px] font-medium transition-all duration-300
                  ${
                    theme === "dark"
                      ? "bg-[#2F7E80]/70 text-[#0e1b1b] hover:bg-[#2F7E80]/90" // ← نفس التعديل هنا
                      : "bg-[#2F7E80] text-white hover:bg-[#256b6d]"
                  }`}
              />
              <NavLink
                to="/register"
                className="text-sm font-medium hover:text-white/90 transition"
              >
                Register
              </NavLink>
            </>
          )}

          {/* 📱 Menu Toggle */}
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
              <SearchBar
                placeholder="Search products..."
                onSearch={(q) => handleMobileSearch(q)}
              />

              <div className="flex flex-col gap-2">
                {links.map((l) => (
                  <NavLink
                    key={l.name}
                    to={l.path}
                    onClick={() => setOpen(false)}
                    className="py-2 text-sm hover:text-white/90 transition"
                  >
                    {l.name}
                  </NavLink>
                ))}

                {user?.role === "admin" && (
                  <NavLink
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="py-2 text-sm hover:text-white/90 transition"
                  >
                    Admin Dashboard
                  </NavLink>
                )}
              </div>

              <div className="border-t border-[#B8E4E6]/20 pt-3 mt-2 flex flex-col gap-2">
                {user ? (
                  <Button
                    text="Logout"
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="w-full bg-white text-[#0e1b1b] hover:bg-[#B8E4E6]/90"
                  />
                ) : (
                  <>
                    <Button
                      text="Login"
                      onClick={() => {
                        navigate("/login");
                        setOpen(false);
                      }}
                      className="w-full bg-white text-[#0e1b1b] hover:bg-[#B8E4E6]/90"
                    />
                    <NavLink
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="py-2 hover:text-white/90 text-center"
                    >
                      Register
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
