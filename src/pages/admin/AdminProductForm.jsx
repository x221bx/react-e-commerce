// src/pages/AdminProductForm.jsx
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import PageHeader from "../../admin/PageHeader";
import { useProduct } from "../../hooks/useProduct";
import {
  useAddProduct,
  useUpdateProduct,
} from "../../hooks/useProductMutations";
import { useCategoriesSorted } from "../../hooks/useCategoriesSorted";
import { UseTheme } from "../../theme/ThemeProvider";

// Validation Schema
const createSchema = (t) =>
  Yup.object({
    titleEn: Yup.string()
      .min(3, "Title (EN) must be at least 3 characters")
      .required("Title (EN) is required"),
    titleAr: Yup.string()
      .min(3, "Title (AR) must be at least 3 characters")
      .required("Title (AR) is required"),
    descriptionEn: Yup.string()
      .min(10, "Description (EN) must be at least 10 characters")
      .required("Description (EN) is required"),
    descriptionAr: Yup.string()
      .min(10, "Description (AR) must be at least 10 characters")
      .required("Description (AR) is required"),
    thumbnailUrl: Yup.string()
      .url("Thumbnail must be a valid URL")
      .required("Thumbnail URL is required"),
    price: Yup.string()
      .test('is-valid-price', 'Price must be a valid positive number', (value) => {
        if (!value && value !== 0) return false;
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue >= 0 && numValue <= 999999999;
      })
      .required("Price is required"),
    stock: Yup.number()
      .typeError("Stock must be a number")
      .integer("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .required("Stock is required"),
    currency: Yup.string()
      .oneOf(["USD", "EGP"])
      .required("Currency is required"),
    categoryId: Yup.string().required(
      "Category is required"
    ),
    isAvailable: Yup.boolean(),
  });

export default function AdminProductForm() {
  const { theme } = UseTheme();
  const dark = theme === "dark";

  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: product, isLoading } = useProduct(id);
  const { data: categories = [] } = useCategoriesSorted({});
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  // initial values
  const initial =
    isEdit && product
      ? {
          titleEn: product.titleEn ?? product.title ?? "",
          titleAr: product.titleAr ?? "",
          descriptionEn: product.descriptionEn ?? product.description ?? "",
          descriptionAr: product.descriptionAr ?? "",
          thumbnailUrl: product.thumbnailUrl ?? "",
          price: product.price ?? "",
          currency: product.currency ?? "USD",
          categoryId: product.categoryId ?? "",
          stock:
            product.stock !== undefined
              ? Number(product.stock)
              : product.quantity !== undefined
              ? Number(product.quantity)
              : 0,
          isAvailable: !!product.isAvailable,
        }
      : {
          titleEn: "",
          titleAr: "",
          descriptionEn: "",
          descriptionAr: "",
          thumbnailUrl: "",
          price: "",
          currency: "USD",
          categoryId: "",
          stock: 0,
          isAvailable: true,
        };

  // Custom validation for price to prevent symbols
  const validatePrice = (value) => {
    if (!value && value !== 0) return "Price is required";
    if (isNaN(value) || value < 0) return "Price must be a valid positive number";
    if (value > 999999999) return "Price is too high";
    return undefined;
  };

  // Handle price input to prevent symbols
  const handlePriceChange = (e, setFieldValue) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const finalValue = cleanValue.replace(/(\..*)\./g, '$1');
    setFieldValue('price', finalValue);
  };

  return (
    <div
      className={`
        min-h-screen w-full pt-4 pb-10 px-4 md:px-6
        transition-all duration-300
        ${dark ? "bg-[#0d1a1a] text-[#cfecec]" : "bg-gray-50 text-gray-900"}
      `}
    >
      <PageHeader
        title={
          isEdit
            ? "Edit product"
            : "New product"
        }
        actions={[]}
      />

      {isEdit && isLoading ? (
        <div className="text-sm opacity-70">
          "Loading product..."
        </div>
      ) : (
        <div
          className={`
            rounded-xl border p-4 shadow-sm sm:p-6
            ${
              dark
                ? "bg-[#0f2222] border-[#1e3a3a]"
                : "bg-white border-gray-200"
            }
          `}
        >
          <Formik
            initialValues={initial}
            enableReinitialize
            validationSchema={createSchema()}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const payload = {
                  title: values.titleEn || values.titleAr || "",
                  titleEn: values.titleEn,
                  titleAr: values.titleAr,
                  description: values.descriptionEn || values.descriptionAr || "",
                  descriptionEn: values.descriptionEn,
                  descriptionAr: values.descriptionAr,
                  thumbnailUrl: values.thumbnailUrl || undefined,
                  price: Number(values.price) || 0,
                  currency: values.currency,
                  categoryId: values.categoryId,
                  stock: Number(values.stock) || 0,
                  isAvailable: !!values.isAvailable,
                };

                if (isEdit) {
                  await updateProduct.mutateAsync({ id, ...payload });
                } else {
                  const ref = await addProduct.mutateAsync(payload);
                  if (ref?.id) {
                    navigate(`/admin/products/${ref.id}/edit`, {
                      replace: true,
                    });
                    return;
                  }
                }

                navigate("/admin/products", { replace: true });
              } catch (err) {
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values }) => (
              <Form id="productForm" className="grid gap-4">
                {/* Titles (EN/AR) */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">
                      Product name (English)
                    </label>
                    <Field
                      name="titleEn"
                      className={`
                        w-full rounded-lg px-3 py-2 border
                        ${
                          dark
                            ? "bg-[#0c1919] border-[#1e3a3a] text-[#cfecec]"
                            : "bg-white border-gray-300 text-gray-800"
                        }
                      `}
                    />
                    <ErrorMessage
                      name="titleEn"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Product name (Arabic)
                    </label>
                    <Field
                      name="titleAr"
                      className={`
                        w-full rounded-lg px-3 py-2 border
                        ${
                          dark
                            ? "bg-[#0c1919] border-[#1e3a3a] text-[#cfecec]"
                            : "bg-white border-gray-300 text-gray-800"
                        }
                      `}
                    />
                    <ErrorMessage
                      name="titleAr"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>
                </div>

                {/* Descriptions (EN/AR) */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">
                      Description (English)
                    </label>
                    <Field
                      as="textarea"
                      name="descriptionEn"
                      rows={4}
                      className={`
                        w-full rounded-lg px-3 py-2 border
                        ${
                          dark
                            ? "bg-[#0c1919] border-[#1e3a3a] text-[#cfecec]"
                            : "bg-white border-gray-300 text-gray-800"
                        }
                      `}
                    />
                    <ErrorMessage
                      name="descriptionEn"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Description (Arabic)
                    </label>
                    <Field
                      as="textarea"
                      name="descriptionAr"
                      rows={4}
                      className={`
                        w-full rounded-lg px-3 py-2 border
                        ${
                          dark
                            ? "bg-[#0c1919] border-[#1e3a3a] text-[#cfecec]"
                            : "bg-white border-gray-300 text-gray-800"
                        }
                      `}
                    />
                    <ErrorMessage
                      name="descriptionAr"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>
                </div>

                {/* Image + Category */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">
                      Image URL
                    </label>
                    <Field
                      name="thumbnailUrl"
                      className={`
                        w-full rounded-lg px-3 py-2 border
                        ${
                          dark
                            ? "bg-[#0c1919] border-[#1e3a3a] text-[#cfecec]"
                            : "bg-white border-gray-300 text-gray-800"
                        }
                      `}
                    />
                    <ErrorMessage
                      name="thumbnailUrl"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />

                    {values.thumbnailUrl && (
                      <img
                        src={values.thumbnailUrl}
                        className="mt-2 h-24 w-full rounded-lg object-cover border"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium">
                      Category
                    </label>
                    <Field
                      as="select"
                      name="categoryId"
                      className={`
                        w-full rounded-lg px-3 py-2 border
                        ${
                          dark
                            ? "bg-[#0c1919] border-[#1e3a3a] text-[#cfecec]"
                            : "bg-white border-gray-300 text-gray-800"
                        }
                      `}
                    >
                      <option value="">
                        Select category
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="categoryId"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>
                </div>

                {/* Price / Stock / Currency */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium">
                      Price
                    </label>
                    <Field name="price">
                      {({ field, form, meta }) => (
                        <>
                          <input
                            {...field}
                            type="text"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow only numbers and decimal point
                              const cleanValue = value.replace(/[^0-9.]/g, '');
                              // Only allow one decimal point
                              const finalValue = cleanValue.replace(/(\..*)\./g, '$1');
                              form.setFieldValue("price", finalValue);
                            }}
                            className={`
                              w-full rounded-lg px-3 py-2 border
                              ${
                                dark
                                  ? "bg-[#0c1919] border-[#1e3a3a] text-[#cfecec]"
                                  : "bg-white border-gray-300 text-gray-800"
                              }
                              ${meta.touched && meta.error ? 'border-red-500' : ''}
                            `}
                          />
                          {meta.touched && meta.error && (
                            <p className="text-xs text-red-500 mt-1">{meta.error}</p>
                          )}
                        </>
                      )}
                    </Field>
                    <ErrorMessage
                      name="price"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium">
                      Stock
                    </label>
                    <Field
                      name="stock"
                      type="number"
                      min="0"
                      className={`
                        w-full rounded-lg px-3 py-2 border
                        ${
                          dark
                            ? "bg-[#0c1919] border-[#1e3a3a] text-[#cfecec]"
                            : "bg-white border-gray-300 text-gray-800"
                        }
                      `}
                    />
                    <ErrorMessage
                      name="stock"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium">
                      Currency
                    </label>
                    <Field
                      as="select"
                      name="currency"
                      className={`
                        w-full rounded-lg px-3 py-2 border
                        ${
                          dark
                            ? "bg-[#0c1919] border-[#1e3a3a] text-[#cfecec]"
                            : "bg-white border-gray-300 text-gray-800"
                        }
                      `}
                    >
                      <option value="USD">USD</option>
                      <option value="EGP">EGP</option>
                    </Field>
                    <ErrorMessage
                      name="currency"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>
                </div>

                {/* Checkbox */}
                <label className="flex items-center gap-2">
                  <Field name="isAvailable" type="checkbox" />
                  <span className="text-sm font-medium">Available</span>
                </label>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                  >
                    {isEdit ? "Update product" : "Create product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 dark:border-white/20 dark:text-white/80"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
}
