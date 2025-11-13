import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import PageHeader from "../../components/admin/PageHeader";
import { useCourse } from "../../hooks/useCourse";
import { useAddCourse, useUpdateCourse } from "../../hooks/useCoursesMutations";
import { useCategoriesSorted } from "../../hooks/useCategoriesSorted";

const Schema = Yup.object({
  title: Yup.string().min(3, "Too short").required("Required"),
  description: Yup.string().min(10, "Too short").required("Required"),
  thumbnailUrl: Yup.string().url("Must be URL").required("Required"),
  price: Yup.number().min(0, "Min 0").required("Required"),
  currency: Yup.string().oneOf(["USD", "EGP"]).required("Required"),
  categoryId: Yup.string().required("Required"),
  isPublished: Yup.boolean().required(),
});

export default function AdminCourseForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: course, isLoading } = useCourse(id);
  const { data: categories = [] } = useCategoriesSorted({});
  const addCourse = useAddCourse();
  const updateCourse = useUpdateCourse();

  const initial =
    isEdit && course
      ? {
          title: course.title || "",
          description: course.description || "",
          thumbnailUrl: course.thumbnailUrl || "",
          price: course.price ?? 0,
          currency: course.currency || "USD",
          categoryId: course.categoryId || "",
          isPublished: !!course.isPublished,
        }
      : {
          title: "",
          description: "",
          thumbnailUrl: "",
          price: 0,
          currency: "USD",
          categoryId: "",
          isPublished: true,
        };

  const actions = (
    <div className="flex items-center gap-2">
      <button
        type="submit"
        form="courseForm"
        className="rounded-lg bg-[#49BBBD] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2F7E80]"
      >
        {isEdit ? "Save Changes" : "Create"}
      </button>
      <button
        onClick={() => navigate(-1)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        title={isEdit ? "Edit Course" : "New Course"}
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
                if (isEdit) {
                  await updateCourse.mutateAsync({ id, ...values });
                } else {
                  const ref = await addCourse.mutateAsync(values);
                  if (ref?.id)
                    navigate(`/admin/courses/${ref.id}/edit`, {
                      replace: true,
                    });
                }
                navigate("/admin/courses", { replace: true });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, values }) => (
              <Form id="courseForm" className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <Field
                    name="title"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#49BBBD] focus:outline-none"
                  />
                  <ErrorMessage
                    name="title"
                    component="p"
                    className="text-xs text-red-600"
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#49BBBD] focus:outline-none"
                  />
                  <ErrorMessage
                    name="description"
                    component="p"
                    className="text-xs text-red-600"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">
                      Thumbnail URL
                    </label>
                    <Field
                      name="thumbnailUrl"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#49BBBD] focus:outline-none"
                    />
                    <ErrorMessage
                      name="thumbnailUrl"
                      component="p"
                      className="text-xs text-red-600"
                    />
                    {values.thumbnailUrl ? (
                      <img
                        src={values.thumbnailUrl}
                        alt="thumbnail preview"
                        className="mt-2 h-24 w-full rounded-lg border object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Category
                    </label>
                    <Field
                      as="select"
                      name="categoryId"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#49BBBD] focus:outline-none"
                    >
                      <option value="">Select…</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="categoryId"
                      component="p"
                      className="text-xs text-red-600"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium">Price</label>
                    <Field
                      name="price"
                      type="number"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#49BBBD] focus:outline-none"
                    />
                    <ErrorMessage
                      name="price"
                      component="p"
                      className="text-xs text-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Currency
                    </label>
                    <Field
                      as="select"
                      name="currency"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#49BBBD] focus:outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="EGP">EGP</option>
                    </Field>
                    <ErrorMessage
                      name="currency"
                      component="p"
                      className="text-xs text-red-600"
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <Field
                      name="isPublished"
                      type="checkbox"
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">Published</span>
                  </label>
                </div>

                <div className="pt-2 text-right text-xs text-gray-500">
                  * `title_lc` & `createdAt` are set in the mutation for
                  consistency.
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </>
  );
}
