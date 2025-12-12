import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../../lib/axiosClient";
import adminProductService from "../../services/adminProductService";

export default function ProductView() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch product details
  useEffect(() => {
    async function load() {
      try {
        const result = await adminProductService.getProduct(id);

        if (result.success) {
          setProduct(result.data || null);
        } else {
          console.error("Failed to load product", result.error);
        }
      } catch (e) {
        console.error("Failed to load product", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-gray-600 text-lg animate-pulse">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-red-600 text-lg">
        Product not found.
      </div>
    );
  }


  // Convert→ "19 Jan 2025, 01:50 PM"
  function formatDateTime(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Convert timestamp → "2 hours ago", "3 days ago"
  function timeAgo(dateStr) {
    if (!dateStr) return "";
    const now = new Date();
    const past = new Date(dateStr);
    const seconds = Math.floor((now - past) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count >= 1) {
        return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  }


  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Product Details</h1>

        <div className="flex gap-3">
          <Link
            to={`/admin/products/edit/${product.id}`}
            className="btn-primary btn-outline text-white hover:text-black"
          >
            Edit Product
          </Link>

          <Link
            to="/admin/products"
            className="btn-outline px-4 py-2 rounded"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Product Info Card */}
      <div className="card p-6 flex flex-col md:flex-row gap-10">

        {/* IMAGE */}
        <div className="flex justify-center items-start">
          <img
            src={product.imageUrl?.replace(
              "/upload/",
              "/upload/w_500,h_500,c_fit,q_auto/"
            )}
            alt={product.productName}
            className="rounded-lg shadow-md max-w-[320px]"
          />
        </div>

        {/* DETAILS */}
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-semibold">{product.productName}</h2>

          <div className="text-lg text-gray-700">
            <strong>Brand: </strong> {product.brand}
          </div>

          <div className="text-lg text-gray-700">
            <strong>Category: </strong> {product.category?.categoryName}
          </div>

          <div className="text-lg text-gray-700">
            <strong>Price: </strong> ₹{product.price}
          </div>

          <div className={product.stock < 5 ? "text-lg text-red-400" : "text-lg text-gray-700"}>
            <strong>Stock: </strong> {product.stock}
          </div>

          {product.description && (
            <div className="text-gray-600">
              <strong>Description:</strong>
              <p className="mt-1">{product.description}</p>
            </div>
          )}

          {/* CREATED */}
          {product.createdAt && (
            <div className="text-gray-600 text-sm">
              <strong>Created:</strong> {timeAgo(product.createdAt)} • {formatDateTime(product.createdAt)}
            </div>
          )}

          {/* UPDATED */}
          {product.updatedAt && (
            <div className="text-gray-600 text-sm">
              <strong>Updated:</strong> {timeAgo(product.updatedAt)} • {formatDateTime(product.updatedAt)}
            </div>
          )}

        </div>
      </div>

      {/* Could add more info here later */}
    </div>
  );
}
