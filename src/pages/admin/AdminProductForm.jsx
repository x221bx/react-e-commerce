// src/pages/admin/AdminProductForm.jsx
import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { FiArrowLeft, FiExternalLink, FiZap } from "react-icons/fi";
import toast from "react-hot-toast";
import PageHeader from "../../admin/PageHeader";
import { useProduct } from "../../hooks/useProduct";
import { useAddProduct, useUpdateProduct } from "../../hooks/useProductMutations";
import { useCategoriesSorted } from "../../hooks/useCategoriesSorted";
import { UseTheme } from "../../theme/ThemeProvider";
import { translateText as aiTranslate } from "../../utils/aiHelpers";

const schema = Yup.object({
  titleEn: Yup.string().min(3, "Title (EN) must be at least 3 characters").required("Title (EN) is required"),
  titleAr: Yup.string().min(3, "Title (AR) must be at least 3 characters").required("Title (AR) is required"),
  descriptionEn: Yup.string().min(10, "Description (EN) must be at least 10 characters").required("Description (EN) is required"),
  descriptionAr: Yup.string().min(10, "Description (AR) must be at least 10 characters").required("Description (AR) is required"),
  thumbnailUrl: Yup.string().url("Thumbnail must be a valid URL").required("Thumbnail URL is required"),
  price: Yup.string()
    .test("is-valid-price", "Price must be a valid positive number", (value) => {
      if (!value && value !== 0) return false;
      const num = parseFloat(value);
      return !Number.isNaN(num) && num >= 0 && num <= 999999999;
    })
    .required("Price is required"),
  stock: Yup.number().typeError("Stock must be a number").integer("Stock must be an integer").min(0, "Stock cannot be negative").required("Stock is required"),
  featureHome: Yup.boolean(),
  currency: Yup.string().oneOf(["USD", "EGP"]).required("Currency is required"),
  categoryId: Yup.string().required("Category is required"),
  isAvailable: Yup.boolean(),
});

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const isEdit = Boolean(id);

  const { data: product, isLoading: loadingProduct, isError } = useProduct(id);
  const { data: categories = [] } = useCategoriesSorted({ dir: "asc" });
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const [translating, setTranslating] = useState("");

  const surfaceClass = isDark
    ? "bg-slate-900 border border-slate-800 text-slate-100"
    : "bg-white border border-gray-200 text-gray-900";
  const inputClass = `w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm transition focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
    isDark
      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400"
      : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
  }`;
  const translateBtnClass = `inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
    isDark
      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
      : "border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
  } disabled:opacity-60 disabled:cursor-not-allowed`;

  const initialValues = useMemo(
    () => ({
      titleEn: product?.titleEn || product?.title || "",
      titleAr: product?.titleAr || "",
      descriptionEn: product?.descriptionEn || product?.description || "",
      descriptionAr: product?.descriptionAr || "",
      thumbnailUrl: product?.thumbnailUrl || "",
      price: product?.price ?? "",
      stock: Number(product?.stock ?? product?.quantity ?? 0) || 0,
      currency: product?.currency || "EGP",
      categoryId: product?.categoryId || "",
      isAvailable:
        product?.isAvailable !== false &&
        (Number(product?.stock ?? product?.quantity ?? 0) > 0),
      featureHome: !!product?.featureHome,
    }),
    [product]
  );

  const handleTranslate = async ({ targetLang, values, setFieldValue }) => {
    const sourceLang = targetLang === "ar" ? "en" : "ar";
    const sourceTitle = targetLang === "ar" ? values.titleEn : values.titleAr;
    const sourceDesc =
      targetLang === "ar" ? values.descriptionEn : values.descriptionAr;

    if (!sourceTitle && !sourceDesc) {
      toast.error("Add content to translate first.");
      return;
    }

    setTranslating(targetLang);
    try {
      const [translatedTitle, translatedDesc] = await Promise.all([
        sourceTitle
          ? aiTranslate({ text: sourceTitle, targetLang, sourceLang })
          : Promise.resolve(""),
        sourceDesc
          ? aiTranslate({ text: sourceDesc, targetLang, sourceLang })
          : Promise.resolve(""),
      ]);

      if (targetLang === "ar") {
        if (translatedTitle) setFieldValue("titleAr", translatedTitle);
        if (translatedDesc) setFieldValue("descriptionAr", translatedDesc);
      } else {
        if (translatedTitle) setFieldValue("titleEn", translatedTitle);
        if (translatedDesc) setFieldValue("descriptionEn", translatedDesc);
      }
      toast.success(
        targetLang === "ar"
          ? "Translated to Arabic"
          : "Translated to English"
      );
    } catch (error) {
      console.error("translate error", error);
      toast.error("Translation failed. Please try again.");
    } finally {
      setTranslating("");
    }
  };

  const handleSubmit = async (values, helpers) => {
    const { setSubmitting } = helpers;
    const stockValue = Math.max(0, Number(values.stock) || 0);
    const payload = {
      titleEn: values.titleEn.trim(),
      titleAr: values.titleAr.trim(),
      title: values.titleEn.trim(),
      descriptionEn: values.descriptionEn.trim(),
      descriptionAr: values.descriptionAr.trim(),
      description: values.descriptionEn.trim(),
      thumbnailUrl: values.thumbnailUrl.trim(),
      price: Number(values.price) || 0,
      stock: stockValue,
      quantity: stockValue,
      currency: values.currency,
      categoryId: values.categoryId,
      isAvailable: stockValue > 0 && values.isAvailable !== false,
      featureHome: !!values.featureHome,
    };

    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id, ...payload });
        toast.success("Product updated");
      } else {
        await addProduct.mutateAsync(payload);
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (error) {
      console.error("submit error", error);
      toast.error("Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loadingProduct) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        Loading product...
      </div>
    );
  }

  if (isEdit && !product && !loadingProduct) {
    return (
      <div className="p-6 text-center text-sm text-red-500">
        {isError
          ? "Failed to load this product."
          : "Product not found or deleted."}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full pb-12 ${
        isDark ? "bg-[#0d1a1a]" : "bg-[#f8faf9]"
      }`}
    >
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <PageHeader
          title={
            isEdit
              ? t("admin.edit_product", { defaultValue: "Edit product" })
              : t("admin.new_product", { defaultValue: "New product" })
          }
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <FiArrowLeft /> {t("back", { defaultValue: "Back" })}
              </button>
              {isEdit && (
                <a
                  href={`/product/${id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:bg-emerald-500/20"
                >
                  <FiExternalLink />
                  {t("products.view_live", { defaultValue: "View live" })}
                </a>
              )}
            </div>
          }
        />

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting, setFieldValue }) => (
            <Form
              className={`rounded-2xl ${surfaceClass} shadow-sm`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                  <FiZap />
                  {t("admin.translation_helpers", {
                    defaultValue: "AI translation helpers",
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleTranslate({
                        targetLang: "ar",
                        values,
                        setFieldValue,
                      })
                    }
                    disabled={translating === "ar"}
                    className={translateBtnClass}
                  >
                    {translating === "ar" ? "Translating..." : "EN → AR"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleTranslate({
                        targetLang: "en",
                        values,
                        setFieldValue,
                      })
                    }
                    disabled={translating === "en"}
                    className={translateBtnClass}
                  >
                    {translating === "en" ? "Translating..." : "AR → EN"}
                  </button>
                </div>
              </div>

              <div className="grid gap-6 px-5 py-6 md:grid-cols-3">
                <div className="space-y-4 md:col-span-2">
                  <LabeledField label="Title (English)" name="titleEn">
                    <Field
                      name="titleEn"
                      className={inputClass}
                      placeholder="Farm product title in English"
                    />
                  </LabeledField>
                  <LabeledField label="Title (Arabic)" name="titleAr">
                    <Field
                      name="titleAr"
                      className={inputClass}
                      placeholder="عنوان المنتج بالعربية"
                    />
                  </LabeledField>
                  <LabeledField label="Description (English)" name="descriptionEn">
                    <Field
                      as="textarea"
                      rows={4}
                      name="descriptionEn"
                      className={inputClass}
                      placeholder="Clear English description for customers"
                    />
                  </LabeledField>
                  <LabeledField label="Description (Arabic)" name="descriptionAr">
                    <Field
                      as="textarea"
                      rows={4}
                      name="descriptionAr"
                      className={inputClass}
                      placeholder="وصف المنتج باللغة العربية"
                    />
                  </LabeledField>
                </div>

                <div className="space-y-4">
                  <LabeledField label="Thumbnail URL" name="thumbnailUrl">
                    <Field
                      name="thumbnailUrl"
                      className={inputClass}
                      placeholder="https://..."
                    />
                    {values.thumbnailUrl && (
                      <div className="mt-2 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/70">
                        <img
                          src={values.thumbnailUrl}
                          alt="Preview"
                          className="h-40 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.png";
                          }}
                        />
                      </div>
                    )}
                  </LabeledField>

                  <div className="grid grid-cols-2 gap-3">
                    <LabeledField label="Price" name="price">
                      <Field
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                      />
                    </LabeledField>
                    <LabeledField label="Currency" name="currency">
                      <Field as="select" name="currency" className={inputClass}>
                        <option value="EGP">EGP</option>
                        <option value="USD">USD</option>
                      </Field>
                    </LabeledField>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <LabeledField label="Stock" name="stock">
                      <Field
                        name="stock"
                        type="number"
                        min="0"
                        className={inputClass}
                      />
                    </LabeledField>
                    <LabeledField label="Category" name="categoryId">
                      <Field as="select" name="categoryId" className={inputClass}>
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name || cat.title || cat.titleEn || "Category"}
                          </option>
                        ))}
                      </Field>
                    </LabeledField>
                  </div>

                  <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                    <label className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">Availability</div>
                        <p className="text-xs text-gray-500 dark:text-slate-300">
                          Turns off automatically if stock is zero.
                        </p>
                      </div>
                      <Field
                        type="checkbox"
                        name="isAvailable"
                        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">Show on home</div>
                        <p className="text-xs text-gray-500 dark:text-slate-300">
                          Only featured items appear on the home grid.
                        </p>
                      </div>
                      <Field
                        type="checkbox"
                        name="featureHome"
                        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="text-xs text-gray-500 dark:text-slate-300">
                  Keep translations in sync before saving.
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/products")}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {t("cancel", { defaultValue: "Cancel" })}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {isSubmitting
                      ? t("saving", { defaultValue: "Saving..." })
                      : isEdit
                      ? t("admin.save_changes", { defaultValue: "Save changes" })
                      : t("admin.create_product", { defaultValue: "Create product" })}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

function LabeledField({ label, name, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">
        {label}
      </span>
      {children}
      <ErrorMessage
        name={name}
        component="div"
        className="text-xs font-semibold text-rose-500"
      />
    </label>
  );
}
