import { useEffect, useRef, useState, Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiMenu, FiChevronLeft, FiChevronRight, FiX, FiLogOut } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "../features/auth/authSlice";
import toast from "react-hot-toast";
import AdminSidebar from "./AdminSidebar";
import { UseTheme } from "../theme/ThemeProvider";

const LS_KEY = "admin.sidebar.collapsed";

export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(LS_KEY) === "1";
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const firstFocusableRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, collapsed ? "1" : "0");
    } catch (error) {
      console.error("Failed to save sidebar state:", error);
    }
  }, [collapsed]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    dispatch(signOut());
    toast.success(t("admin.logout_success", "Logged out successfully"));

    // Clear complaints counter on logout
    window.dispatchEvent(new CustomEvent('userLogout'));

    navigate("/");
  };

  return (
    <div
      className={`h-[calc(100svh-var(--nav-h))] font-inter ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-[#F9FAF9] text-slate-900"
      }`}
    >
      <div className="flex h-full min-h-0 isolate">
        {/* Sidebar (Desktop) */}
        <aside
          className={[
            "relative hidden z-20 border-r shadow-md",
            "transition-[width] duration-300 ease-in-out",
            "motion-reduce:transition-none motion-reduce:duration-0",
            "lg:block",
            collapsed ? "w-[72px]" : "w-[260px]",
            isDark ? "border-slate-800 bg-slate-900" : "border-[#C8E6C9] bg-[#E8F5E9]",
          ].join(" ")}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-end px-2 py-2">
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="hidden lg:inline-flex rounded-md border border-muted bg-panel p-2 text-[var(--text-main)] shadow-sm hover:bg-surface"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <FiChevronRight className="icon-primary" /> : <FiChevronLeft className="icon-primary" />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AdminSidebar collapsed={collapsed} onNavigate={() => {}} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 overflow-hidden">
          <div
            className={`sticky top-0 z-10 border-b backdrop-blur shadow-sm ${
              isDark ? "border-slate-800 bg-slate-900/90" : "border-[#C8E6C9] bg-white/90"
            }`}
          >
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center rounded-md border border-muted bg-panel p-2 text-[var(--text-main)] shadow-sm transition hover:bg-surface lg:hidden"
                aria-label="Open sidebar"
                ref={firstFocusableRef}
              >
                <FiMenu className="icon-primary" />
              </button>

              <h1 className="text-lg font-semibold text-[#2E7D32] dark:text-[#4ade80] tracking-wide">
                Vet Clinic Admin Panel
              </h1>
              <div className="flex-1" />
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                title={t("admin.logout", "Logout")}
              >
                <FiLogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t("admin.logout", "Logout")}</span>
              </button>
            </div>
          </div>

          <div className="mx-auto h-full max-w-7xl overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div
              className={`rounded-2xl shadow-sm border p-6 ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-[#E1F3E6] text-slate-900"
              }`}
            >
              <Suspense fallback={<p>Loading page...</p>}>
                <Outlet />
              </Suspense>
            </div>

            {/* Footer */}
            <footer
              className={`mt-6 text-center text-sm pt-3 border-t ${
                isDark ? "text-slate-400 border-slate-800" : "text-gray-500 border-[#C8E6C9]"
              }`}
            >
              {t("admin.footer_note", { year: new Date().getFullYear() })}
            </footer>
          </div>
        </section>
      </div>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <AdminSidebar
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
        />
      </MobileDrawer>
    </div>
  );
}

function MobileDrawer({ open, onClose, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const focusable = panelRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="lg:hidden">
      <button
        onClick={onClose}
        aria-label="Close sidebar"
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-[#E8F5E9] shadow-xl rounded-r-2xl overflow-hidden ring-1 ring-[#C8E6C9]/50 transition-transform duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[#C8E6C9] bg-[#E8F5E9] dark:border-slate-700 dark:bg-slate-800 px-3 py-3">
          <span className="text-sm font-semibold text-[#2E7D32] dark:text-[#4ade80]">
            Vet Clinic
          </span>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-[#2E7D32] dark:text-[#4ade80] hover:bg-[#F1F8F3] dark:hover:bg-slate-700"
          >
            <FiX className="icon-primary" />
          </button>
        </div>
        <div className="h-[calc(100%-48px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}


