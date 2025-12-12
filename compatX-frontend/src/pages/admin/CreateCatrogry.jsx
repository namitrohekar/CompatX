import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axiosClient from "../../lib/axiosClient";

export default function CreateCategory() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: { categoryName: "" },
  });

  const onSubmit = async (values) => {
    try {
      await axiosClient.post("/admin/add-category", values);
      navigate("/admin/categories");
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
          "Failed to create category. Please check console/network tab."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-90px)] px-4">
      <div className="w-full max-w-md bg-white border rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Create Category
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Category Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g. Laptop"
              {...register("categoryName", {
                required: "Category name is required",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters",
                },
              })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
            {errors.categoryName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.categoryName.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50 transition"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded bg-black text-white hover:bg-gray-800 transition disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
