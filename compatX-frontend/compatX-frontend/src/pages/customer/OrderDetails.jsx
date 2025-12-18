import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    Calendar,
    Truck,
    CheckCircle,
    XCircle,
    AlertCircle,
} from "lucide-react";
import useOrderStore from "../../stores/useOrderStore";
import useAuthStore from "../../stores/useAuthStore";
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

export default function OrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { username } = useAuthStore();
    const { currentOrder, loading, fetchOrderById, cancelOrder } = useOrderStore();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!username) {
            navigate("/login");
            return;
        }
        if (orderId) {
            fetchOrderById(orderId);
        }
    }, [orderId, username]);

    const handleCancelOrder = async () => {
        if (!cancellationReason.trim()) {
            toast.error("Please provide a cancellation reason");
            return;
        }

        setCancelling(true);
        const result = await cancelOrder(orderId, cancellationReason);

        if (result.success) {
            toast.success("Order cancelled successfully");
            setShowCancelModal(false);
            fetchOrderById(orderId); // Refresh order details
        } else {
            toast.error(result.error || "Failed to cancel order");
        }

        setCancelling(false);
    };

    if (!username) {
        return null;
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
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
            <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
                <div className="text-center py-16 bg-white rounded-lg border">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Order Not Found</h2>
                    <p className="text-gray-500 mb-6">The order you're looking for doesn't exist</p>
                    <Link
                        to="/orders"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        View All Orders
                    </Link>
                </div>
            </div>
        );
    }

    const StatusIcon = statusIcons[currentOrder.status] || Package;
    const canCancel = ["PENDING", "CONFIRMED"].includes(currentOrder.status);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 mt-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link
                        to="/orders"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-2"
                    >
                        <ArrowLeft size={20} />
                        Back to Orders
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Order #{currentOrder.orderId}</h1>
                    <p className="text-gray-600 mt-1">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Order Items & Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-lg border p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-indigo-600" />
                            Order Items ({currentOrder.totalItems || currentOrder.orderItems?.length})
                        </h2>

                        <div className="space-y-4">
                            {currentOrder.orderItems?.map((item, idx) => (
                                <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                                    <img
                                        src={item.product?.imageUrl}
                                        alt={item.product?.productName}
                                        className="w-24 h-24 object-cover rounded border"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                                            {item.product?.productName}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.product?.brand}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">₹{item.price} × {item.quantity}</p>
                                                <p className="font-semibold text-gray-900">₹{item.subtotal}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg border p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-600" />
                            Shipping Address
                        </h2>
                        <div className="text-gray-700">
                            <p className="font-semibold">{currentOrder.shippingAddress?.fullName}</p>
                            <p className="mt-1">{currentOrder.shippingAddress?.address}</p>
                            <p>
                                {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} -{" "}
                                {currentOrder.shippingAddress?.pincode}
                            </p>
                            <p className="mt-2">Phone: {currentOrder.shippingAddress?.phone}</p>
                            {currentOrder.shippingAddress?.landmark && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Landmark: {currentOrder.shippingAddress.landmark}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-lg border p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-600" />
                            Payment Information
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method</span>
                                <span className="font-medium">
                                    {currentOrder.paymentMethod === "CASH_ON_DELIVERY"
                                        ? "Cash on Delivery"
                                        : "Online Payment"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status</span>
                                <span
                                    className={`font-medium ${currentOrder.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"
                                        }`}
                                >
                                    {currentOrder.paymentStatus || "PENDING"}
                                </span>
                            </div>
                            {currentOrder.transactionId && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Transaction ID</span>
                                    <span className="font-mono text-xs">{currentOrder.transactionId}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Notes */}
                    {currentOrder.orderNotes && (
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-xl font-semibold mb-2">Order Notes</h2>
                            <p className="text-gray-700">{currentOrder.orderNotes}</p>
                        </div>
                    )}

                    {/* Cancellation Reason */}
                    {currentOrder.status === "CANCELLED" && currentOrder.cancellationReason && (
                        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                            <h2 className="text-xl font-semibold mb-2 text-red-800">Cancellation Reason</h2>
                            <p className="text-red-700">{currentOrder.cancellationReason}</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Order Summary & Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border p-6 sticky top-24 space-y-6">
                        {/* Order Summary */}
                        <div>
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
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
                                        <span className="text-indigo-600">₹{currentOrder.totalAmount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            {canCancel && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="w-full py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
                                >
                                    Cancel Order
                                </button>
                            )}

                            <Link
                                to="/orders"
                                className="block w-full py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Back to Orders
                            </Link>
                        </div>

                        {/* Order Timeline */}
                        <div className="pt-6 border-t">
                            <h3 className="font-semibold mb-3">Order Timeline</h3>
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

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-2">Cancel Order</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel this order? Please provide a reason.
                        </p>

                        <textarea
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows="4"
                            placeholder="Reason for cancellation..."
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {cancelling ? "Cancelling..." : "Cancel Order"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
