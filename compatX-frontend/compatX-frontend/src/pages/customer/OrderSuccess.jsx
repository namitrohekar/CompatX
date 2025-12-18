import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import useOrderStore from "../../stores/useOrderStore";

export default function OrderSuccess() {
    const { orderId } = useParams();
    const { currentOrder, fetchOrderById } = useOrderStore();

    useEffect(() => {
        if (orderId && orderId !== "success") {
            fetchOrderById(orderId);
        }
    }, [orderId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Success Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Thank you for your order. We'll send you a confirmation email shortly.
                    </p>

                    {/* Order Details */}
                    {currentOrder && (
                        <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-left">
                                    <p className="text-gray-600">Order ID</p>
                                    <p className="font-semibold text-gray-900">#{currentOrder.orderId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-600">Total Amount</p>
                                    <p className="font-semibold text-indigo-600 text-lg">
                                        ₹{currentOrder.totalAmount?.toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-left col-span-2">
                                    <p className="text-gray-600">Payment Method</p>
                                    <p className="font-semibold text-gray-900">
                                        {currentOrder.paymentMethod === "CASH_ON_DELIVERY"
                                            ? "Cash on Delivery"
                                            : "Online Payment"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/orders"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700  hover:text-white font-semibold transition-colors"
                        >
                            <Package size={20} />
                            View My Orders
                            <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/products"
                            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                        >
                            <Home size={20} />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t">
                        <p className="text-sm text-gray-500">
                            You can track your order status in the "My Orders" section
                        </p>
                    </div>
                </div>

                {/* What's Next */}
                <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span>You'll receive an order confirmation email</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span>We'll notify you when your order is shipped</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Track your order status anytime in "My Orders"</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
