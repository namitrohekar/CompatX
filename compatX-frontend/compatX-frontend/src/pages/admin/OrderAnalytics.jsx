import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Package,
    DollarSign,
    TrendingUp,
    ShoppingCart,
    CheckCircle,
    XCircle,
    Clock,
    Truck,
    ListOrdered,
} from "lucide-react";
import useOrderStore from "../../stores/useOrderStore";
import { FaJediOrder } from "react-icons/fa";
import { RiOrderPlayFill } from "react-icons/ri";

export default function OrderAnalytics() {
    const { orderStats, loading, fetchOrderStats } = useOrderStore();

    useEffect(() => {
        fetchOrderStats();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const stats = orderStats || {
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
    };

    const statCards = [
        {
            title: "Total Orders",
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: "bg-blue-500",
            textColor: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Total Revenue",
            value: `₹${stats.totalRevenue?.toFixed(2) || "0.00"}`,
            icon: DollarSign,
            color: "bg-green-500",
            textColor: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Pending Orders",
            value: stats.pendingOrders,
            icon: Clock,
            color: "bg-yellow-500",
            textColor: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            title: "Delivered Orders",
            value: stats.deliveredOrders,
            icon: CheckCircle,
            color: "bg-green-500",
            textColor: "text-green-600",
            bgColor: "bg-green-50",
        },
    ];

    const statusBreakdown = [
        {
            label: "Confirmed",
            value: stats.confirmedOrders,
            icon: CheckCircle,
            color: "text-blue-600",
        },
        {
            label: "Shipped",
            value: stats.shippedOrders,
            icon: Truck,
            color: "text-indigo-600",
        },
        {
            label: "Cancelled",
            value: stats.cancelledOrders,
            icon: XCircle,
            color: "text-red-600",
        },
    ];

    return (
        <div className="p-6 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Order Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Overview of your order statistics and revenue
                    </p>
                </div>
                <Link
                    to="/admin/orders"
                    className="btn-outline btn-primary text-white hover:text-black"
                >
                    <RiOrderPlayFill /> View All Orders
                </Link>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Breakdown */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold mb-6">Order Status Breakdown</h2>
                    <div className="space-y-4">
                        {statusBreakdown.map((item, idx) => {
                            const Icon = item.icon;
                            const percentage =
                                stats.totalOrders > 0
                                    ? ((item.value / stats.totalOrders) * 100).toFixed(1)
                                    : 0;

                            return (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-5 h-5 ${item.color}`} />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {item.value} ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${item.color.replace("text", "bg")}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold mb-6">Revenue Breakdown</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ₹{stats.totalRevenue?.toFixed(2) || "0.00"}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-600">Pending Revenue</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    ₹{stats.pendingRevenue?.toFixed(2) || "0.00"}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-600">Average Order Value</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    ₹
                                    {stats.totalOrders > 0
                                        ? (stats.totalRevenue / stats.totalOrders).toFixed(2)
                                        : "0.00"}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">Quick Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
                        <p className="text-sm text-gray-600 mt-1">Total Orders</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                        <p className="text-sm text-gray-600 mt-1">Pending</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{stats.deliveredOrders}</p>
                        <p className="text-sm text-gray-600 mt-1">Delivered</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">{stats.cancelledOrders}</p>
                        <p className="text-sm text-gray-600 mt-1">Cancelled</p>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="card p-6 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                    <Package className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Order Management Tips</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Process pending orders quickly to improve customer satisfaction</li>
                            <li>• Monitor cancelled orders to identify potential issues</li>
                            <li>• Track revenue trends to optimize your business strategy</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
