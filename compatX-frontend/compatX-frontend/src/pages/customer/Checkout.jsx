import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    MapPin, CreditCard, Truck, ArrowLeft, Package,
    AlertCircle, CheckCircle, Edit2, Plus
} from "lucide-react";
import useOrderStore from "../../stores/useOrderStore";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import profileService from "../../services/profileService";
import paymentService from "../../services/paymentService";
import stripeService from "../../services/stripeService";
import { toast } from "sonner";

export default function Checkout() {
    const navigate = useNavigate();
    const { username } = useAuthStore();
    const { currentOrder, loading, fetchOrderPreview, placeOrder } = useOrderStore();
    const { cart, fetchCart } = useCartStore();

    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
    const [useProfileAddress, setUseProfileAddress] = useState(true);
    const [orderNotes, setOrderNotes] = useState("");
    const [placing, setPlacing] = useState(false);

    // Razorpay integration state
    const [currentOrderId, setCurrentOrderId] = useState(null);

    // Manual address form
    const [manualAddress, setManualAddress] = useState({
        shippingFullName: "",
        shippingAddress: "",
        shippingCity: "",
        shippingState: "",
        shippingPincode: "",
        shippingPhone: "",
        shippingLandmark: "",
        alternatePhone: "",
    });

    useEffect(() => {
        if (!username) {
            navigate("/login");
            return;
        }

        // Try to fetch order preview first
        fetchOrderPreview();

        // Fallback: Also fetch cart in case preview doesn't work
        fetchCart();

        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        setLoadingProfile(true);
        const result = await profileService.getMyProfile();
        if (result.success && result.data) {
            setProfile(result.data);
            setUseProfileAddress(true);
        } else {
            setUseProfileAddress(false);
        }
        setLoadingProfile(false);
    };

    const handleManualAddressChange = (e) => {
        const { name, value } = e.target;
        setManualAddress(prev => ({ ...prev, [name]: value }));
    };

    const validateManualAddress = () => {
        const required = [
            "shippingFullName",
            "shippingAddress",
            "shippingCity",
            "shippingState",
            "shippingPincode",
            "shippingPhone"
        ];

        for (const field of required) {
            if (!manualAddress[field]?.trim()) {
                toast.error(`Please fill ${field.replace("shipping", "").replace(/([A-Z])/g, " $1").trim()}`);
                return false;
            }
        }
        return true;
    };

    // Load Razorpay Checkout script dynamically
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        if (!useProfileAddress && !validateManualAddress()) {
            return;
        }

        setPlacing(true);

        const orderData = {
            paymentMethod,
            orderNotes,
            useProfileAddress,
            ...(useProfileAddress ? {} : manualAddress),
        };

        const result = await placeOrder(orderData);

        if (result.success) {
            const placedOrderId = result.data?.orderId;
            setCurrentOrderId(placedOrderId);

            // RAZORPAY payment flow - Official Checkout.js integration
            if (paymentMethod === "RAZORPAY") {
                toast.success("Order created! Loading payment gateway...");

                // Load Razorpay script
                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    toast.error('Failed to load Razorpay SDK. Please try again.');
                    setPlacing(false);
                    return;
                }

                // Create payment order
                const paymentResult = await paymentService.createPaymentOrder(
                    placedOrderId,
                    result.data?.totalAmount || totalAmount
                );

                if (!paymentResult.success) {
                    toast.error("Failed to create payment order: " + paymentResult.error);
                    setPlacing(false);
                    return;
                }

                // Initialize Razorpay Checkout with official options
                const options = {
                    key: paymentResult.data.keyId,
                    amount: paymentResult.data.amount * 100, // Convert to paise
                    currency: paymentResult.data.currency,
                    name: 'CompatX',
                    description: `Order #${placedOrderId}`,
                    order_id: paymentResult.data.razorpayOrderId,
                    handler: async function (response) {
                        // Payment successful - verify on backend
                        const verifyResult = await paymentService.verifyPayment({
                            orderId: placedOrderId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        if (verifyResult.success) {
                            toast.success('Payment successful! Order confirmed.');
                            navigate(`/order-success/${placedOrderId}`);
                        } else {
                            toast.error('Payment verification failed: ' + verifyResult.error);
                            navigate('/orders');
                        }
                        setPlacing(false);
                    },
                    prefill: {
                        name: profile?.fullName || '',
                        email: profile?.email || '',
                        contact: profile?.phone || ''
                    },
                    theme: {
                        color: '#4F46E5' // Indigo color matching the app theme
                    },
                    modal: {
                        ondismiss: function () {
                            toast.info('Payment cancelled');
                            setPlacing(false);
                        }
                    }
                };

                // Open Razorpay Checkout
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error('Payment failed: ' + response.error.description);
                    setPlacing(false);
                });
                rzp.open();
            }
            // STRIPE payment flow
            else if (paymentMethod === "STRIPE") {
                toast.success("Order placed! Redirecting to Stripe Checkout...");

                const stripeResult = await stripeService.createCheckoutSession(
                    placedOrderId,
                    result.data?.totalAmount || totalAmount
                );

                if (!stripeResult.success) {
                    toast.error("Failed to initiate payment: " + stripeResult.error);
                    setPlacing(false);
                }
                // If successful, user will be redirected to Stripe
            }
            // COD payment flow
            else {
                toast.success("Order placed successfully!");
                if (placedOrderId) {
                    navigate(`/order-success/${placedOrderId}`);
                } else {
                    navigate("/orders");
                }
                setPlacing(false);
            }
        } else {
            toast.error(result.error || "Failed to place order");
            setPlacing(false);
        }
    };




    if (!username) {
        return null;
    }

    if (loading || loadingProfile) {
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

    // FALLBACK: Use cart data if order preview is not available
    const orderData = currentOrder || cart;
    const orderItems = orderData?.orderItems || orderData?.items || orderData?.cartItems || [];
    const hasItems = orderItems.length > 0;

    // Calculate totals if not provided by backend
    let subtotal = orderData?.subtotal || orderData?.totalPrice || 0;
    let taxAmount = orderData?.taxAmount || (subtotal * 0.18);
    let shippingCharges = orderData?.shippingCharges !== undefined
        ? orderData.shippingCharges
        : (subtotal >= 999 ? 0 : 49);
    let totalAmount = orderData?.totalAmount || (subtotal + taxAmount + shippingCharges);

    console.log(" Order Data:", orderData);
    console.log(" Items:", orderItems);
    console.log(" Subtotal:", subtotal);
    console.log(" Tax:", taxAmount);
    console.log("Shipping:", shippingCharges);
    console.log(" Total:", totalAmount);

    if (!orderData || !hasItems) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
                <div className="text-center py-16 bg-white rounded-lg border">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Items to Checkout</h2>
                    <p className="text-gray-500 mb-6">Your cart is empty. Add some products first!</p>
                    <Link
                        to="/products"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                        hover:text-white"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 mt-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-600 mt-1">Complete your order</p>
                </div>
                <Link
                    to="/cart"
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    <ArrowLeft size={20} />
                    Back to Cart
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Address & Payment */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-600" />
                            Shipping Address
                        </h3>

                        {profile ? (
                            <div className="space-y-4">
                                {/* Profile Address Option */}
                                <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${useProfileAddress ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:bg-gray-50"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="addressType"
                                        checked={useProfileAddress}
                                        onChange={() => setUseProfileAddress(true)}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{profile.fullName}</p>
                                            <Link
                                                to="/profile"
                                                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Edit2 size={14} />
                                                Edit
                                            </Link>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{profile.address}</p>
                                        <p className="text-sm text-gray-600">
                                            {profile.city}, {profile.state} - {profile.pincode}
                                        </p>
                                        <p className="text-sm text-gray-600">Phone: {profile.phone}</p>
                                        {profile.landmark && (
                                            <p className="text-sm text-gray-500">Landmark: {profile.landmark}</p>
                                        )}
                                    </div>
                                </label>

                                {/* Manual Address Option */}
                                <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${!useProfileAddress ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:bg-gray-50"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="addressType"
                                        checked={!useProfileAddress}
                                        onChange={() => setUseProfileAddress(false)}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold flex items-center gap-2">
                                            <Plus size={16} />
                                            Use Different Address
                                        </p>
                                        <p className="text-sm text-gray-500">Enter a new shipping address</p>
                                    </div>
                                </label>

                                {/* Manual Address Form */}
                                {!useProfileAddress && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                                        <input
                                            type="text"
                                            name="shippingFullName"
                                            placeholder="Full Name *"
                                            value={manualAddress.shippingFullName}
                                            onChange={handleManualAddressChange}
                                            className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="shippingAddress"
                                            placeholder="Address *"
                                            value={manualAddress.shippingAddress}
                                            onChange={handleManualAddressChange}
                                            className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="shippingCity"
                                            placeholder="City *"
                                            value={manualAddress.shippingCity}
                                            onChange={handleManualAddressChange}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="shippingState"
                                            placeholder="State *"
                                            value={manualAddress.shippingState}
                                            onChange={handleManualAddressChange}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="shippingPincode"
                                            placeholder="Pincode *"
                                            value={manualAddress.shippingPincode}
                                            onChange={handleManualAddressChange}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <input
                                            type="tel"
                                            name="shippingPhone"
                                            placeholder="Phone *"
                                            value={manualAddress.shippingPhone}
                                            onChange={handleManualAddressChange}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="shippingLandmark"
                                            placeholder="Landmark (Optional)"
                                            value={manualAddress.shippingLandmark}
                                            onChange={handleManualAddressChange}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <input
                                            type="tel"
                                            name="alternatePhone"
                                            placeholder="Alternate Phone (Optional)"
                                            value={manualAddress.alternatePhone}
                                            onChange={handleManualAddressChange}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 mb-4">No saved address found</p>
                                <div className="flex gap-3 justify-center">
                                    <Link
                                        to="/profile"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        Create Profile
                                    </Link>
                                    <button
                                        onClick={() => setUseProfileAddress(false)}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Enter Manually
                                    </button>
                                </div>

                                {!useProfileAddress && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <input
                                            type="text"
                                            name="shippingFullName"
                                            placeholder="Full Name *"
                                            value={manualAddress.shippingFullName}
                                            onChange={handleManualAddressChange}
                                            className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="shippingAddress"
                                            placeholder="Address *"
                                            value={manualAddress.shippingAddress}
                                            onChange={handleManualAddressChange}
                                            className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="shippingCity"
                                            placeholder="City *"
                                            value={manualAddress.shippingCity}
                                            onChange={handleManualAddressChange}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="shippingState"
                                            placeholder="State *"
                                            value={manualAddress.shippingState}
                                            onChange={handleManualAddressChange}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="shippingPincode"
                                            placeholder="Pincode *"
                                            value={manualAddress.shippingPincode}
                                            onChange={handleManualAddressChange}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="tel"
                                            name="shippingPhone"
                                            placeholder="Phone *"
                                            value={manualAddress.shippingPhone}
                                            onChange={handleManualAddressChange}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-600" />
                            Payment Method
                        </h3>

                        <div className="space-y-3">
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "CASH_ON_DELIVERY" ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:bg-gray-50"
                                }`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="CASH_ON_DELIVERY"
                                    checked={paymentMethod === "CASH_ON_DELIVERY"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mr-3"
                                />
                                <Truck className="w-5 h-5 mr-2 text-gray-600" />
                                <span className="font-medium">Cash on Delivery</span>
                            </label>

                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "STRIPE" ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:bg-gray-50"
                                }`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="STRIPE"
                                    checked={paymentMethod === "STRIPE"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mr-3"
                                />
                                <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                                <span className="font-medium">Pay Online (Stripe - Cards, UPI, Wallets)</span>
                            </label>

                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "RAZORPAY" ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:bg-gray-50"}`}>
                                <input type="radio" name="payment" value="RAZORPAY" checked={paymentMethod === "RAZORPAY"} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" />
                                <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                                <span className="font-medium">Pay Online (Razorpay - UPI, Cards, Net Banking)</span>
                            </label>
                        </div>
                    </div>

                    {/* Order Notes */}
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4">Order Notes (Optional)</h3>
                        <textarea
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                            placeholder="Any special instructions for delivery?"
                        />
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                        {/* Items */}
                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                            {orderItems.map((item) => (
                                <div key={item.cartItemId} className="flex gap-3 text-sm">
                                    <img
                                        src={item.product.imageUrl}
                                        alt={item.product.productName}
                                        className="w-16 h-16 object-cover rounded border"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium line-clamp-2">{item.product.productName}</p>
                                        <p className="text-gray-500">Qty: {item.quantity}</p>
                                        <p className="font-semibold">₹{item.subtotal}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pricing */}
                        <div className="space-y-2 text-sm border-t pt-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax (18%)</span>
                                <span className="font-medium">₹{taxAmount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium text-green-600">
                                    {shippingCharges === 0 ? "FREE" : `₹${shippingCharges}`}
                                </span>
                            </div>

                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-indigo-600">₹{totalAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={placing || (!useProfileAddress && !profile && !manualAddress.shippingFullName)}
                            className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
                        >
                            {placing ? "Placing Order..." : "Place Order"}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            By placing this order, you agree to our Terms & Conditions
                        </p>
                    </div>
                </div>
            </div>


        </div>
    );
}
