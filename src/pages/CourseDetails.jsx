// src/pages/CourseDetails.jsx
import { useParams, Link } from "react-router-dom";
import { useCourse } from "../hooks/useCourse";

export default function CourseDetails() {
  const { id } = useParams();
  const { data: course, isLoading, isError, error } = useCourse(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center text-gray-600">
        Loading course...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center text-red-600">
        Failed to load course. {error.message}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center text-gray-600">
        Course not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/courses" className="text-sm text-[#49BBBD] hover:underline">
          ← Back to Courses
        </Link>
      </div>

      {course.thumbnailUrl ? (
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="mb-6 max-h-80 w-full rounded-xl object-cover shadow"
        />
      ) : (
        <div className="mb-6 grid h-60 w-full place-items-center rounded-xl bg-gray-100 text-gray-400">
          No image available
        </div>
      )}

      <h1 className="mb-2 text-3xl font-bold text-gray-900">{course.title}</h1>
      <p className="mb-4 text-gray-600">{course.description}</p>

      <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
        <span className="rounded-full bg-[#49BBBD]/10 px-4 py-1 font-medium text-[#49BBBD]">
          Price: {Number(course.price).toLocaleString()}{" "}
          {course.currency || "USD"}
        </span>

        {course.category && (
          <span className="rounded-full bg-gray-100 px-4 py-1 text-gray-700">
            Category: {course.category}
          </span>
        )}

        {course.createdAt && (
          <span className="text-gray-400">
            Created at: {new Date(course.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {course.instructor && (
        <div className="mt-8 border-t pt-6 text-sm text-gray-700">
          <p>
            <strong>Instructor:</strong> {course.instructor}
          </p>
        </div>
      )}
    </div>
  );
}
