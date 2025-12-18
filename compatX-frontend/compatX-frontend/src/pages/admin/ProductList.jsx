import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../lib/axiosClient";
import adminProductService from "../../services/adminProductService";

import { Edit, Trash2, Eye } from "lucide-react";

// Debounce utility
const debounce = (fn, delay = 400) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // FILTERS
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // SORT — maps cleanly to backend
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("");

  // PAGING
  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load Categories 
  useEffect(() => {
    axiosClient
      .get("/admin/get-all-categories")
      .then((res) => {
        const raw = res?.data?.data;
        setCategories(Array.isArray(raw) ? raw : []);
      });

  }, []);

  // Fetching for ProductSpecifications 
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axiosClient.get("/admin/products/filter", {
        params: {
          keyword: keyword || null,
          categoryId: categoryId || null,

          // Spring expects these:
          sortField: sortField || null,
          sortDirection: sortDirection || null,

          page,
          size,
        },
      });

      const body = res.data.data;

      setProducts(body.items || []);
      setTotalPages(body.totalPages || 1);
      setTotalItems(body.totalElements || 0);
    } catch (e) {
      console.error("Fetch failed", e);
    }
  }, [keyword, categoryId, sortField, sortDirection, page, size]);

  const debouncedFetch = useCallback(debounce(fetchProducts, 350), [
    fetchProducts,
  ]);

  // Whenever filters change do reload


  useEffect(() => {
    if (keyword.trim() !== "") debouncedFetch();
    else fetchProducts();
  }, [keyword, categoryId, sortField, sortDirection, page]);

  // Deleting product 
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    const result = await adminProductService.deleteProduct(id);

    if (result.success) {
      fetchProducts();
    } else {
      alert(result.error || "Failed to delete product");
    }
  };

  // Reset filters 
  const resetFilters = () => {
    setKeyword("");
    setCategoryId("");
    setSortField("");
    setSortDirection("");
    setPage(0);
    fetchProducts();
  };


  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Manage Products</h1>
        <Link
          to="/admin/products/create"
          className="btn-outline btn-primary text-white hover:text-black"
        >
          + Add Product
        </Link>
      </div>

      {/* FILTER BAR */}

      <div className="card p-4 flex flex-wrap gap-6 items-end">
        {/* Search */}
        <div className="flex flex-col">
          <label className="text-xs font-medium">Search</label>
          <input
            type="text"
            className="input"
            placeholder="Keyword…"
            value={keyword}
            onChange={(e) => {
              setPage(0);
              setKeyword(e.target.value);
            }}
          />
        </div>


        {/* Category */}
        <div className="flex flex-col">
          <label className="text-xs font-medium">Category</label>
          <select
            className="input"
            value={categoryId}
            onChange={(e) => {
              setPage(0);
              setCategoryId(e.target.value);
            }}
          >
            <option value="">All</option>
            {Array.isArray(categories) && categories.map((c) => (

              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Field */}
        <div className="flex flex-col">
          <label className="text-xs font-medium">Sort Field</label>
          <select
            className="input"
            value={sortField}
            onChange={(e) => {
              setPage(0);
              setSortField(e.target.value);
            }}
          >
            <option value="">None</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
            <option value="createdAt">Created Date</option>
          </select>
        </div>

        {/* Sort Direction */}
        <div className="flex flex-col">
          <label className="text-xs font-medium">Sort Direction</label>
          <select
            className="input"
            value={sortDirection}
            onChange={(e) => {
              setPage(0);
              setSortDirection(e.target.value);
            }}
          >
            <option value="">None</option>
            <option value="asc">ASC ↑</option>
            <option value="desc">DESC ↓</option>
          </select>
        </div>

        {/* Reset */}
        <button className="btn-outline px-4 py-2" onClick={resetFilters}>
          Reset
        </button>

        <div className="ml-auto text-sm text-gray-500">
          Items: {totalItems}
        </div>
      </div>



      {/* TABLE */}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead className="table-header text-xs uppercase">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Brand</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.id}</td>

                  <td className="p-3">
                    <img
                      src={p.imageUrl?.replace(
                        "/upload/",
                        "/upload/w_60,h_60,c_fill,q_auto/"
                      )}
                      alt={p.productName}
                      className="w-12 h-12 rounded object-cover"
                    />
                  </td>

                  <td className="p-3">{p.productName}</td>
                  <td className="p-3">{p.brand}</td>
                  <td className="p-3">{p.category?.categoryName}</td>
                  <td className="p-3 font-semibold">₹{p.price}</td>
                  <td className={`p-3 ${p.stock > 5 ? "text-black font-semibold" : "text-red-600 font-semibold"}`}>{p.stock}</td>

                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-3">
                      <Link to={`/admin/products/view/${p.id}`}>
                        <Eye size={18} className="text-gray-500 hover:text-blue-600" />
                      </Link>

                      <Link to={`/admin/products/edit/${p.id}`}>
                        <Edit size={18} className="text-gray-500 hover:text-green-600" />
                      </Link>

                      <button onClick={() => handleDelete(p.id)}>
                        <Trash2 size={18} className="text-gray-500 hover:text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-5 mt-6">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="btn-outline px-4 py-2 disabled:opacity-50"
        >
          ◀ Previous
        </button>

        <span>
          Page {page + 1} / {totalPages}
        </span>

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
          className="btn-outline px-4 py-2 disabled:opacity-50"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
