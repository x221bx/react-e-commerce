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

  // ✅ حفظ حالة الـ Sidebar (مفتوح/مغلق)
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  // ✅ إغلاق الـ Drawer بالموبايل لما تضغط Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ✅ منع سكرول الصفحة لما الـ Drawer مفتوح
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  return (
    <div className="h-[calc(100svh-var(--nav-h))] bg-[#F8FAFB] font-inter">
      <div className="flex h-full min-h-0 isolate">
        {/* 🌿 Sidebar (Desktop) */}
        <aside
          className={[
            "relative hidden z-20 border-r border-[#CFE8D3] bg-[#E9F9EF] shadow-md",
            "transition-[width] duration-300 ease-in-out",
            "motion-reduce:transition-none motion-reduce:duration-0",
            "lg:block",
            collapsed ? "w-[72px]" : "w-[260px]",
          ].join(" ")}
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-end px-2 py-2">
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="hidden rounded-md border border-[#CFE8D3] bg-white p-2 text-[#2B7A0B] shadow-sm hover:bg-[#F2FBF5] lg:inline-flex"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
              </button>
            </div>

            {/* محتوى الـ Sidebar */}
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-visible">
              <AdminSidebar collapsed={collapsed} onNavigate={() => {}} />
            </div>
          </div>
        </aside>

        {/* 🌿 محتوى الصفحة الرئيسي */}
        <section className="min-w-0 flex-1 min-h-0 overflow-hidden">
          {/* Header ثابت */}
          <div className="sticky top-0 z-10 border-b border-[#CFE8D3] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
              {/* زر القائمة للموبايل */}
              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center rounded-md border border-[#CFE8D3] bg-white p-2 text-[#2B7A0B] shadow-sm transition hover:bg-[#F2FBF5] lg:hidden"
                aria-label="Open sidebar"
                ref={firstFocusableRef}
              >
                <FiMenu />
              </button>

              {/* عنوان لوحة التحكم */}
              <h1 className="text-lg font-semibold text-[#2B7A0B] tracking-wide">
                🐾 Vet Clinic Admin Panel
              </h1>

              <div className="flex-1" />
            </div>
          </div>

          {/* المحتوى الداخلي (Dashboard - Products - ... ) */}
          <div className="mx-auto h-full max-w-7xl overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E1F2E7] p-6">
              {/* ✅ هنا الـ Outlet (محتوى الصفحات الفرعية) */}
              <Suspense fallback={<p>Loading page...</p>}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </section>
      </div>

      {/* 🌿 Drawer للموبايل */}
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
      {/* Overlay */}
      <button
        onClick={onClose}
        aria-label="Close sidebar"
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 translate-x-0 bg-[#F6FBF8] shadow-xl ring-1 ring-[#CFE8D3]/50",
          "transition-transform duration-300 will-change-transform rounded-r-2xl overflow-hidden",
          "motion-reduce:transition-none motion-reduce:duration-0",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[#CFE8D3] bg-[#E9F9EF] px-3 py-3">
          <span className="text-sm font-semibold text-[#2B7A0B]">
            🩺 Vet Clinic
          </span>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-[#2B7A0B] hover:bg-[#F2FBF5]"
          >
            <FiX />
          </button>
        </div>
        <div className="h-[calc(100%-48px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
