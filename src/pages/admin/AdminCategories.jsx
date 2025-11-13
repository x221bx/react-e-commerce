import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  FiEdit2,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiPlus,
} from "react-icons/fi";
import PageHeader from "../../admin/PageHeader";
import { useCategoriesSorted } from "../../hooks/useCategoriesSorted";
import { usePagination } from "../../hooks/usePagination";
import Pager from "../../admin/Pager";
import {
  useDeleteCategory,
  useCreateCategory,
} from "../../hooks/useCategoriesMutations";
import ConfirmDialog from "../../admin/ConfirmDialog";
import { useTranslation } from "react-i18next";
import { localizeCategory } from "../../utils/localizeContent";

export default function AdminCategories() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [dir, setDir] = useState(params.get("dir") || "desc");
  const [pageSize, setPageSize] = useState(
    Number(params.get("pageSize") || 10)
  );
  const pageFromUrl = Math.max(1, Number(params.get("page") || 1));
  const [toDelete, setToDelete] = useState(null);

  // 🧩 form state
  const [newCategory, setNewCategory] = useState("");

  // 🧠 hooks
  const {
    data: all = [],
    isLoading,
    isError,
    error,
  } = useCategoriesSorted({
    sortBy: "createdAt",
    dir,
  });
  const del = useDeleteCategory();
  const create = useCreateCategory();

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
    resetKeys: [dir, pageSize],
    onPageChange: (p) => {
      const next = new URLSearchParams(params.toString());
      next.set("page", String(p));
      setParams(next, { replace: true });
    },
  });

  useEffect(() => {
    const next = new URLSearchParams(params.toString());
    next.set("dir", dir);
    next.set("pageSize", String(pageSize));
    setParams(next, { replace: true });
  }, [dir, pageSize]);

  // 🪄 handle create
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return alert(t("errors.name_required"));
    await create.mutateAsync({ name: newCategory });
    setNewCategory("");
  };

  return (
    <>
      <PageHeader title={t("admin.categories")} />

      {/* ✅ Create Form */}
      <form
        onSubmit={handleCreate}
        className="mb-5 flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200"
      >
        <input
          type="text"
          placeholder={t("admin.category_name")}
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#138602] focus:ring-2 focus:ring-[#49BBBD]/20"
        />
        <button
          type="submit"
          disabled={create.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#048b02] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F7E80]"
        >
          <FiPlus /> {create.isPending ? t("loading") : t("admin.create")}
        </button>
      </form>

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-600">
          {t("common.total", { defaultValue: "Total" })}:{" "}
          <span className="font-semibold text-gray-900">{all.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50"
            title={`${t("sort.createdAt")} (${dir.toUpperCase()})`}
          >
            {dir === "asc" ? <FiArrowUp /> : <FiArrowDown />}
          </button>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm shadow-sm focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/20 focus:outline-none"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* States */}
      {isLoading && <Skeleton rows={6} />}
      {isError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {t("errors.categories_load_failed")}:{" "}
          {String(error?.message || "Unknown error")}
        </div>
      )}
      {!isLoading && !isError && all.length === 0 && (
        <EmptyState
          title={t("empty.categories_title")}
          note={t("empty.create_first_category")}
        />
      )}

      {!isLoading && !isError && all.length > 0 && (
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-gray-50 text-left text-sm text-gray-600">
                <tr>
                  <Th>{t("admin.categories")}</Th>
                  <Th className="w-40">{t("sort.createdAt")}</Th>
                  <Th className="w-28 text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <Td>
                      <div className="font-medium text-gray-900">
                        {localizeCategory(cat, t)}
                      </div>
                    </Td>
                    <Td>{formatDate(cat.createdAt)}</Td>
                    <Td className="text-right">
                      <Actions cat={cat} onDelete={setToDelete} />
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

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!toDelete}
        title={t("confirm.delete_category_title", {
          defaultValue: "Delete category?",
        })}
        message={
          toDelete
            ? t("confirm.delete_category_body", {
                defaultValue:
                  "“{{name}}” will be removed. Courses will remain but still reference this categoryId.",
                name: toDelete.name,
              })
            : ""
        }
        confirmText={t("common.delete")}
        confirmTone="danger"
        loading={del.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await del.mutateAsync(toDelete.id);
          setToDelete(null);
        }}
      />
    </>
  );
}

/* ===== Subcomponents ===== */
function Actions({ cat, onDelete }) {
  return (
    <div className="inline-flex items-center gap-2">
      <NavLink
        to={`/admin/categories/${cat.id}/edit`}
        className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50"
        title="Edit"
      >
        <FiEdit2 />
      </NavLink>
      <button
        onClick={() => onDelete({ id: cat.id, name: cat.name })}
        className="rounded-md border border-gray-200 bg-white p-2 text-rose-600 shadow-sm transition hover:bg-rose-50"
        title="Delete"
      >
        <FiTrash2 />
      </button>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`border-b border-gray-200 px-3 py-2 ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td className={`border-b border-gray-100 px-3 py-3 ${className}`}>
      {children}
    </td>
  );
}
function Skeleton({ rows = 6 }) {
  return (
    <div className="divide-y divide-gray-100 animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 py-2">
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
function formatDate(ts) {
  if (!ts) return "—";
  const ms = ts?.toMillis
    ? ts.toMillis()
    : ts?.seconds
    ? ts.seconds * 1000
    : +new Date(ts);
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
