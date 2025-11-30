// src/pages/admin/AdminCategories.jsx
import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../admin/PageHeader";
import { useCategoriesSorted } from "../../hooks/useCategoriesSorted";
import { usePagination } from "../../hooks/usePagination";
import Pager from "../../admin/Pager";
import {
  useDeleteCategory,
  useCreateCategory,
  useUpdateCategory,
} from "../../hooks/useCategoriesMutations";
import ConfirmDialog from "../../admin/ConfirmDialog";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";

export default function AdminCategories() {
  const { t } = useTranslation();
  const { theme } = UseTheme();
  const dark = theme === "dark";

  // useSearchParams (مهم جداً للـ URL sync)
  const [params, setParams] = useSearchParams();
  const [dir, setDir] = useState(params.get("dir") || "desc");
  const [pageSize, setPageSize] = useState(
    Number(params.get("pageSize") || 10)
  );
  const pageFromUrl = Math.max(1, Number(params.get("page") || 1));

  const [toDelete, setToDelete] = useState(null);
  const [newCategory, setNewCategory] = useState("");

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

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
  const update = useUpdateCategory();

  const {
    paginatedData = [],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, pageSize]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategory.trim())
      return alert(t("errors.name_required") || "Name required");
    try {
      await create.mutateAsync({ name: newCategory.trim() });
      setNewCategory("");
    } catch (err) {
      console.error("Create category failed:", err);
      alert("Failed to create category.");
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name || "");
  };

  const saveEdit = async (catId) => {
    if (!editingName.trim())
      return alert(t("errors.name_required") || "Name required");
    try {
      await update.mutateAsync({
        id: catId,
        updatedFields: { name: editingName.trim() },
      });
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update category.");
    }
  };

  return (
    <div
      className={`
        min-h-screen w-full pt-4 pb-10 px-4 md:px-6
        ${dark ? "bg-[#0d1a1a] text-[#cfecec]" : "bg-[#f9f9f9] text-gray-900"}
      `}
    >
      <PageHeader title={t("admin.categories") || "Categories"} />

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className={`mb-5 flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl border shadow-sm
          ${
            dark ? "bg-[#0f2222] border-[#1e3a3a]" : "bg-white border-gray-200"
          }`}
      >
        <input
          type="text"
          placeholder={t("admin.category_name") || "Category name…"}
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className={`
            flex-1 rounded-lg px-3 py-2 text-sm
            ${
              dark
                ? "bg-[#0c1919] text-[#cfecec] border-[#1e3a3a]"
                : "bg-white text-gray-700 border-gray-300"
            }
          `}
        />
        <button
          type="submit"
          disabled={create.isLoading}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
            create.isLoading ? "bg-gray-400" : "bg-[#048b02] hover:bg-[#04785b]"
          }`}
        >
          <FiPlus />{" "}
          {create.isLoading
            ? t("loading") || "Loading..."
            : t("admin.create") || "Create"}
        </button>
      </form>

      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm opacity-80">
          {t("common.total") || "Total"}:{" "}
          <span className="font-semibold">{all.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
            className={`
              inline-flex h-9 items-center gap-1 px-3 rounded-lg border shadow-sm
              ${
                dark
                  ? "bg-[#0f2222] border-[#1e3a3a] text-[#cfecec]"
                  : "bg-white border-gray-200 text-gray-700"
              }
            `}
          >
            {dir === "asc" ? "Asc" : "Desc"}
          </button>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className={`rounded-lg px-2.5 py-2 text-sm shadow-sm ${
              dark
                ? "bg-[#0f2222] border-[#1e3a3a] text-[#cfecec]"
                : "bg-white border-gray-200 text-gray-700"
            }`}
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
      {isLoading && <Skeleton rows={6} dark={dark} />}

      {isError && (
        <div
          className={`rounded-lg p-4 border ${
            dark
              ? "bg-[#2b0f0f] border-red-900 text-red-300"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {t("errors.categories_load_failed") || "Failed to load categories"}:{" "}
          {error?.message}
        </div>
      )}

      {!isLoading && !isError && all.length === 0 && (
        <div
          className={`rounded-lg p-8 text-center border ${
            dark
              ? "bg-[#0f2222] border-[#1e3a3a] text-[#cfecec]"
              : "bg-gray-50 border-gray-200 text-gray-700"
          }`}
        >
          <div className="text-lg font-semibold">
            {t("empty.categories_title") || "No categories yet"}
          </div>
          <div className="mt-1 text-sm opacity-80">
            {t("empty.create_first_category") || "Create the first category"}
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && all.length > 0 && (
        <div
          className={`overflow-x-auto rounded-xl border shadow-sm mt-4 ${
            dark ? "bg-[#0f2222] border-[#1e3a3a]" : "bg-white border-gray-200"
          }`}
        >
          <table className="w-full border-separate border-spacing-0">
            <thead
              className={
                dark
                  ? "bg-[#163434] text-[#cfecec]"
                  : "bg-gray-50 text-gray-600"
              }
            >
              <tr>
                <Th>{t("admin.categories") || "Category"}</Th>
                <Th className="w-40">{t("sort.createdAt") || "Created"}</Th>
                <Th className="w-28 text-right">Actions</Th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((cat) => (
                <tr
                  key={cat.id}
                  className={
                    dark
                      ? "hover:bg-[#163434] transition"
                      : "hover:bg-gray-50 transition"
                  }
                >
                  <Td>
                    {editingId === cat.id ? (
                      <input
                        className="px-2 py-1 rounded border text-sm w-full"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                    ) : (
                      <span className="font-medium">{cat.name}</span>
                    )}
                  </Td>

                  <Td>{formatDate(cat.createdAt)}</Td>

                  <Td className="text-right">
                    {editingId === cat.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => saveEdit(cat.id)}
                          className="p-2 rounded bg-green-600 text-white"
                          title="Save"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 rounded bg-gray-400 text-white"
                          title="Cancel"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-2 rounded border"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => setToDelete(cat)}
                          className="p-2 rounded border text-rose-600"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pager */}
      <div className="mt-4">
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

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!toDelete}
        title={t("confirm.delete_category_title") || "Delete category?"}
        message={toDelete?.name || ""}
        confirmText={t("common.delete") || "Delete"}
        confirmTone="danger"
        loading={del.isLoading}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await del.mutateAsync(toDelete.id);
            setToDelete(null);
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete.");
          }
        }}
      />
    </div>
  );
}

/* Small helpers */
function Th({ children, className = "" }) {
  return (
    <th className={`border-b px-3 py-2 text-sm ${className}`}>{children}</th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td className={`border-b px-3 py-3 text-sm ${className}`}>{children}</td>
  );
}

function formatDate(ts) {
  if (!ts) return "—";
  // Firestore Timestamp may have toMillis()
  const ms =
    typeof ts?.toMillis === "function"
      ? ts.toMillis()
      : ts?.seconds
      ? ts.seconds * 1000
      : +new Date(ts);
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Skeleton({ rows = 6, dark = false }) {
  return (
    <div
      className={`animate-pulse rounded-xl border p-4 shadow-sm ${
        dark ? "bg-[#0f2222] border-[#1e3a3a]" : "bg-white border-gray-200"
      }`}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between py-2">
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-[#244]" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-[#244]" />
        </div>
      ))}
    </div>
  );
}
