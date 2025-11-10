import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import PageHeader from "../../components/admin/PageHeader";
import { useCoursesSorted } from "../../hooks/useCoursesSorted";
import { useDeleteCourse } from "../../hooks/useCoursesMutations";
import { usePagination } from "../../hooks/usePagination";
import { useCategoriesSorted } from "../../hooks/useCategoriesSorted";
import Pager from "../../components/Pager";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useTranslation } from "react-i18next";
import { localizeCourse, localizeCategory } from "../../utils/localizeContent";

/* ------------------------ constants ------------------------ */
const SORT_FIELDS = [
  { value: "createdAt", label: "Created At" },
  { value: "price", label: "Price" },
  { value: "title", label: "Alphabetical" },
];
const VALID_STATUS = new Set(["all", "published", "drafts"]);

/* ------------------------- component ------------------------ */
export default function AdminCourses() {
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
  const [pageSize, setPageSize] = useState(Number(params.get("pageSize") || 10));
  const pageFromUrl = Math.max(1, Number(params.get("page") || 1));

  // data
  const {
    data: all = [],
    isLoading,
    isError,
    error,
  } = useCoursesSorted({
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

  const { mutateAsync: deleteCourse, isPending: deleting } = useDeleteCourse();
  const [toDelete, setToDelete] = useState(null);

  const actions = (
    <NavLink
      to="/admin/courses/new"
      className="inline-flex items-center gap-2 rounded-lg bg-[#49BBBD] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F7E80]"
    >
      <FiPlus /> {t("admin.new_course")}
    </NavLink>
  );

  return (
    <>
      <PageHeader title={t("admin.courses")} actions={actions} />

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
              placeholder={t("search.title_placeholder", { defaultValue: "Search by title…" })}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-9 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#49BBBD] focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/20"
            />
          </div>
        </div>

        {/* Sort / dir / page size */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm shadow-sm focus:border-[#49BBBD] focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/20"
          >
            {SORT_FIELDS.map((s) => (
              <option key={s.value} value={s.value}>
                {t(`sort.${s.value}`)}
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
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm shadow-sm focus:border-[#49BBBD] focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/20"
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
          {t("errors.courses_load_failed")}: {String(error?.message || "Unknown error")}
        </div>
      )}
      {!isLoading && !isError && all.length === 0 && (
        <EmptyState
          title={t("empty.courses_title")}
          note={q ? t("empty.try_clear") : t("empty.create_first_course")}
        />
      )}

      {/* ===== Mobile list (cards) ===== */}
      {!isLoading && !isError && all.length > 0 && (
        <div className="space-y-3 md:hidden">
          {paginatedData.map((c) => (
            <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                {c.thumbnailUrl ? (
                  <img
                    src={c.thumbnailUrl}
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
                    {localizeCourse(c, t).title}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                    {localizeCourse(c, t).description || "—"}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200">
                      {catMap[c.categoryId] || "—"}
                    </span>
                    <StatusBadge published={!!c.isPublished} small />
                    <span className="text-[11px] text-gray-500">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  {Number(c.price || 0).toLocaleString()}{" "}
                  <span className="text-gray-500">{c.currency || "USD"}</span>
                </span>

                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/courses/${c.id}/edit`)}
                    className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    disabled={deleting}
                    onClick={() => setToDelete({ id: c.id, title: c.title })}
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
                  <Th>{t("admin.courses")}</Th>
                  <Th>{t("sort.price")}</Th>
                  <Th>{t("admin.categories")}</Th>
                  <Th>{t("admin.status.published")}/{t("admin.status.draft")}</Th>
                  <Th className="w-36">{t("sort.createdAt")}</Th>
                  <Th className="w-28 text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((c) => (
                  <tr key={c.id} className="group">
                    <Td>
                      <div className="flex items-center gap-3">
                        {c.thumbnailUrl ? (
                          <img
                            src={c.thumbnailUrl}
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
                            {localizeCourse(c, t).title}
                          </div>
                          <div className="max-w-[480px] truncate text-xs text-gray-500">
                            {localizeCourse(c, t).description || "—"}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="font-semibold text-gray-900">
                        {Number(c.price || 0).toLocaleString()}{" "}
                        <span className="text-gray-500">
                          {c.currency || "USD"}
                        </span>
                      </span>
                    </Td>
                    <Td>
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 ring-1 ring-gray-200">
                        {catMap[c.categoryId] || "—"}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge published={!!c.isPublished} />
                    </Td>
                    <Td>{formatDate(c.createdAt)}</Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/courses/${c.id}/edit`)
                          }
                          className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          disabled={deleting}
                          onClick={() =>
                            setToDelete({ id: c.id, title: c.title })
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
        title={t("confirm.delete_course_title", { defaultValue: "Delete course?" })}
        message={
          toDelete
            ? t("confirm.delete_course_body", {
                defaultValue:
                  "“{{title}}” will be permanently deleted. This action cannot be undone.",
                title: toDelete.title,
              })
            : ""
        }
        confirmText={t("common.delete")}
        confirmTone="danger"
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteCourse(toDelete.id);
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
    { value: "all", label: t("filter.all") },
    { value: "published", label: t("admin.status.published") },
    { value: "drafts", label: t("admin.status.draft") },
  ];

  return (
    <>
      {/* Mobile: select */}
      <label className="md:hidden">
        <span className="sr-only">Status</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm shadow-sm focus:border-[#49BBBD] focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/20"
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
                      ? "bg-[#49BBBD]/10 text-[#2F7E80] ring-1 ring-[#49BBBD]/30"
                      : "text-gray-700 hover:bg-[#49BBBD]/5",
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
    <td className={`border-b border-gray-100 px-3 py-3 align-middle ${className}`}>
      {children}
    </td>
  );
}

function StatusBadge({ published, small = false }) {
  const { t } = useTranslation();
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 text-xs font-medium";
  if (published) {
    return (
      <span
        className={`${base} ${small ? "px-1.5 py-0 text-[11px]" : ""} bg-emerald-50 text-emerald-700 ring-emerald-200`}
      >
        • {t("admin.status.published")}
      </span>
    );
  }
  return (
    <span
      className={`${base} ${small ? "px-1.5 py-0 text-[11px]" : ""} bg-amber-50 text-amber-700 ring-amber-200`}
    >
      • {t("admin.status.draft")}
    </span>
  );
}

function formatDate(ts) {
  if (!ts) return "—";
  const ms =
    ts?.toMillis ? ts.toMillis() : ts?.seconds ? ts.seconds * 1000 : +new Date(ts);
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
