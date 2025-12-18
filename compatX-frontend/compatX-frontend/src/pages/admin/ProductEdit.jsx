import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../lib/axiosClient";
import adminProductService from "../../services/adminProductService";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm();

  // load faster not now chekck again 
  useEffect(() => {
    const loadData = async () => {
      try {
        const catRes = await axiosClient.get("/admin/get-all-categories");
        setCategories(catRes.data.data || []);

        const result = await adminProductService.getProduct(id);

        if (result.success) {
          const p = result.data;

          // auto fill form
          setValue("productName", p.productName);
          setValue("brand", p.brand);
          setValue("description", p.description);
          setValue("price", p.price);
          setValue("stock", p.stock);
          setValue("categoryId", p.category?.categoryId);
          setValue("imageUrl", p.imageUrl);
          setImageUrl(p.imageUrl);

          setLoading(false);
        } else {
          alert(result.error || "Failed to load product.");
          navigate("/admin/products");
        }
      } catch (e) {
        console.error(e);
        alert("Failed to load product.");
        navigate("/admin/products");
      }
    };

    loadData();
  }, [id, setValue, navigate]);

  // sync with cloudinary problem comes check product create 
  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const preset = import.meta.env.VITE_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    try {
      setUploading(true);
      setProgress(0);

      const upload = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await upload.json();

      // set both local and RHF form
      setImageUrl(data.secure_url);
      setValue("imageUrl", data.secure_url, { shouldDirty: true });

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 400);
    } catch (err) {
      console.error(err);
      setUploading(false);
      setProgress(0);
    }
  };

  // apply is dirty soon 
  const onSubmit = async (values) => {
    const result = await adminProductService.updateProduct(id, values, values.categoryId);

    if (result.success) {
      navigate("/admin/products");
    } else {
      alert(result.error || "Failed to update product");
    }
  };

  // dummy loading 
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 text-sm">
        Loading product…
      </div>
    );
  }


  return (
    <div className="min-h-[calc(100vh-90px)] flex items-start justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl"
      >
        {/* IMAGE SIDE */}
        <div className="border bg-white rounded-lg p-5 shadow-sm flex flex-col h-full">
          <h2 className="text-lg font-medium mb-4">Product Images</h2>

          {/* Hidden RHF field to track image dirty state */}
          <input type="hidden" {...register("imageUrl")} />

          <div
            className={`relative border-2 border-dashed rounded-lg h-44 flex flex-col items-center justify-center text-gray-400
              transition hover:border-gray-500 ${uploading ? "opacity-70" : ""
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

        {/* FORM SIDE */}
        <div className="border bg-white rounded-lg p-5 shadow-sm flex flex-col h-full">
          <div className="space-y-3">
            <h2 className="text-lg font-medium mb-2">Product Details</h2>

            <input
              {...register("productName", { required: "Product name required" })}
              placeholder="Product name"
              className="border rounded w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
            />

            <input
              {...register("brand", { required: "Brand required" })}
              placeholder="Brand"
              className="border rounded w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
            />

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
            />
          </div>

          {/* BUTTONS */}
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
              disabled={!isDirty || uploading || isSubmitting}
              title={!isDirty ? "No changes made" : ""}
              className={`
                px-4 py-2 rounded text-sm font-medium transition-all select-none
                ${!isDirty || uploading || isSubmitting
                  ? "bg-gray-200 text-gray-400 border border-transparent cursor-not-allowed hover:border-red-500 hover:text-red-500"
                  : "bg-black text-white hover:bg-gray-800 cursor-pointer"
                }
              `}
            >
              {uploading || isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
