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

/*
   Validation schema - professional & user friendly messages
*/
const createSchema = (t) => Yup.object({
  title: Yup.string()
    .min(3, t("admin.productForm.validation.titleMin"))
    .required(t("admin.productForm.validation.titleRequired")),
  description: Yup.string()
    .min(10, t("admin.productForm.validation.descriptionMin"))
    .required(t("admin.productForm.validation.descriptionRequired")),
  thumbnailUrl: Yup.string()
    .url(t("admin.productForm.validation.thumbnailUrl"))
    .required(t("admin.productForm.validation.thumbnailUrlRequired")),
  price: Yup.number()
    .typeError(t("admin.productForm.validation.priceNumber"))
    .positive(t("admin.productForm.validation.pricePositive"))
    .required(t("admin.productForm.validation.priceRequired")),
  stock: Yup.number()
    .typeError(t("admin.productForm.validation.stockNumber"))
    .integer(t("admin.productForm.validation.stockInteger"))
    .min(0, t("admin.productForm.validation.stockMin"))
    .required(t("admin.productForm.validation.stockRequired")),
  currency: Yup.string().oneOf(["USD", "EGP"]).required(t("admin.productForm.validation.currencyRequired")),
  categoryId: Yup.string().required(t("admin.productForm.validation.categoryRequired")),
  isAvailable: Yup.boolean(),
});

export default function AdminProductForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: product, isLoading } = useProduct(id);
  const { data: categories = [] } = useCategoriesSorted({});
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  // initial values: support legacy documents that used "quantity" as string
  const initial =
    isEdit && product
      ? {
          title: product.title ?? "",
          description: product.description ?? "",
          thumbnailUrl: product.thumbnailUrl ?? "",
          price: product.price ?? "",
          currency: product.currency ?? "USD",
          categoryId: product.categoryId ?? "",
          // prefer numeric stock; fallback to quantity field if present (coerce to number)
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

  const actions = (
    <div className="flex items-center gap-2">
      <button
        type="submit"
        form="productForm"
        className="rounded-lg bg-[#49BBBD] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2F7E80]"
      >
        {isEdit ? t("admin.productForm.saveChanges") : t("admin.productForm.addProduct")}
      </button>

      <button
        onClick={() => navigate(-1)}
        type="button"
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        {t("admin.productForm.cancel")}
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        title={isEdit ? t("admin.productForm.editTitle") : t("admin.productForm.newTitle")}
        actions={actions}
      />

      {isEdit && isLoading ? (
        <div className="text-sm text-gray-600">{t("admin.productForm.loading")}</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <Formik
            initialValues={initial}
            enableReinitialize
            validationSchema={createSchema(t)}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                // Normalize values so mutations don't get strings
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
                console.error("Save product failed:", err);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, setFieldValue }) => (
              <Form id="productForm" className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    {t("admin.productForm.productName")}
                  </label>
                  <Field
                    name="title"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                  <ErrorMessage
                    name="title"
                    component="p"
                    className="text-xs text-red-600 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    {t("admin.productForm.description")}
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                  <ErrorMessage
                    name="description"
                    component="p"
                    className="text-xs text-red-600 mt-1"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">
                      {t("admin.productForm.imageUrl")}
                    </label>
                    <Field
                      name="thumbnailUrl"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                    <ErrorMessage
                      name="thumbnailUrl"
                      component="p"
                      className="text-xs text-red-600 mt-1"
                    />
                    {values.thumbnailUrl && (
                      <img
                        src={values.thumbnailUrl}
                        alt={t("admin.productForm.preview")}
                        className="mt-2 h-24 w-full rounded-lg border object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      {t("admin.productForm.category")}
                    </label>
                    <Field
                      as="select"
                      name="categoryId"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="">{t("admin.productForm.selectCategory")}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="categoryId"
                      component="p"
                      className="text-xs text-red-600 mt-1"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium">{t("admin.productForm.price")}</label>
                    <Field
                      name="price"
                      type="number"
                      min="0"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                    <ErrorMessage
                      name="price"
                      component="p"
                      className="text-xs text-red-600 mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">{t("admin.productForm.stock")}</label>
                    <Field
                      name="stock"
                      type="number"
                      min="0"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                    <ErrorMessage
                      name="stock"
                      component="p"
                      className="text-xs text-red-600 mt-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {t("admin.productForm.stockHelp")}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      {t("admin.productForm.currency")}
                    </label>
                    <Field
                      as="select"
                      name="currency"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="USD">USD</option>
                      <option value="EGP">EGP</option>
                    </Field>
                    <ErrorMessage
                      name="currency"
                      component="p"
                      className="text-xs text-red-600 mt-1"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <Field
                    name="isAvailable"
                    type="checkbox"
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">{t("admin.productForm.available")}</span>
                </label>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </>
  );
}
