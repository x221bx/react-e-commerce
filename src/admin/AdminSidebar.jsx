import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiPackage,
  FiPlusCircle,
  FiTag,
<<<<<<< HEAD
  FiActivity,
=======
  FiAperture,
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
} from "react-icons/fi";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

<<<<<<< HEAD
=======
/** Tooltip يظهر فوق العناصر لما الـ Sidebar تكون Collapsed */
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
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
<<<<<<< HEAD
      className="pointer-events-none fixed z-[9999] select-none rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg"
      style={{ left: x, top: y, transform: "translate(8px, -50%)" }}
=======
      className={[
        "pointer-events-none fixed z-[9999] select-none",
        "rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg",
        "opacity-100 transition motion-reduce:transition-none",
      ].join(" ")}
      style={{
        left: x,
        top: y,
        transform: "translate(8px, -50%)",
      }}
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
    >
      {label}
    </div>,
    document.body
  );
}

<<<<<<< HEAD
const linkBase =
  "relative group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66BB6A]/40";
const linkActive = "bg-[#66BB6A]/10 text-[#2E7D32] ring-1 ring-[#66BB6A]/30";
const linkIdle = "text-gray-700 hover:bg-[#66BB6A]/5";
=======
/* ألوان الـ Links في الـ Sidebar */
const linkBase =
  "relative group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]/40";
const linkActive = "bg-[#49BBBD]/10 text-[#2F7E80] ring-1 ring-[#49BBBD]/30";
const linkIdle = "text-gray-700 hover:bg-[#49BBBD]/5";
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)

export default function AdminSidebar({ onNavigate, collapsed = false }) {
  const [tip, setTip] = useState({ open: false, label: "", x: 0, y: 0 });

  const showTip = useCallback((label, rect) => {
<<<<<<< HEAD
    setTip({ open: true, label, x: rect.right, y: rect.top + rect.height / 2 });
=======
    setTip({
      open: true,
      label,
      x: rect.right,
      y: rect.top + rect.height / 2,
    });
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
  }, []);

  const hideTip = useCallback(() => setTip((t) => ({ ...t, open: false })), []);

  useEffect(() => {
    const onScroll = () => hideTip();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideTip]);

  const links = useMemo(
    () => [
      { to: "/admin", end: true, label: "Dashboard", icon: <FiHome /> },
      { to: "/admin/products", label: "Products", icon: <FiPackage /> },
      {
        to: "/admin/products/new",
        label: "Add Product",
        icon: <FiPlusCircle />,
      },
      { to: "/admin/categories", label: "Categories", icon: <FiTag /> },
    ],
    []
  );

  return (
    <div className="flex h-full flex-col">
<<<<<<< HEAD
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-[#2E7D32] font-extrabold text-white shadow-sm">
          <FiActivity className="text-white" />
=======
      {/* Logo / Title */}
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-[#42604b] font-extrabold text-white">
          {<FiAperture className="text-[#ffffff]" />}
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">
              Admin Dashboard
            </div>
            <div className="truncate text-[11px] text-gray-500">
<<<<<<< HEAD
              Vet Clinic Panel
=======
              AgriTech Panel
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
            </div>
          </div>
        )}
      </div>

<<<<<<< HEAD
      {/* Nav Links */}
=======
      {/* Links */}
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
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

<<<<<<< HEAD
      {/* Footer */}
      <div className="mt-auto border-t border-[#C8E6C9] px-3 py-3 text-xs text-gray-500 text-center">
        {!collapsed ? (
          <div>Version 1.0.0</div>
        ) : (
          <div className="text-center text-gray-400">⋯</div>
=======
      {/* Footer Info */}
      <div className="mt-auto border-t border-gray-200 px-3 py-3 text-xs text-gray-500">
        {!collapsed ? (
          <div>
            Height: <code>calc(100svh - var(--nav-h))</code>
          </div>
        ) : (
          <div className="text-center">⋯</div>
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
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
  onShowTip,
  onHideTip,
}) {
  const ref = useRef(null);

  const handleEnter = () => {
    if (!collapsed || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    onShowTip(label, rect);
  };

  const handleLeave = () => {
    if (!collapsed) return;
    onHideTip();
  };

  return (
    <NavLink
      to={to}
      end={end}
      onClick={(e) => {
        onNavigate?.(e);
        onHideTip?.();
      }}
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      className={({ isActive }) =>
        [
          linkBase,
          isActive
<<<<<<< HEAD
            ? "pl-3 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[#2E7D32] " +
=======
            ? "pl-3 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[#018218] " +
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
              linkActive
            : linkIdle,
          collapsed ? "justify-center pl-0" : "",
        ].join(" ")
      }
      aria-label={collapsed ? label : undefined}
    >
      <span className="text-[18px]">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
