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
  FiTag,
} from "react-icons/fi";
import PageHeader from "../../admin/PageHeader";
import { useProductsSorted } from "../../hooks/useProductsSorted"; // renamed hook
import { useDeleteProduct } from "../../hooks/useProductMutations"; // renamed hook
import { usePagination } from "../../hooks/usePagination";
import { useCategoriesSorted } from "../../hooks/useCategoriesSorted";
import Pager from "../../admin/Pager";
import ConfirmDialog from "../../admin/ConfirmDialog";
import { useTranslation } from "react-i18next";
import { localizeProduct, localizeCategory } from "../../utils/localizeContent"; // renamed util

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
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // URL-derived state
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

  // data
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

  // categories → localized name map
  const { data: categories = [] } = useCategoriesSorted({ dir: "asc" });
  const { t: tCat } = useTranslation();
  const catMap = useMemo(() => {
    const m = {};
    for (const c of categories) m[c.id] = localizeCategory(c, tCat);
    return m;
  }, [categories, tCat]);

  // pagination (resilient): reset when filters/search/sort/pageSize change
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
      // sync ?page= in URL without touching other params
      const next = new URLSearchParams(params.toString());
      next.set("page", String(p));
      setParams(next, { replace: true });
    },
  });

  // keep URL (except page) in sync when UI state changes
  useEffect(() => {
    const next = new URLSearchParams(params.toString());
    next.set("filter", status);
    q ? next.set("q", q) : next.delete("q");
    next.set("sortBy", sortBy);
    next.set("dir", dir);
    next.set("pageSize", String(pageSize));
    // do NOT touch page here; page syncing handled by onPageChange above
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center">
          <ResponsiveStatusFilter value={status} onChange={setStatus} />

          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search.product_placeholder", {
                defaultValue: "Search products…",
              })}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-9 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#2B7A0B] focus:outline-none focus:ring-2 focus:ring-[#2B7A0B]/20"
            />
          </div>
        </div>

        {/* Sort / dir / page size */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm shadow-sm focus:border-[#203232] focus:outline-none focus:ring-2 focus:ring-[#2B7A0B]/20"
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
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50"
            title={`Direction: ${dir.toUpperCase()}`}
          >
            {dir === "asc" ? <FiArrowUp /> : <FiArrowDown />}
          </button>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm shadow-sm focus:border-[#2B7A0B] focus:outline-none focus:ring-2 focus:ring-[#2B7A0B]/20"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data states */}
      {isLoading && <SkeletonTable rows={6} />}
      {isError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {t("errors.products_load_failed", {
            defaultValue: "Failed to load products",
          })}
          : {String(error?.message || "Unknown error")}
        </div>
      )}
      {!isLoading && !isError && all.length === 0 && (
        <EmptyState
          title={t("empty.products_title", { defaultValue: "No products yet" })}
          note={
            q
              ? t("empty.try_clear")
              : t("empty.create_first_product", {
                  defaultValue: "Create your first product",
                })
          }
        />
      )}

      {/* ===== Mobile list (cards) ===== */}
      {!isLoading && !isError && all.length > 0 && (
        <div className="space-y-3 md:hidden">
          {paginatedData.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {p.thumbnailUrl ? (
                  <img
                    src={p.thumbnailUrl}
                    alt=""
                    className="h-12 w-12 flex-none rounded-lg object-cover ring-1 ring-black/5"
                  />
                ) : (
                  <div className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-gray-100 text-xs text-gray-500">
                    N/A
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {localizeProduct(p, t).name}
                  </div>
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {localizeProduct(p, t).name}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200">
                      {catMap[p.categoryId] || "—"}
                    </span>
                    <StatusBadge available={!!p.isAvailable} small />
                    <span className="text-[11px] text-gray-500">
                      {formatDate(p.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  {Number(p.price || 0).toLocaleString()}{" "}
                  <span className="text-gray-500">{p.currency || "USD"}</span>
                </span>

                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                    className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    disabled={deleting}
                    onClick={() => setToDelete({ id: p.id, name: p.name })}
                    className="rounded-md border border-gray-200 bg-white p-2 text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-50"
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

      {/* ===== Desktop table ===== */}
      {!isLoading && !isError && all.length > 0 && (
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 text-left text-sm text-gray-600">
                  <Th>{t("admin.products", { defaultValue: "Products" })}</Th>
                  <Th>{t("sort.price", { defaultValue: "Price" })}</Th>
                  <Th>
                    {t("admin.categories", { defaultValue: "Categories" })}
                  </Th>
                  <Th>
                    {t("admin.status.available", { defaultValue: "Available" })}
                    /
                    {t("admin.status.unavailable", {
                      defaultValue: "Out of stock",
                    })}
                  </Th>
                  <Th className="w-36">
                    {t("sort.createdAt", { defaultValue: "Created At" })}
                  </Th>
                  <Th className="w-28 text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((p) => (
                  <tr key={p.id} className="group">
                    <Td>
                      <div className="flex items-center gap-3">
                        {p.thumbnailUrl ? (
                          <img
                            src={p.thumbnailUrl}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover ring-1 ring-black/5"
                          />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100 text-xs text-gray-500">
                            N/A
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {localizeProduct(p, t).title}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="font-semibold text-gray-900">
                        {Number(p.price || 0).toLocaleString()}{" "}
                        <span className="text-gray-500">
                          {p.currency || "USD"}
                        </span>
                      </span>
                    </Td>
                    <Td>
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 ring-1 ring-gray-200">
                        {catMap[p.categoryId] || "—"}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge available={!!p.isAvailable} />
                    </Td>
                    <Td>{formatDate(p.createdAt)}</Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/products/${p.id}/edit`)
                          }
                          className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          disabled={deleting}
                          onClick={() =>
                            setToDelete({ id: p.id, name: p.name })
                          }
                          className="rounded-md border border-gray-200 bg-white p-2 text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-50"
                          title="Delete"
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

      {/* Delete confirm */}
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
      {/* Mobile: select */}
      <label className="md:hidden">
        <span className="sr-only">Status</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm shadow-sm focus:border-[#203232] focus:outline-none focus:ring-2 focus:ring-[#2B7A0B]/20"
        >
          {items.map((it) => (
            <option key={it.value} value={it.value}>
              {it.label}
            </option>
          ))}
        </select>
      </label>

      {/* md+: horizontally scrollable pill group */}
      <div className="hidden md:block">
        <div className="max-w-full overflow-x-auto">
          <div className="inline-flex min-w-max overflow-hidden rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
            {items.map((it) => {
              const active = value === it.value;
              return (
                <button
                  key={it.value}
                  onClick={() => onChange(it.value)}
                  className={[
                    "whitespace-nowrap px-3 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-[#2B7A0B]/10 text-[#203232] ring-1 ring-[#2B7A0B]/30"
                      : "text-gray-700 hover:bg-[#2B7A0B]/5",
                  ].join(" ")}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`sticky top-0 border-b border-gray-200 px-3 py-2 first:rounded-tl-xl last:rounded-tr-xl ${className}`}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td
      className={`border-b border-gray-100 px-3 py-3 align-middle ${className}`}
    >
      {children}
    </td>
  );
}

function StatusBadge({ available, small = false }) {
  const { t } = useTranslation();
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 text-xs font-medium";
  if (available) {
    return (
      <span
        className={`${base} ${
          small ? "px-1.5 py-0 text-[11px]" : ""
        } bg-emerald-50 text-emerald-700 ring-emerald-200`}
      >
        • {t("admin.status.available", { defaultValue: "Available" })}
      </span>
    );
  }
  return (
    <span
      className={`${base} ${
        small ? "px-1.5 py-0 text-[11px]" : ""
      } bg-amber-50 text-amber-700 ring-amber-200`}
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
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <div className="h-10 w-10 rounded-lg bg-gray-100" />
          <div className="h-4 w-40 rounded bg-gray-100" />
          <div className="h-4 w-20 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
function EmptyState({ title, note }) {
  return (
    <div className="grid place-items-center rounded-lg border border-gray-200 bg-gray-50/60 p-8 text-center">
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      {note && <div className="mt-1 text-sm text-gray-600">{note}</div>}
    </div>
  );
}
