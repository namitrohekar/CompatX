import React, { useEffect, useState } from "react";
import axiosClient from "../../lib/axiosClient";
import { Link } from "react-router-dom";
import { Pencil, PlusCircle } from "lucide-react";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axiosClient
      .get("/admin/get-all-categories")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Link
          to="/admin/categories/create"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition"
        >
          <PlusCircle size={16} /> New Category
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-100 border-b text-gray-700">
            <tr>
              <th className="px-5 py-3 font-semibold">UID</th>
              <th className="px-5 py-3 font-semibold">Category Name</th>
              <th className="px-5 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <tr
                  key={cat.categoryId}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-5 py-3 text-gray-700">{index + 1}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {cat.categoryName}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Link
                      to={`/admin/categories/edit/${cat.categoryId}`}
                      className="inline-flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition"
                    >
                      <Pencil size={16} /> Edit
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center text-gray-500 py-6 text-sm"
                >
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
