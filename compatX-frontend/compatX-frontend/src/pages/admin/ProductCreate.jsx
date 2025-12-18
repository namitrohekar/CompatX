import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosClient from "../../lib/axiosClient";
import adminProductService from "../../services/adminProductService";

export default function ProductCreate() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    axiosClient
      .get("/admin/get-all-categories")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.error(err));
  }, []);

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const preset = import.meta.env.VITE_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);
    formData.append("quality", "auto:good");
    formData.append("fetch_format", "auto");

    try {
      setUploading(true);
      setProgress(0);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (evt) => {
            const pct = Math.round((evt.loaded * 100) / evt.total);
            setProgress(pct);
          },
        }
      );

      setImageUrl(res.data.secure_url);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 400);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploading(false);
      setProgress(0);
    }
  };

  const onSubmit = async (values) => {
    if (!imageUrl) {
      alert("Please upload a product image.");
      return;
    }
    values.imageUrl = imageUrl;

    const result = await adminProductService.createProduct(values, values.categoryId);

    if (result.success) {
      reset();
      navigate("/admin/products");
    } else {
      alert(result.error || "Failed to create product");
    }
  };

  return (
    <div className="min-h-[calc(100vh-90px)] flex items-start justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl"
      >
        {/* LEFT: Upload Section */}
        <div className="border bg-white rounded-lg p-5 shadow-sm flex flex-col justify-between h-full">
          <div>
            <h2 className="text-lg font-medium mb-4">Product Images</h2>

            <div
              className={`relative border-2 border-dashed rounded-lg h-44 flex flex-col items-center justify-center text-gray-400 transition hover:border-gray-500 ${uploading ? "opacity-70" : ""
                }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={uploadImage}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {!uploading ? (
                <div className="pointer-events-none text-center z-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-9 h-9 mx-auto mb-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5m-18 0l3.75-4.5a2.25 2.25 0 013.5 0L15 18m-3-3 2.25-3a2.25 2.25 0 013.5 0L21 18m-9-12v6m0 0l-3-3m3 3l3-3"
                    />
                  </svg>
                  <p className="text-sm">Drop image here or click to browse</p>
                </div>
              ) : (
                <p className="text-sm z-0">Uploading... {progress}%</p>
              )}
            </div>

            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}

            {imageUrl && (
              <div className="mt-4 border rounded-md overflow-hidden transition hover:shadow-md">
                <img
                  src={imageUrl}
                  alt="preview"
                  className="w-full h-40 object-contain transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Product Form */}
        <div className="border bg-white rounded-lg p-5 shadow-sm flex flex-col justify-between h-full">
          <div className="space-y-3">
            <h2 className="text-lg font-medium mb-2">Product Details</h2>

            <div>
              <input
                {...register("productName", { required: "Product name required" })}
                placeholder="Product name"
                className="border rounded w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
              />
              {errors.productName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.productName.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register("brand", { required: "Brand required" })}
                placeholder="Brand"
                className="border rounded w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
              />
              {errors.brand && (
                <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>
              )}
            </div>

            <div>
              <select
                {...register("categoryId", { required: "Category required" })}
                className="border rounded w-full px-3 py-2 text-sm"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                {...register("price", { required: "Price required" })}
                placeholder="Price ₹"
                type="number"
                className="border rounded w-full px-3 py-2 text-sm"
              />
              <input
                {...register("stock", { required: "Stock required" })}
                placeholder="Stock"
                type="number"
                className="border rounded w-full px-3 py-2 text-sm"
              />
            </div>

            <textarea
              {...register("description")}
              rows={2}
              placeholder="Short description"
              className="border rounded w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 resize-none"
            ></textarea>
          </div>

          {/* Sticky Buttons */}
          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white border-t mt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Save Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
