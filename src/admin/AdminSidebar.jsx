import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiPackage,
  FiPlusCircle,
  FiTag,
  FiAperture,
  FiMail,
  FiFileText,
  FiMessageSquare,
  FiShoppingCart,
} from "react-icons/fi";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MessageBadge from "../pages/admin/MessagesBadge";
import { FiSun, FiMoon } from "react-icons/fi";
import { UseTheme } from "../../src/theme/ThemeProvider";


function PortalTooltip({ open, label, x, y, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[9999] select-none rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg"
      style={{ left: x, top: y, transform: "translate(8px, -50%)" }}
    >
      {label}
    </div>,
    document.body
  );
}

const linkBase =
  "relative group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition focus-visible:outline-none";

export default function AdminSidebar({ onNavigate, collapsed = false }) {
  const [tip, setTip] = useState({ open: false, label: "", x: 0, y: 0 });

  const showTip = useCallback((label, rect) => {
    setTip({ open: true, label, x: rect.right, y: rect.top + rect.height / 2 });
  }, []);

  const hideTip = useCallback(() => setTip((t) => ({ ...t, open: false })), []);

  useEffect(() => {
    const onScroll = () => hideTip();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideTip]);

 const { theme, toggle } = UseTheme();
 const isDark = theme === "dark";

const links = useMemo(
  () => [
    { to: "/admin", end: true, label: "Dashboard", icon: <FiHome /> },
    { to: "/admin/products", label: "Products", icon: <FiPackage /> },
    { to: "/admin/products/new", label: "Add Product", icon: <FiPlusCircle /> },
    { to: "/admin/orders", end: true, label: "Orders", icon: <FiShoppingCart /> },
    { to: "/admin/messages", label: "Messages", icon: <FiMail />, badge: true },
    { to: "/admin/categories", label: "Categories", icon: <FiTag /> },
    { to: "/admin/articles", label: "Articles", icon: <FiFileText /> },
    { to: "/admin/complaints", label: "Complaints", icon: <FiMessageSquare /> },

    // 🌙 NEW TOGGLE BUTTON
    {
      to: null,
      label: theme === "dark" ? "Light Mode" : "Dark Mode",
      icon: theme === "dark" ? <FiSun /> : <FiMoon />,
      isThemeToggle: true,
    },
  ],
  [theme]
);


  return (
    <div className={`flex h-full flex-col ${isDark ? "text-slate-100" : "text-slate-900"}`}>
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-emerald-600 font-extrabold text-white">
          <FiAperture className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              Admin Dashboard
            </div>
            <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              AgriTech Panel
            </div>
          </div>
        )}
      </div>

      <nav className="mt-1 flex flex-col gap-1 px-2">
        {links.map((l) => (
          <SideLink
            key={l.to}
            {...l}
            collapsed={collapsed}
            onNavigate={onNavigate}
            onShowTip={showTip}
            onHideTip={hideTip}
          />
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-200 px-3 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {!collapsed ? (
          <div>
            Height: <code>calc(100svh - var(--nav-h))</code>
          </div>
        ) : (
          <div className="text-center">🙂</div>
        )}
      </div>

      <PortalTooltip
        open={tip.open && collapsed}
        label={tip.label}
        x={tip.x}
        y={tip.y}
        onClose={() => setTip({ ...tip, open: false })}
      />
    </div>
  );
}

function SideLink({
  to,
  end,
  onNavigate,
  collapsed,
  label,
  icon,
  badge,
  onShowTip,
  onHideTip,
  isThemeToggle = false,
}) {
  const ref = useRef(null);
  const { theme, toggle } = UseTheme();

  const handleEnter = () => {
    if (!collapsed || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    onShowTip(label, rect);
  };

  const handleLeave = () => {
    if (!collapsed) return;
    onHideTip();
  };

  const handleClick = (e) => {
    if (isThemeToggle) {
      e.preventDefault();
      toggle(); // 👈 تشغيل dark/light
      return;
    }

    onNavigate?.(e);
    onHideTip?.();
  };

  return (
    <NavLink
      to={to || "#"}
      end={end}
      onClick={handleClick}
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      className={({ isActive }) => {
        const activeClasses = theme === "dark"
          ? "bg-emerald-900/30 text-emerald-200 ring-1 ring-emerald-800"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
        const idleClasses = theme === "dark"
          ? "text-slate-300 hover:bg-slate-800/70"
          : "text-slate-700 hover:bg-slate-100";
        const toggleClasses = theme === "dark"
          ? "text-slate-200 hover:bg-slate-800/70"
          : "text-slate-700 hover:bg-slate-100";

        return [
          linkBase,
          isThemeToggle
            ? toggleClasses
            : isActive
            ? "pl-3 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-emerald-500 " +
              activeClasses
            : idleClasses,
          collapsed ? "justify-center pl-0" : "",
        ].join(" ");
      }}
      aria-label={collapsed ? label : undefined}
    >
      <span className="text-[18px]">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
