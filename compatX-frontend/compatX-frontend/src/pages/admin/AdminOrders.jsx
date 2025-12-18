import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Eye, Filter, Search, Calendar, Package, ChartNoAxesCombined, Edit2Icon, Edit, Edit2 } from "lucide-react";
import useOrderStore from "../../stores/useOrderStore";
import { log } from "three";

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

// Debounce utility
const debounce = (fn, delay = 400) => {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
};

export default function AdminOrders() {
    const { orders, loading, fetchAllOrders } = useOrderStore();

    // FILTERS
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("");

    // SORT
    const [sortField, setSortField] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("desc");

    // PAGING
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchOrders = useCallback(async () => {
        const filters = {
            keyword: keyword || null,
            status: status || null,
            sortField,
            sortDirection,
            page,
            size,
        };

        await fetchAllOrders(filters);
    }, [keyword, status, sortField, sortDirection, page, size]);

    const debouncedFetch = useCallback(debounce(fetchOrders, 350), [fetchOrders]);

    useEffect(() => {
        if (keyword.trim() !== "") debouncedFetch();
        else fetchOrders();
    }, [keyword, status, sortField, sortDirection, page]);

    const resetFilters = () => {
        setKeyword("");
        setStatus("");
        setSortField("createdAt");
        setSortDirection("desc");
        setPage(0);
    };
    console.log(orders)
    return (
        <div className="p-6 space-y-8 animate-fade-in">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Manage Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage all customer orders
                    </p>
                </div>
                <Link
                    to="/admin/analytics"
                    className="btn-outline btn-primary text-white hover:text-black"
                >
                    <ChartNoAxesCombined /> View Analytics
                </Link>
            </div>

            {/* FILTER BAR */}
            <div className="card p-4 flex flex-wrap gap-6 items-end">
                {/* Search */}
                <div className="flex flex-col">
                    <label className="text-xs font-medium">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            className="input pl-10"
                            placeholder="Order ID, Customer..."
                            value={keyword}
                            onChange={(e) => {
                                setPage(0);
                                setKeyword(e.target.value);
                            }}
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col">
                    <label className="text-xs font-medium">Status</label>
                    <select
                        className="input"
                        value={status}
                        onChange={(e) => {
                            setPage(0);
                            setStatus(e.target.value);
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="RETURNED">Returned</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>
                </div>

                {/* Sort Field */}
                <div className="flex flex-col">
                    <label className="text-xs font-medium">Sort By</label>
                    <select
                        className="input"
                        value={sortField}
                        onChange={(e) => {
                            setPage(0);
                            setSortField(e.target.value);
                        }}
                    >
                        <option value="createdAt">Order Date</option>
                        <option value="totalAmount">Total Amount</option>
                        <option value="status">Status</option>
                    </select>
                </div>

                {/* Sort Direction */}
                <div className="flex flex-col">
                    <label className="text-xs font-medium">Direction</label>
                    <select
                        className="input"
                        value={sortDirection}
                        onChange={(e) => {
                            setPage(0);
                            setSortDirection(e.target.value);
                        }}
                    >
                        <option value="desc">DESC ↓</option>
                        <option value="asc">ASC ↑</option>
                    </select>
                </div>

                {/* Reset */}
                <button className="btn-outline px-4 py-2" onClick={resetFilters}>
                    Reset
                </button>

                <div className="ml-auto text-sm text-gray-500">
                    Orders: {orders.length}
                </div>
            </div>

            {/* TABLE */}
            <div className="card overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                    <thead className="table-header text-xs uppercase">
                        <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Items</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-10 text-gray-500">
                                    Loading orders...
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-10 text-gray-500">
                                    <Package size={48} className="mx-auto text-gray-300 mb-2" />
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.orderId} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-semibold">#{order.orderId}</td>

                                    <td className="p-3">
                                        <div>
                                            <p className="font-medium">{order.shippingAddress?.fullName }</p>
                                            <p className="text-xs text-gray-500">{order.shippingAddress?.phone}</p>
                                        </div>
                                    </td>

                                    <td className="p-3">
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="p-3">{order.totalItems || order.orderItems?.length || 0}</td>

                                    <td className="p-3 font-semibold">₹{order.totalAmount?.toFixed(2)}</td>

                                    <td className="p-3">
                                        <span className="text-xs">
                                            {order.paymentMethod === "CASH_ON_DELIVERY" ? "COD" : "Online"}
                                        </span>
                                    </td>

                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>

                                    <td className="p-3 text-center">
                                        <Link to={`/admin/orders/${order.orderId}`}>
                                            <Edit size={18} className="inline text-gray-500 hover:text-blue-600" />
                                        </Link>
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
                    Page {page + 1} / {totalPages || 1}
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
