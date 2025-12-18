import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../lib/axiosClient";

export default function CategoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    axiosClient
      .get(`/admin/get-category/${id}`)
      .then((res) => {
        setValue("categoryName", res.data.data.categoryName);
      })
      .catch((err) => console.error(err));
  }, [id, setValue]);

  const onSubmit = async (values) => {
    try {
      await axiosClient.put(`/admin/update-category/${id}`, values);
      navigate("/admin/categories");
    } catch (err) {
      console.error(err);
      alert("Failed to update category");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-90px)] px-4">
      <div className="w-full max-w-md bg-white border rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Edit Category
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              placeholder="Enter category name"
              {...register("categoryName", {
                required: "Category name is required",
              })}
              className="border rounded-lg w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
            {errors.categoryName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.categoryName.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded bg-black text-white hover:bg-gray-800 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
