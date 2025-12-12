import React, { useEffect, useState, useCallback } from "react";
import axiosClient from "../../lib/axiosClient";
import adminProductService from "../../services/adminProductService";

export default function AdminDashboard() {
  // State management
  // const [stats, setStats] = useState({
  //   totalProducts: 0,
  //   totalCategories: 0,
  //   totalBrands: 0,
  // });

  const [statValues, setStatValues] = useState([
    { label: "Total Products", value: 0 },
    { label: "Total Categories", value: 0 },
    { label: "Total Brands", value: 0 },
  ])

  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch dashboard data with retry logic
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Parallel requests with proper error handling
      // const [statsRes, productsRes] = await Promise.all([
      //   axiosClient.get("/admin/products/stats").catch(err => {
      //     console.error("Stats API error:", err);
      //     throw new Error("Failed to load statistics");
      //   }),
      //   adminProductService.getProducts(0, 100).catch(err => {
      //     console.error("Products API error:", err);
      //     throw new Error("Failed to load products");
      //   })
      // ]);

      const statsRes = await axiosClient.get("/admin/products/stats")
      const productsResult = await adminProductService.getProducts(0, 100)

      // Handle stats with proper validation
      const statsData = statsRes?.data?.data;

      if (statsData && productsResult.success) {
        // Use admin's own product count from paginated response
        const adminProductCount = productsResult.data.totalElements || 0;

        // console.table(productsResult)
        // Categories are global (fixed, shared across admins)
        const totalCategories = statsData.totalCategories || 0;

        // const totalBrands = statsData.totalBrands || 0;

        setStatValues([
          { label: "My Products", value: adminProductCount },
          // { label: "Total Categories", value: totalCategories },
          // {label: "Total Brands" , value: totalBrands}
        ]);
      }

      // Handle products with sorting

      const productsData = productsResult.success ? productsResult.data.items : [];


      // console.log("📦 Products received:", productsData); // DEBUG
      // console.log("📦 Products count:", productsData?.length); // DEBUG
      if (Array.isArray(productsData) && productsData.length > 0) {
        // Sort by createdAt if available, otherwise keep original order
        const sorted = [...productsData].sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0; // Keep original order if no createdAt
        });
        setRecentProducts(sorted.slice(0, 10));
      } else {
        setRecentProducts([]);
      }

      setLoading(false);
      setRetryCount(0); // Reset retry count on success

    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err.message || "Failed to load dashboard data");
      setLoading(false);

      // Auto-retry logic (max 2 retries)
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
      }
    }
  }, [retryCount]);

  // Load data on mount and retry
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Manual retry handler
  const handleRetry = () => {
    setRetryCount(0);
    fetchDashboardData();
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-10 animate-fade-in">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard Overview</h1>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>

        {/* Skeleton table */}
        <div className="card p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && retryCount >= 2) {
    return (
      <div className="space-y-10 animate-fade-in">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard Overview</h1>

        <div className="card p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Failed to Load Dashboard</h2>
          <p className="text-[hsl(var(--color-muted))] mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-[hsl(var(--color-primary))] text-white rounded-lg hover:opacity-90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Stat cards data
  // const statCards = [
  //   { label: "Total Products", value: stats.totalProducts },
  //   { label: "Total Categories", value: stats.totalCategories},
  //   { label: "Total Brands", value: stats.totalBrands },
  // ];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard Overview</h1>
        {/* <button
          onClick={handleRetry}
          className="px-4 py-2 text-sm border border-[hsl(var(--color-border))] rounded-lg hover:bg-[hsl(var(--color-border))]/30 transition"
          title="Refresh dashboard"
        >
          🔄 Refresh
        </button> */}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {statValues.map((item, idx) => (
          <div
            key={idx}
            className="card hover:scale-[1.01] transition-transform duration-300"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-4xl font-bold text-[hsl(var(--color-primary))]">
                  {item.value}
                </div>
                {/* <span className="text-3xl">{item.icon}</span> */}
              </div>
              <div className="text-[hsl(var(--color-muted))] mt-1">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Products</h2>
          <span className="text-sm text-[hsl(var(--color-muted))]">
            Last 10 added
          </span>
        </div>

        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full text-sm border-collapse">
            <thead className="table-header uppercase text-xs">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Brand</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Stock</th>
              </tr>
            </thead>

            <tbody>
              {recentProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-[hsl(var(--color-muted))] text-center py-8"
                  >
                    <div className="text-4xl mb-2">📭</div>
                    <div>No products found.</div>
                  </td>
                </tr>
              ) : (
                recentProducts.map((p, i) => (
                  <tr
                    key={p.id || i}
                    className="border-b border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-border))]/30 transition"
                  >
                    <td className="p-3 text-gray-600">{i + 1}</td>

                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl.replace(
                              "/upload/",
                              "/upload/w_60,h_60,c_fill/"
                            )}
                            alt={p.productName}
                            className="w-10 h-10 rounded object-cover border border-[hsl(var(--color-border))]"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' dy='.3em'%3E📦%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-xl">
                            📦
                          </div>
                        )}
                        <span className="font-medium">{p.productName || "Unnamed Product"}</span>
                      </div>
                    </td>

                    <td className="p-3 text-gray-600">{p.brand || "N/A"}</td>
                    <td className="p-3 font-medium">₹{(p.price || 0).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={p.stock > 5 ? "text-green-600" : "text-red-600"}>
                        {p.stock || 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}