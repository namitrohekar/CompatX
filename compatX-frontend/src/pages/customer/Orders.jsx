import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Eye, Filter, Search, Calendar } from "lucide-react";
import useOrderStore from "../../stores/useOrderStore";
import useAuthStore from "../../stores/useAuthStore";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-orange-100 text-orange-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
};

export default function MyOrders() {
  const { username } = useAuthStore();
  const { orders, loading, fetchUserOrders } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (username) {
      fetchUserOrders();
    }
  }, [username]);

  const filteredOrders = (orders || []).filter(order => order).filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.orderId?.toString().includes(searchTerm) ||
      order.orderItems?.some((item) =>
        item.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!username) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <div className="text-center py-16 bg-white rounded-lg border">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Login to View Orders</h2>
          <p className="text-gray-500 mb-6">Sign in to see your order history</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Login / Register
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 mt-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-1">
          {orders.length === 0
            ? "No orders yet"
            : `${orders.length} order${orders.length > 1 ? "s" : ""} found`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by Order ID or Product Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                >
                  <option value="ALL">All Orders</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-500">No orders match your filters</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    {/* Order Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={16} />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        ₹{order.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                    {order.orderItems?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex-shrink-0">
                        <img
                          src={item.product?.imageUrl}
                          alt={item.product?.productName}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                    ))}
                    {order.orderItems?.length > 3 && (
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          +{order.orderItems.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{order.totalItems || order.orderItems?.length}</span> item
                      {(order.totalItems || order.orderItems?.length) > 1 ? "s" : ""} •{" "}
                      <span className="font-medium">
                        {order.paymentMethod === "CASH_ON_DELIVERY" ? "COD" : "Online"}
                      </span>
                    </div>

                    <Link
                      to={`/orders/${order.orderId}`}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:text-white font-medium transition-colors"
                    >
                      <Eye size={16} />
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
