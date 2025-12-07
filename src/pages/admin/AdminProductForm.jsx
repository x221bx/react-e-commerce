// src/pages/AdminProductForm.jsx
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
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
    title: Yup.string()
      .min(3, t("admin.productForm.validation.titleMin"))
      .required(t("admin.productForm.validation.titleRequired")),
    description: Yup.string()
      .min(10, t("admin.productForm.validation.descriptionMin"))
      .required(t("admin.productForm.validation.descriptionRequired")),
    thumbnailUrl: Yup.string()
      .url(t("admin.productForm.validation.thumbnailUrl"))
      .required(t("admin.productForm.validation.thumbnailUrlRequired")),
    price: Yup.string()
      .test('is-valid-price', 'Price must be a valid positive number', (value) => {
        if (!value && value !== 0) return false;
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue >= 0 && numValue <= 999999999;
      })
      .required(t("admin.productForm.validation.priceRequired")),
    stock: Yup.number()
      .typeError(t("admin.productForm.validation.stockNumber"))
      .integer(t("admin.productForm.validation.stockInteger"))
      .min(0, t("admin.productForm.validation.stockMin"))
      .required(t("admin.productForm.validation.stockRequired")),
    currency: Yup.string()
      .oneOf(["USD", "EGP"])
      .required(t("admin.productForm.validation.currencyRequired")),
    categoryId: Yup.string().required(
      t("admin.productForm.validation.categoryRequired")
    ),
    isAvailable: Yup.boolean(),
  });

export default function AdminProductForm() {
  const { t } = useTranslation();
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
          title: product.title ?? "",
          description: product.description ?? "",
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
          title: "",
          description: "",
          thumbnailUrl: "",
          price: "",
          currency: "USD",
          categoryId: "",
          stock: 0,
          isAvailable: true,
        };

  // Custom validation for price to prevent symbols
  const validatePrice = (value) => {
    if (!value && value !== 0) return t("admin.productForm.validation.priceRequired");
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
            ? t("admin.productForm.editTitle")
            : t("admin.productForm.newTitle")
        }
        actions={actions}
      />

      {isEdit && isLoading ? (
        <div className="text-sm opacity-70">
          {t("admin.productForm.loading")}
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
            validationSchema={createSchema(t)}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const payload = {
                  title: values.title,
                  description: values.description,
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
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium">
                    {t("admin.productForm.productName")}
                  </label>
                  <Field
                    name="title"
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
                    name="title"
                    component="p"
                    className="text-xs text-red-500 mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium">
                    {t("admin.productForm.description")}
                  </label>
                  <Field
                    as="textarea"
                    name="description"
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
                    name="description"
                    component="p"
                    className="text-xs text-red-500 mt-1"
                  />
                </div>

                {/* Image + Category */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">
                      {t("admin.productForm.imageUrl")}
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
                      {t("admin.productForm.category")}
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
                        {t("admin.productForm.selectCategory")}
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
                      {t("admin.productForm.price")}
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
                              field.onChange(finalValue);
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
                      {t("admin.productForm.stock")}
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
                      {t("admin.productForm.currency")}
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
                  <span className="text-sm font-medium">
                    {t("admin.productForm.available")}
                  </span>
                </label>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
}
