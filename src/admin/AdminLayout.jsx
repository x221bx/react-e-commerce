import { useEffect, useRef, useState, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { FiMenu, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import AdminSidebar from "./AdminSidebar";

const LS_KEY = "admin.sidebar.collapsed";

export default function AdminLayout() {
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

  return (
    <div className="h-[calc(100svh-var(--nav-h))] bg-[#F9FAF9] font-inter">
      <div className="flex h-full min-h-0 isolate">
        {/* Sidebar (Desktop) */}
        <aside
          className={[
            "relative hidden z-20 border-r border-[#C8E6C9] bg-[#E8F5E9] shadow-md",
            "transition-[width] duration-300 ease-in-out",
            "motion-reduce:transition-none motion-reduce:duration-0",
            "lg:block",
            collapsed ? "w-[72px]" : "w-[260px]",
          ].join(" ")}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-end px-2 py-2">
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="hidden rounded-md border border-[#C8E6C9] bg-white p-2 text-[#2E7D32] shadow-sm hover:bg-[#F1F8F3] lg:inline-flex"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AdminSidebar collapsed={collapsed} onNavigate={() => {}} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 overflow-hidden">
          <div className="sticky top-0 z-10 border-b border-[#C8E6C9] bg-white/90 backdrop-blur shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center rounded-md border border-[#C8E6C9] bg-white p-2 text-[#2E7D32] shadow-sm transition hover:bg-[#F1F8F3] lg:hidden"
                aria-label="Open sidebar"
                ref={firstFocusableRef}
              >
                <FiMenu />
              </button>

              <h1 className="text-lg font-semibold text-[#2E7D32] tracking-wide">
                Vet Clinic Admin Panel
              </h1>
              <div className="flex-1" />
            </div>
          </div>

          <div className="mx-auto h-full max-w-7xl overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E1F3E6] p-6">
              <Suspense fallback={<p>Loading page...</p>}>
                <Outlet />
              </Suspense>
            </div>

            {/* Footer */}
            <footer className="mt-6 text-center text-sm text-gray-500 border-t border-[#C8E6C9] pt-3">
              © {new Date().getFullYear()} Vet Clinic Dashboard — Crafted with
              care 🌿
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
        <div className="flex items-center justify-between border-b border-[#C8E6C9] bg-[#E8F5E9] px-3 py-3">
          <span className="text-sm font-semibold text-[#2E7D32]">
            Vet Clinic
          </span>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-[#2E7D32] hover:bg-[#F1F8F3]"
          >
            <FiX />
          </button>
        </div>
        <div className="h-[calc(100%-48px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
