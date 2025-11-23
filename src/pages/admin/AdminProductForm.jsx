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

/*
  Validation schema - professional & user friendly messages
*/
const Schema = Yup.object({
  title: Yup.string()
    .min(3, "Product name is too short")
    .required("Product name is required"),
  description: Yup.string()
    .min(10, "Description is too short")
    .required("Description is required"),
  thumbnailUrl: Yup.string()
    .url("Please enter a valid image URL")
    .required("Image URL is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be > 0")
    .required("Price is required"),
  stock: Yup.number()
    .typeError("Stock must be a number")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .required("Stock is required"),
  currency: Yup.string().oneOf(["USD", "EGP"]).required("Currency is required"),
  categoryId: Yup.string().required("Category is required"),
  isAvailable: Yup.boolean(),
});

export default function AdminProductForm() {
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
        {isEdit ? "Save Changes" : "Add Product"}
      </button>

      <button
        onClick={() => navigate(-1)}
        type="button"
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        title={isEdit ? "Edit Product" : "New Product"}
        actions={actions}
      />

      {isEdit && isLoading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <Formik
            initialValues={initial}
            enableReinitialize
            validationSchema={Schema}
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
                    Product Name
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
                    Description
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
                      Image URL
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
                        alt="Preview"
                        className="mt-2 h-24 w-full rounded-lg border object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Category
                    </label>
                    <Field
                      as="select"
                      name="categoryId"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="">Select category…</option>
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
                    <label className="block text-sm font-medium">Price</label>
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
                    <label className="block text-sm font-medium">Stock</label>
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
                      Set product inventory (units available).
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Currency
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
                  <span className="text-sm font-medium">Available</span>
                </label>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </>
  );
}
