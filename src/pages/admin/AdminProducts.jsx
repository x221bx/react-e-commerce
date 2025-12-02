// src/pages/admin/AdminProducts.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiEdit2,
  FiTrash2,
  FiPackage,
} from "react-icons/fi";
import PageHeader from "../../admin/PageHeader";
import { useProductsSorted } from "../../hooks/useProductsSorted";
import { useDeleteProduct } from "../../hooks/useProductMutations";
import { usePagination } from "../../hooks/usePagination";
import { useCategoriesSorted } from "../../hooks/useCategoriesSorted";
import Pager from "../../admin/Pager";
import ConfirmDialog from "../../admin/ConfirmDialog";
import { useTranslation } from "react-i18next";
import { localizeProduct, localizeCategory } from "../../utils/localizeContent";
import { UseTheme } from "../../theme/ThemeProvider";

/* ------------------------ constants ------------------------ */
const SORT_FIELDS = [
  { value: "createdAt", label: "Created At" },
  { value: "price", label: "Price" },
  { value: "name", label: "Alphabetical" },
];
const VALID_STATUS = new Set(["all", "available", "unavailable"]);

/* ------------------------- component ------------------------ */
export default function AdminProducts() {
  const { t } = useTranslation();
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const statusFromUrl = (params.get("filter") || "all").toLowerCase();
  const [status, setStatus] = useState(
    VALID_STATUS.has(statusFromUrl) ? statusFromUrl : "all"
  );
  const [q, setQ] = useState(params.get("q") || "");
  const [sortBy, setSortBy] = useState(params.get("sortBy") || "createdAt");
  const [dir, setDir] = useState(params.get("dir") || "desc");
  const [pageSize, setPageSize] = useState(
    Number(params.get("pageSize") || 10)
  );
  const pageFromUrl = Math.max(1, Number(params.get("page") || 1));

  const {
    data: all = [],
    isLoading,
    isError,
    error,
  } = useProductsSorted({
    sortBy,
    dir,
    qText: q,
    status,
  });

  const { data: categories = [] } = useCategoriesSorted({ dir: "asc" });
  const catMap = useMemo(() => {
    const m = {};
    for (const c of categories) m[c.id] = localizeCategory(c, t);
    return m;
  }, [categories, t]);

  const surfaceClass = isDark
    ? "border border-slate-800 bg-slate-900 text-slate-100"
    : "border border-slate-200 bg-white text-slate-900";
  const mutedSurfaceClass = isDark
    ? "border border-slate-700 bg-slate-800/70 text-slate-100"
    : "border border-slate-200 bg-slate-50 text-slate-800";
  const inputSurfaceClass = isDark
    ? "border border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-400"
    : "border border-slate-200 bg-white text-slate-900 placeholder:text-gray-500";
  const cellTone = isDark ? "text-slate-100" : "text-gray-900";
  const mutedTone = isDark ? "text-slate-300" : "text-gray-600";
  const titleTone = isDark ? "text-slate-50" : "text-gray-900";
  const actionBtnClass = isDark
    ? "rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-100 shadow-sm transition hover:bg-slate-800"
    : "rounded-md border border-gray-300 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50";
  const actionDeleteClass = isDark
    ? "rounded-md border border-rose-800 bg-slate-900 p-2 text-rose-300 shadow-sm transition hover:bg-rose-950/40 disabled:opacity-50"
    : "rounded-md border border-rose-200 bg-white p-2 text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-50";

  const {
    paginatedData,
    currentPage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    rangeStart,
    rangeEnd,
    totalItems,
  } = usePagination(all, pageSize, {
    initialPage: pageFromUrl,
    resetKeys: [status, q, sortBy, dir, pageSize],
    onPageChange: (p) => {
      const next = new URLSearchParams(params.toString());
      next.set("page", String(p));
      setParams(next, { replace: true });
    },
  });

  useEffect(() => {
    const next = new URLSearchParams(params.toString());
    next.set("filter", status);
    q ? next.set("q", q) : next.delete("q");
    next.set("sortBy", sortBy);
    next.set("dir", dir);
    next.set("pageSize", String(pageSize));
    setParams(next, { replace: true });
  }, [status, q, sortBy, dir, pageSize]);

  const { mutateAsync: deleteProduct, isPending: deleting } =
    useDeleteProduct();
  const [toDelete, setToDelete] = useState(null);

  const actions = (
    <NavLink
      to="/admin/products/new"
      className="inline-flex items-center gap-2 rounded-lg bg-[#2B7A0B] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#205F09]"
    >
      <FiPlus /> {t("admin.new_product", { defaultValue: "New product" })}
    </NavLink>
  );

  return (
    <>
      <PageHeader
        title={t("admin.products", { defaultValue: "Products" })}
        actions={actions}
        icon={<FiPackage />}
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center">
          <ResponsiveStatusFilter value={status} onChange={setStatus} />

          <div className="relative w-full md:max-w-md">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search.product_placeholder", {
                defaultValue: "Search products…",
              })}
              className={`w-full rounded-lg py-2.5 pr-3 pl-9 text-sm shadow-sm focus:border-[#2B7A0B] focus:outline-none focus:ring-2 focus:ring-[#2B7A0B]/20 ${inputSurfaceClass}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`rounded-lg px-2.5 py-2 text-sm shadow-sm focus:border-[#203232] focus:outline-none focus:ring-2 focus:ring-[#2B7A0B]/20 ${inputSurfaceClass}`}
          >
            {SORT_FIELDS.map((s) => (
              <option key={s.value} value={s.value}>
                {t(`sort.${s.value}`, s.label)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
            className={`inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm shadow-sm transition ${mutedSurfaceClass} ${
              isDark ? "hover:bg-slate-800" : "hover:bg-white"
            }`}
            title={`Direction: ${dir.toUpperCase()}`}
          >
            {dir === "asc" ? <FiArrowUp /> : <FiArrowDown />}
          </button>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className={`rounded-lg px-2.5 py-2 text-sm shadow-sm focus:border-[#2B7A0B] focus:outline-none focus:ring-2 focus:ring-[#2B7A0B]/20 ${inputSurfaceClass}`}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading / Error / Empty */}
      {isLoading && <SkeletonTable rows={6} />}

      {isError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {t("errors.products_load_failed", {
            defaultValue: "Failed to load products",
          })}{" "}
          : {String(error?.message || "Unknown error")}
        </div>
      )}

      {!isLoading && !isError && all.length === 0 && (
        <EmptyState
          title={t("empty.products_title", {
            defaultValue: "No products yet",
          })}
          note={
            q
              ? t("empty.try_clear")
              : t("empty.create_first_product", {
                  defaultValue: "Create your first product",
                })
          }
        />
      )}

      {/* Mobile Cards */}
      {!isLoading && !isError && all.length > 0 && (
        <div className="space-y-3 md:hidden">
          {paginatedData.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                {p.thumbnailUrl ? (
                  <img
                    src={p.thumbnailUrl}
                    alt=""
                    className="h-12 w-12 flex-none rounded-lg object-cover ring-1 ring-black/5"
                  />
                ) : (
                  <div className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-gray-100 text-xs text-gray-500 dark:bg-slate-800 dark:text-slate-300">
                    N/A
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-semibold ${titleTone}`}>
                    {localizeProduct(p, t).title}
                  </div>
                  <div className={`mt-1 text-xs ${mutedTone}`}>
                    Stock: {p.stock ?? 0}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                      {catMap[p.categoryId] || "—"}
                    </span>
                    <StatusBadge available={!!p.isAvailable} small />
                  </div>
                  <div className={`mt-1 text-xs ${mutedTone}`}>
                    {formatDate(p.createdAt)}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className={`text-sm font-semibold ${titleTone}`}>
                  {Number(p.price || 0).toLocaleString()}{" "}
                  <span className={mutedTone}>{p.currency || "USD"}</span>
                </span>
                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                    className={actionBtnClass}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    disabled={deleting}
                    onClick={() => setToDelete({ id: p.id, name: p.name })}
                    className={actionDeleteClass}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && !isError && all.length > 0 && (
        <div className="hidden md:block">
          <div
            className={`overflow-x-auto rounded-xl shadow-sm ${surfaceClass}`}
          >
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr
                  className={`text-left text-sm ${
                    isDark
                      ? "bg-slate-800 text-slate-200"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Th>{t("admin.products", { defaultValue: "Products" })}</Th>
                  <Th>{t("sort.price", { defaultValue: "Price" })}</Th>
                  <Th>Stock</Th>
                  <Th>
                    {t("admin.categories", {
                      defaultValue: "Categories",
                    })}
                  </Th>
                  <Th>
                    {t("admin.status.available", {
                      defaultValue: "Available",
                    })}
                  </Th>
                  <Th className="w-36">
                    {t("sort.createdAt", {
                      defaultValue: "Created At",
                    })}
                  </Th>
                  <Th className="w-28 text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className={isDark ? "text-slate-100" : "text-gray-900"}>
                {paginatedData.map((p) => (
                  <tr
                    key={p.id}
                    className={`group transition-colors ${
                      isDark
                        ? "odd:bg-slate-900/40 even:bg-slate-900/50 hover:bg-slate-800"
                        : "odd:bg-white even:bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <Td>
                      <div className="flex items-centered gap-3">
                        {p.thumbnailUrl ? (
                          <img
                            src={p.thumbnailUrl}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover ring-1 ring-black/5"
                          />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100 text-xs text-gray-500 dark:bg-slate-800 dark:text-slate-300">
                            N/A
                          </div>
                        )}
                        <div className={`font-medium ${titleTone}`}>
                          {localizeProduct(p, t).title}
                        </div>
                      </div>
                    </Td>
                    <Td className={cellTone}>
                      {Number(p.price || 0).toLocaleString()}{" "}
                      {p.currency || "USD"}
                    </Td>
                    <Td className={cellTone}>{p.stock ?? 0}</Td>
                    <Td className={mutedTone}>
                      {catMap[p.categoryId] || "—"}
                    </Td>
                    <Td>
                      <StatusBadge available={!!p.isAvailable} />
                    </Td>
                  <Td className={mutedTone}>{formatDate(p.createdAt)}</Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/products/${p.id}/edit`)
                        }
                        className={actionBtnClass}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        disabled={deleting}
                        onClick={() =>
                          setToDelete({ id: p.id, name: p.name })
                        }
                        className={actionDeleteClass}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pager
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={prevPage}
            onNext={nextPage}
            onGo={setPage}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            totalItems={totalItems}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!toDelete}
        title={t("confirm.delete_product_title", {
          defaultValue: "Delete product?",
        })}
        message={
          toDelete
            ? t("confirm.delete_product_body", {
                defaultValue:
                  "“{{name}}” will be permanently deleted. This action cannot be undone.",
                name: toDelete.name,
              })
            : ""
        }
        confirmText={t("common.delete", { defaultValue: "Delete" })}
        confirmTone="danger"
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteProduct(toDelete.id);
          setToDelete(null);
        }}
      />
    </>
  );
}

/* ------------------- small components & helpers ------------------- */
function ResponsiveStatusFilter({ value, onChange }) {
  const { t } = useTranslation();
  const items = [
    { value: "all", label: t("filter.all", { defaultValue: "All" }) },
    {
      value: "available",
      label: t("admin.status.available", { defaultValue: "Available" }),
    },
    {
      value: "unavailable",
      label: t("admin.status.unavailable", { defaultValue: "Out of stock" }),
    },
  ];

  return (
    <>
      {/* Mobile Dropdown */}
      <label className="md:hidden w-full">
        <span className="sr-only">Status</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm shadow-sm 
          focus:border-[#203232] focus:outline-none focus:ring-2 focus:ring-[#2B7A0B]/20"
        >
          {items.map((it) => (
            <option key={it.value} value={it.value}>
              {it.label}
            </option>
          ))}
        </select>
      </label>

      {/* Desktop Filter Buttons */}
      <div className="hidden md:block">
        <div className="inline-flex min-w-max overflow-hidden rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
          {items.map((it) => {
            const active = value === it.value;
            return (
              <button
                key={it.value}
                onClick={() => onChange(it.value)}
                className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#2B7A0B]/10 text-[#203232] ring-1 ring-[#2B7A0B]/30"
                    : "text-gray-700 hover:bg-[#2B7A0B]/5"
                }`}
              >
                {it.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`sticky top-0 border-b border-gray-200 px-3 py-2 first:rounded-tl-xl last:rounded-tr-xl dark:border-slate-700 ${className}`}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td
      className={`border-b border-gray-100 px-3 py-3 align-middle dark:border-slate-800 ${className}`}
    >
      {children}
    </td>
  );
}

function StatusBadge({ available, small = false }) {
  const { t } = useTranslation();
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 text-xs font-medium";
  if (available)
    return (
      <span
        className={`${base} ${
          small ? "px-1.5 py-0 text-[11px]" : ""
        } bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/40`}
      >
        • {t("admin.status.available", { defaultValue: "Available" })}
      </span>
    );
  return (
    <span
      className={`${base} ${
        small ? "px-1.5 py-0 text-[11px]" : ""
      } bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/40`}
    >
      • {t("admin.status.unavailable", { defaultValue: "Out of stock" })}
    </span>
  );
}

function formatDate(ts) {
  if (!ts) return "—";
  const ms = ts?.toMillis
    ? ts.toMillis()
    : ts?.seconds
    ? ts.seconds * 1000
    : +new Date(ts);
  return new Date(ms).toLocaleDateString();
}

function SkeletonTable({ rows = 6 }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white py-4 dark:bg-slate-900">
          <div className="h-4 rounded bg-gray-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, note }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <div className="font-semibold text-gray-900 dark:text-slate-50">
        {title}
      </div>
      <div className="mt-1 text-sm">{note}</div>
    </div>
  );
}
