import React, { useState, useEffect } from "react";

export default function Modal({ isOpen, onClose, course, onSave }) {
  const [formValues, setFormValues] = useState({ title: "", instructor: "" });

  useEffect(() => {
    if (course) {
      setFormValues({ title: course.title, instructor: course.instructor });
    } else {
      setFormValues({ title: "", instructor: "" });
    }
  }, [course]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formValues);
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-gray-600">
      <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">
          {course ? "Update Course" : "Add Course"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formValues.title}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Instructor</label>
            <input
              type="text"
              name="instructor"
              value={formValues.instructor}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-4 py-2 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
