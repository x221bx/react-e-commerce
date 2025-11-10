import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiPackage,
  FiPlusCircle,
  FiTag,
  FiActivity,
} from "react-icons/fi";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  "relative group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66BB6A]/40";
const linkActive = "bg-[#66BB6A]/10 text-[#2E7D32] ring-1 ring-[#66BB6A]/30";
const linkIdle = "text-gray-700 hover:bg-[#66BB6A]/5";

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
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-[#2E7D32] font-extrabold text-white shadow-sm">
          <FiActivity className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">
              Admin Dashboard
            </div>
            <div className="truncate text-[11px] text-gray-500">
              Vet Clinic Panel
            </div>
          </div>
        )}
      </div>

      {/* Nav Links */}
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

      {/* Footer */}
      <div className="mt-auto border-t border-[#C8E6C9] px-3 py-3 text-xs text-gray-500 text-center">
        {!collapsed ? (
          <div>Version 1.0.0</div>
        ) : (
          <div className="text-center text-gray-400">⋯</div>
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
            ? "pl-3 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[#2E7D32] " +
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
