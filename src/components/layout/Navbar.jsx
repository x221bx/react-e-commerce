// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiShoppingCart, FiBell } from "react-icons/fi";
import toast from "react-hot-toast";
import SearchBar from "../search/SearchBar";
import Button from "../../components/ui/Button";
import { useNotifications } from "../../hooks/useNotifications";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const cart = useSelector((state) => state.cart.items);
  const favorites = useSelector((state) => state.favorites);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navbarBg =
    theme === "dark"
      ? scrolled
        ? "bg-[#0b1616]/80 text-[#B8E4E6] backdrop-blur-md"
        : "bg-[#0e1b1b]/85 text-[#B8E4E6] backdrop-blur-md"
      : scrolled
      ? "bg-[#101d1d]/85 text-[#B8E4E6] backdrop-blur-md"
      : "bg-[#142727]/85 text-[#B8E4E6] backdrop-blur-md";

  const cartCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);

  const { notifications, unreadCount, markRead } = useNotifications({
    uid: user?.uid,
    role: user?.role,
  });

  const dropdownRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b ${navbarBg}`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 py-3 gap-y-4">
        <NavLink to="/" className="text-lg sm:text-xl font-bold tracking-wide">
          🌿 Farm Vet Shop
        </NavLink>

        <nav className="hidden md:flex items-center gap-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "underline font-semibold" : "hover:text-white/90"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? "underline font-semibold" : "hover:text-white/90"
            }
          >
            Products
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className="hover:text-white/90">
              Admin Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:block w-40 md:w-52 lg:w-64">
            <SearchBar placeholder="Search..." />
          </div>

          <button onClick={toggle} className="h-10 w-10 rounded-lg bg-white/20">
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          <button
            onClick={() => navigate("/favorites")}
            className="relative h-10 w-10 rounded-lg bg-white/20"
          >
            <FiHeart size={20} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-xs rounded-full px-1.5">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="relative h-10 w-10 rounded-lg bg-white/20"
          >
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-600 text-xs rounded-full px-1.5">
                {cartCount}
              </span>
            )}
          </button>

          {/* Notifications bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((s) => !s)}
              className="relative h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center"
              aria-label="Notifications"
            >
              <FiBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-xs rounded-full px-1.5 text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {open && (
                <Motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-96 max-h-96 overflow-auto rounded-lg bg-white shadow-lg border"
                >
                  <div className="p-3 flex items-center justify-between border-b">
                    <div className="font-medium">Notifications</div>
                    <button
                      onClick={() => {
                        /* open full page */ navigate("/notifications");
                        setOpen(false);
                      }}
                      className="text-sm text-blue-600"
                    >
                      See all
                    </button>
                  </div>

                  <div className="divide-y">
                    {notifications.length === 0 && (
                      <div className="p-4 text-sm text-gray-500">
                        No notifications
                      </div>
                    )}

                    {notifications.slice(0, 20).map((n) => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          if (!n.read) await markRead(n.id);
                          setOpen(false);
                          if (n.orderId) navigate(`/orders/${n.orderId}`);
                          else if (n.productId)
                            navigate(`/products/${n.productId}`);
                          else navigate("/notifications");
                        }}
                        className={`p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-start gap-2 ${
                          n.read ? "" : "bg-[#E8FFFB]"
                        }`}
                      >
                        <div>
                          <div className="font-medium text-sm">{n.title}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {n.message}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {n.createdAt?.toDate
                            ? n.createdAt.toDate().toLocaleString()
                            : n.createdAt?.seconds
                            ? new Date(
                                n.createdAt.seconds * 1000
                              ).toLocaleString()
                            : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <Button
              text="Logout"
              onClick={() => {
                dispatch(signOut());
                toast.success("Logged out");
              }}
            />
          ) : (
            <>
              <Button text="Login" onClick={() => navigate("/login")} />
              <NavLink to="/register">Register</NavLink>
            </>
          )}

          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="md:hidden h-10 w-10 rounded-lg"
          >
            ☰
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden border-t bg-[#142727]/95 p-4"
          >
            <SearchBar placeholder="Search products..." />
            <NavLink to="/favorites" onClick={() => setMenuOpen(false)}>
              Favorites
            </NavLink>
            <NavLink to="/cart" onClick={() => setMenuOpen(false)}>
              Cart
            </NavLink>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
