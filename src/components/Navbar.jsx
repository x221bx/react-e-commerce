import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiMenu, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { signOut } from "../features/auth/authSlice";
import { selectCurrentUser } from "../features/auth/authSlice";
import LanguageSwitcher from "./LanguageSwitcher";
import footerLogo from "/src/assets/footerLogo.svg";

export default function Navbar() {
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await dispatch(signOut());
    closeMenu();
    navigate("/", { replace: true });
  };

  const mainLinks = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.courses"), path: "/courses" },
    { label: t("nav.careers"), path: "/careers" },
    { label: t("nav.blog"), path: "/blog" },
    { label: t("nav.about"), path: "/about" },
    ...(user?.isAdmin ? [{ label: t("nav.admin"), path: "/admin" }] : []),
  ];

  const navLinkClass = ({ isActive }) =>
    `group relative inline-block px-1 py-0.5 text-[15px] font-medium transition ${
      isActive
        ? "text-white after:scale-x-100"
        : "text-white/85 after:scale-x-0 hover:text-white"
    } after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:bg-white after:transition-transform after:duration-300`;

  const initials = (
    user?.name?.trim()?.charAt(0) ||
    user?.email?.trim()?.charAt(0) ||
    "U"
  ).toUpperCase();

  return (
    <header className="fixed top-0 left-0 z-50 h-20 w-full bg-[#49bbbd] px-4 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-3 py-4 md:py-2">
        {/* Logo */}
        <NavLink to="/" className="flex items-center space-x-3">
          <img
            src={footerLogo}
            alt="TOTC Logo"
            className="h-20 w-20 object-contain brightness-0 invert"
          />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden items-center space-x-6 md:flex">
          {mainLinks.map(({ label, path }) => (
            <NavLink key={path} to={path} className={navLinkClass}>
              {label}
            </NavLink>
          ))}

          <LanguageSwitcher />

          {!user ? (
            <>
              <NavLink
                to="/login"
                className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md hover:opacity-90"
              >
                {t("auth.login")}
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md hover:opacity-90"
              >
                {t("auth.register")}
              </NavLink>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/25 text-sm font-bold">
                  {initials}
                </div>
                <span className="hidden text-sm text-white/90 lg:inline">
                  {user.name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold hover:text-white/90"
              >
                {t("auth.logout")}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMenu}
          className="text-2xl text-white focus:outline-none md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="flex flex-col gap-3 bg-[#49BBBD] px-5 py-6 text-white md:hidden">
          {mainLinks.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={closeMenu}
              className="block text-base hover:text-white/90"
            >
              {label}
            </NavLink>
          ))}

          <LanguageSwitcher />

          {!user ? (
            <>
              <NavLink
                to="/login"
                onClick={closeMenu}
                className="text-base hover:text-white/90"
              >
                {t("auth.login")}
              </NavLink>
              <NavLink
                to="/register"
                onClick={closeMenu}
                className="text-base hover:text-white/90"
              >
                {t("auth.register")}
              </NavLink>
            </>
          ) : (
            <>
              <span className="text-sm">{user.email}</span>

              {user.isAdmin && (
                <NavLink
                  to="/dashboard"
                  onClick={closeMenu}
                  className="text-base hover:text-white/90"
                >
                  Dashboard
                </NavLink>
              )}

              <button
                onClick={handleLogout}
                className="text-left text-base hover:text-white/90"
              >
                {t("auth.logout")}
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
