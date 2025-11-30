import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  useUpdateCategory,
} from "../../hooks/useCategoriesMutations";
import ConfirmDialog from "../../admin/ConfirmDialog";
import { useTranslation } from "react-i18next";
import { localizeCategory } from "../../utils/localizeContent";
import { UseTheme } from "../../theme/ThemeProvider";
import toast from "react-hot-toast";

export default function AdminCategories() {
  const { t } = useTranslation();
  const { theme } = UseTheme();
  const dark = theme === "dark";

  const [searchParams, setSearchParams] = useSearchParams();
  const [dir, setDir] = useState(searchParams.get("dir") || "desc");
  const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize") || 10));
  const pageFromUrl = Math.max(1, Number(searchParams.get("page") || 1));
  const [toDelete, setToDelete] = useState(null);

  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState("");
  const { categoryId } = useParams();
  const navigate = useNavigate();

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
      const next = new URLSearchParams(searchParams.toString());
      next.set("page", String(p));
      setSearchParams(next, { replace: true });
    },
  });

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("dir", dir);
    next.set("pageSize", String(pageSize));
    setSearchParams(next, { replace: true });
  }, [dir, pageSize]);

  useEffect(() => {
    if (!categoryId) {
      setEditingCategory(null);
      setEditingName("");
      return;
    }
    if (isLoading) return;
    const target = all.find((cat) => cat.id === categoryId);
    if (target) {
      setEditingCategory(target);
      setEditingName(target.name || "");
    } else {
      toast.error(t("errors.category_not_found", "Category not found"));
      navigate("/admin/categories", { replace: true });
    }
  }, [categoryId, all, isLoading, navigate, t]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return alert(t("errors.name_required"));
    await create.mutateAsync({ name: newCategory });
    setNewCategory("");
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditingName("");
    navigate("/admin/categories", { replace: true });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingName.trim()) {
      toast.error(t("errors.name_required"));
      return;
    }
    await update.mutateAsync({
      id: editingCategory.id,
      updatedFields: { name: editingName.trim() },
    });
    toast.success(t("admin.category_updated", "Category updated"));
    handleCancelEdit();
  };

  return (
    <div
      className={`
        min-h-screen w-full pt-28 pb-10 px-4 md:px-6
        transition-all duration-300
        ${dark ? "bg-[#0d1a1a] text-[#cfecec]" : "bg-[#f9f9f9] text-gray-900"}
      `}
    >
      <PageHeader title={t("admin.categories")} />

      {/* Create Form */}
      <form
        onSubmit={handleCreate}
        className={`
          mb-5 flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl border shadow-sm
          ${dark ? "bg-[#0f2222] border-[#1e3a3a]" : "bg-white border-gray-200"}
        `}
      >
        <input
          type="text"
          placeholder={t("admin.category_name")}
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className={`
            flex-1 rounded-lg px-3 py-2 text-sm
            focus:ring-2 focus:ring-[#49BBBD]/40
            ${dark 
              ? "bg-[#0c1919] border-[#1e3a3a] text-[#cfecec]" 
              : "bg-white border-gray-300 text-gray-700"}
          `}
        />

        <button
          type="submit"
          disabled={create.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#048b02] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2F7E80] transition"
        >
          <FiPlus /> {create.isPending ? t("loading") : t("admin.create")}
        </button>
      </form>

      {editingCategory && (
        <form
          onSubmit={handleUpdate}
          className={`
            mb-6 flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl border shadow-sm
            ${dark ? "bg-[#0f2222] border-[#1e3a3a]" : "bg-white border-gray-200"}
          `}
        >
          <div className="flex-1 w-full">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
              {t("admin.editing_category", "Editing category")}
            </p>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className={`
                w-full rounded-lg px-3 py-2 text-sm
                focus:ring-2 focus:ring-[#49BBBD]/40
                ${dark
                  ? "bg-[#0c1919] border border-[#1e3a3a] text-[#cfecec]"
                  : "bg-white border border-gray-300 text-gray-700"}
              `}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className={`
                rounded-lg px-4 py-2 text-sm font-semibold border
                ${dark
                  ? "bg-[#0f2222] border-[#1e3a3a] text-[#cfecec] hover:bg-[#163434]"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}
              `}
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={update.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2F7E80] px-4 py-2 text-sm font-semibold text-white hover:bg-[#266668] disabled:opacity-70"
            >
              {update.isPending
                ? t("common.saving", "Saving...")
                : t("common.save", "Save")}
            </button>
          </div>
        </form>
      )}

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm opacity-80">
          {t("common.total")}:{" "}
          <span className="font-semibold">{all.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
            className={`
              inline-flex h-9 items-center gap-1 px-3 rounded-lg border shadow-sm
              ${dark
                ? "bg-[#0f2222] border-[#1e3a3a] text-[#cfecec] hover:bg-[#163434]"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}
            `}
          >
            {dir === "asc" ? <FiArrowUp /> : <FiArrowDown />}
          </button>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className={`
              rounded-lg px-2.5 py-2 text-sm shadow-sm
              ${dark
                ? "bg-[#0f2222] border-[#1e3a3a] text-[#cfecec]"
                : "bg-white border-gray-200 text-gray-700"}
            `}
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
        <div
          className={`
            rounded-lg p-4 border 
            ${dark
              ? "bg-[#331] border-red-900 text-red-300"
              : "bg-rose-50 border-rose-200 text-rose-700"}
          `}
        >
          {t("errors.categories_load_failed")}: {error?.message}
        </div>
      )}

      {!isLoading && !isError && all.length === 0 && (
        <EmptyState
          title={t("empty.categories_title")}
          note={t("empty.create_first_category")}
          dark={dark}
        />
      )}

      {!isLoading && !isError && all.length > 0 && (
        <div className="hidden md:block">
          <div
            className={`
              overflow-x-auto rounded-xl border shadow-sm
              ${dark ? "bg-[#0f2222] border-[#1e3a3a]" : "bg-white border-gray-200"}
            `}
          >
            <table className="w-full border-separate border-spacing-0">
              <thead
                className={`
                  text-left text-sm
                  ${dark ? "bg-[#163434] text-[#cfecec]" : "bg-gray-50 text-gray-600"}
                `}
              >
                <tr>
                  <Th>{t("admin.categories")}</Th>
                  <Th className="w-40">{t("sort.createdAt")}</Th>
                  <Th className="w-28 text-right">Actions</Th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((cat) => (
                  <tr
                    key={cat.id}
                    className={dark
                      ? "hover:bg-[#163434] transition"
                      : "hover:bg-gray-50 transition"}
                  >
                    <Td>
                      <span className="font-medium">{localizeCategory(cat, t)}</span>
                    </Td>

                    <Td>{formatDate(cat.createdAt)}</Td>

                    <Td className="text-right">
                      <Actions cat={cat} onDelete={setToDelete} dark={dark} />
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

      <ConfirmDialog
        open={!!toDelete}
        title={t("confirm.delete_category_title", "Delete category")}
        message={
          toDelete
            ? t("confirm.delete_category_body", {
                name: toDelete.name,
                defaultValue: `Are you sure you want to delete “${toDelete.name}”?`,
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
    </div>
  );
}

/* ===== Subcomponents ===== */

function Actions({ cat, onDelete, dark }) {
  const navigate = useNavigate();
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => navigate(`/admin/categories/${cat.id}/edit`)}
        className={`
          rounded-md p-2 border shadow-sm transition
          ${dark
            ? "bg-[#0f2222] border-[#1e3a3a] text-[#cfecec] hover:bg-[#163434]"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}
        `}
      >
        <FiEdit2 />
      </button>

      <button
        onClick={() => onDelete({ id: cat.id, name: cat.name })}
        className={`
          rounded-md p-2 border shadow-sm transition
          ${dark
            ? "bg-[#2b0f0f] border-red-900 text-red-300 hover:bg-[#3d1616]"
            : "bg-white border-gray-200 text-rose-600 hover:bg-rose-50"}
        `}
      >
        <FiTrash2 />
      </button>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`border-b px-3 py-2 ${className}`}>{children}</th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`border-b px-3 py-3 ${className}`}>{children}</td>
  );
}

function Skeleton({ rows = 6 }) {
  return (
    <div className="animate-pulse rounded-xl border p-4 shadow-sm bg-white dark:bg-[#0f2222] border-gray-200 dark:border-[#1e3a3a]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between py-2">
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-[#244]" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-[#244]" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, note, dark }) {
  return (
    <div
      className={`grid place-items-center rounded-lg border p-8 text-center ${
        dark
          ? "bg-[#0f2222] border-[#1e3a3a] text-[#cfecec]"
          : "bg-gray-50 border-gray-200 text-gray-700"
      }`}
    >
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm opacity-80">{note}</div>
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
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
