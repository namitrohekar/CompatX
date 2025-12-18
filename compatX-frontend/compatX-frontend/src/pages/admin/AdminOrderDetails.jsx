import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    AlertCircle,
    Truck,
} from "lucide-react";
import useOrderStore from "../../stores/useOrderStore";
import { toast } from "sonner";

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
    PROCESSING: "bg-purple-100 text-purple-800 border-purple-300",
    SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-300",
    OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-800 border-cyan-300",
    DELIVERED: "bg-green-100 text-green-800 border-green-300",
    CANCELLED: "bg-red-100 text-red-800 border-red-300",
    RETURNED: "bg-orange-100 text-orange-800 border-orange-300",
    REFUNDED: "bg-gray-100 text-gray-800 border-gray-300",
};

const statusIcons = {
    PENDING: AlertCircle,
    CONFIRMED: CheckCircle,
    PROCESSING: Package,
    SHIPPED: Truck,
    OUT_FOR_DELIVERY: Truck,
    DELIVERED: CheckCircle,
    CANCELLED: XCircle,
    RETURNED: Package,
    REFUNDED: CheckCircle,
};

export default function AdminOrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { currentOrder, loading, fetchOrderByIdAdmin, updateOrderStatus } = useOrderStore();
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState("");

    useEffect(() => {
        if (orderId) {
            fetchOrderByIdAdmin(orderId);
        }
    }, [orderId]);

    useEffect(() => {
        if (currentOrder) {
            setNewStatus(currentOrder.status);
        }
    }, [currentOrder]);

    const handleStatusUpdate = async () => {
        if (newStatus === currentOrder.status) {
            toast.info("Status is already set to " + newStatus);
            return;
        }

        setUpdating(true);
        const result = await updateOrderStatus(orderId, newStatus);

        if (result.success) {
            toast.success("Order status updated successfully");
            fetchOrderByIdAdmin(orderId); // Refresh
        } else {
            toast.error(result.error || "Failed to update status");
        }

        setUpdating(false);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!currentOrder) {
        return (
            <div className="p-6">
                <div className="card text-center py-16">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Order Not Found</h2>
                    <p className="text-gray-500 mb-6">The order you're looking for doesn't exist</p>
                    <Link
                        to="/admin/orders"
                        className="inline-block px-6 py-3 btn-outline btn-primary"
                    >
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const StatusIcon = statusIcons[currentOrder.status] || Package;

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        to="/admin/orders"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to Orders
                    </Link>
                    <h1 className="text-3xl font-semibold">Order #{currentOrder.orderId}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Placed on{" "}
                        {new Date(currentOrder.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </div>

                {/* Status Badge */}
                <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${statusColors[currentOrder.status] || "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                >
                    <StatusIcon size={20} />
                    <span className="font-semibold">{currentOrder.status}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order Items ({currentOrder.totalItems || currentOrder.orderItems?.length})
                        </h2>

                        <div className="space-y-4">
                            {currentOrder.orderItems?.map((item, idx) => (
                                <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                                    <img
                                        src={item.product?.imageUrl}
                                        alt={item.product?.productName}
                                        className="w-20 h-20 object-cover rounded border"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {item.product?.productName}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.product?.brand}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">
                                                    ₹{item.price} × {item.quantity}
                                                </p>
                                                <p className="font-semibold text-gray-900">₹{item.subtotal}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer & Shipping Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Customer
                            </h2>
                            <div className="text-gray-700">
                                <p className="font-semibold">{currentOrder.shippingAddress?.fullName}</p>
                                <p className="text-sm mt-2">Phone: {currentOrder.shippingAddress?.phone}</p>
                                {currentOrder.shippingAddress?.alternatePhone && (
                                    <p className="text-sm">Alt: {currentOrder.shippingAddress.alternatePhone}</p>
                                )}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Shipping Address
                            </h2>
                            <div className="text-gray-700 text-sm">
                                <p>{currentOrder.shippingAddress?.address}</p>
                                <p>
                                    {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} -{" "}
                                    {currentOrder.shippingAddress?.pincode}
                                </p>
                                {currentOrder.shippingAddress?.landmark && (
                                    <p className="text-gray-500 mt-1">
                                        Landmark: {currentOrder.shippingAddress.landmark}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Payment Method</p>
                                <p className="font-medium">
                                    {currentOrder.paymentMethod === "CASH_ON_DELIVERY"
                                        ? "Cash on Delivery"
                                        : "Online Payment"}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Payment Status</p>
                                <p
                                    className={`font-medium ${currentOrder.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"
                                        }`}
                                >
                                    {currentOrder.paymentStatus || "PENDING"}
                                </p>
                            </div>
                            {currentOrder.transactionId && (
                                <div className="col-span-2">
                                    <p className="text-gray-600">Transaction ID</p>
                                    <p className="font-mono text-xs">{currentOrder.transactionId}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Notes */}
                    {currentOrder.orderNotes && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-2">Order Notes</h2>
                            <p className="text-gray-700">{currentOrder.orderNotes}</p>
                        </div>
                    )}

                    {/* Cancellation Reason */}
                    {currentOrder.status === "CANCELLED" && currentOrder.cancellationReason && (
                        <div className="card p-6 bg-red-50 border border-red-200">
                            <h2 className="text-lg font-semibold mb-2 text-red-800">Cancellation Reason</h2>
                            <p className="text-red-700">{currentOrder.cancellationReason}</p>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Order Summary */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{currentOrder.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax (18%)</span>
                                <span className="font-medium">₹{currentOrder.taxAmount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium text-green-600">
                                    {currentOrder.shippingCharges === 0
                                        ? "FREE"
                                        : `₹${currentOrder.shippingCharges}`}
                                </span>
                            </div>

                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>₹{currentOrder.totalAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Update Status */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold mb-4">Update Status</h2>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="input w-full mb-4"
                        >
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

                        <button
                            onClick={handleStatusUpdate}
                            disabled={updating || newStatus === currentOrder.status}
                            className="btn-outline btn-primary w-full disabled:opacity-50"
                        >
                            {updating ? "Updating..." : "Update Status"}
                        </button>
                    </div>

                    {/* Order Timeline */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
                        <div className="space-y-3 text-sm">
                            {currentOrder.createdAt && (
                                <div className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Order Placed</p>
                                        <p className="text-gray-500 text-xs">
                                            {new Date(currentOrder.createdAt).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {currentOrder.confirmedAt && (
                                <div className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Order Confirmed</p>
                                        <p className="text-gray-500 text-xs">
                                            {new Date(currentOrder.confirmedAt).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {currentOrder.shippedAt && (
                                <div className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Order Shipped</p>
                                        <p className="text-gray-500 text-xs">
                                            {new Date(currentOrder.shippedAt).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {currentOrder.deliveredAt && (
                                <div className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Order Delivered</p>
                                        <p className="text-gray-500 text-xs">
                                            {new Date(currentOrder.deliveredAt).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {currentOrder.cancelledAt && (
                                <div className="flex items-start gap-2">
                                    <XCircle size={16} className="text-red-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Order Cancelled</p>
                                        <p className="text-gray-500 text-xs">
                                            {new Date(currentOrder.cancelledAt).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
