import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, LogIn } from "lucide-react";
import useCartStore from "../../stores/useCartStore";
import useAuthStore from "../../stores/useAuthStore";
import { toast } from "sonner";

export default function Cart() {
  const { cart, loading, fetchCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { username } = useAuthStore();
  const [processingItems, setProcessingItems] = useState(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (username) {
      fetchCart();
    }
  }, [username, fetchCart]);

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    setProcessingItems(prev => new Set(prev).add(cartItemId));
    const result = await updateQuantity(cartItemId, newQuantity);
    setProcessingItems(prev => {
      const next = new Set(prev);
      next.delete(cartItemId);
      return next;
    });

    if (!result.success) {
      toast.error(result.error || "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (cartItemId, productName) => {
    toast.info(`Remove ${productName} from cart?`, {
      action: {
        label: "Remove",
        onClick: async () => {
          setProcessingItems(prev => new Set(prev).add(cartItemId));

          const result = await removeItem(cartItemId);

          setProcessingItems(prev => {
            const next = new Set(prev);
            next.delete(cartItemId);
            return next;
          });

          if (result.success) {
            toast.success(`${productName} removed from cart`);
          } else {
            toast.error(result.error || `Failed to remove ${productName}`);
          }
        }
      },
    });
  };




  const handleClearCart = async () => {
    const result = await clearCart();
    setShowClearConfirm(false);

    if (result.success) {
      toast.success("Cart cleared successfully");
    } else {
      toast.error(result.error || "Failed to clear cart");
    }

  };

  //  NOT LOGGED IN - Show login prompt
  if (!username) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 mt-15 ">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link
            to="/products"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </Link>
        </div>

        {/* Login Required Message */}
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <LogIn size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Login to View Your Cart</h2>
          <p className="text-gray-500 mb-6">
            Sign in to add items to your cart and start shopping!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Login / Register
            </Link>
            <Link
              to="/products"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  //  LOADING STATE
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-2 mt-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 ">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">
            {isEmpty ? "Your cart is empty" : `${cart.totalItems} item${cart.totalItems > 1 ? 's' : ''} in cart`}
          </p>
        </div>
        <Link
          to="/products"
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ArrowLeft size={20} />
          Continue Shopping
        </Link>
      </div>

      {isEmpty ? (
        // Empty cart (but logged in)
        <div className="text-center py-16 bg-white rounded-lg border">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started!</p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const isProcessing = processingItems.has(item.cartItemId);
              const product = item.product;
              const isOutOfStock = product.availableStock === 0;
              const isLowStock = product.availableStock < item.quantity;

              return (
                <div
                  key={item.cartItemId}
                  className={`bg-white rounded-lg border p-4 transition-opacity ${isProcessing ? 'opacity-50' : ''}`}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link to={`/products/${product.productId}`} className="flex-shrink-0">
                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${product.productId}`}
                        className="font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2"
                      >
                        {product.productName}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{product.brand}</p>

                      {/* Stock warning */}
                      {isOutOfStock && (
                        <p className="text-sm text-red-600 mt-2 font-medium">Out of stock</p>
                      )}
                      {!isOutOfStock && isLowStock && (
                        <p className="text-sm text-orange-600 mt-2">
                          Only {product.availableStock} left in stock
                        </p>
                      )}

                      {/* Price */}
                      <div className="mt-2">
                        <span className="text-lg font-bold text-gray-900">₹{item.priceAtAdd}</span>
                        {product.currentPrice !== item.priceAtAdd && (
                          <span className="ml-2 text-sm text-gray-500">
                            (Current: ₹{product.currentPrice})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end justify-between relative mt-2 ">
                      <button
                        onClick={() => handleRemoveItem(item.cartItemId, item.product.productName)}
                        disabled={isProcessing}
                        className="text-red-500 font-semibold hover:text-red-700 absolute  disabled:opacity-50 -top-5 -right-3"
                        title="Remove from cart"
                      >
                        <Trash2 size={20} />
                      </button>

                      <div className="flex items-center gap-2 border rounded-lg mt-2">
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                          disabled={isProcessing || item.quantity <= 1}
                          className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-3 py-1 font-medium min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                          disabled={isProcessing || item.quantity >= product.availableStock}
                          className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed "
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right mt-2">
                        <p className="text-sm text-gray-500">Subtotal</p>
                        <p className="text-lg font-bold text-gray-900">₹{item.subtotal}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clear Cart Button */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full py-2 text-sm text-red-600 hover:text-red-900 font-medium border border-red-200 rounded-lg hover:bg-red-500 transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{cart.totalPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="font-medium">₹{(cart.totalPrice * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">
                    {cart.totalPrice >= 999 ? "FREE" : "₹49"}
                  </span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-indigo-600">
                      ₹{(cart.totalPrice * 1.18 + (cart.totalPrice >= 999 ? 0 : 49)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <Link to={"/checkout"}>
                <button
                  disabled={items.some(item => item.product.availableStock === 0)}
                  className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  Proceed to Checkout
                </button>
              </Link>
              <p className="text-xs text-gray-500 text-center mt-4">
                Secure checkout powered by CompatX
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold mb-2">Clear Cart?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
