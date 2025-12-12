import React, { useState } from "react";
import useCartStore from "../../stores/useCartStore";
import useAuthStore from "../../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Check, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function AddToCartButton({
  productId,
  productName,
  availableStock,
  className = "",
  size = "default", // small | default | large
}) {
  const { addToCart } = useCartStore();
  const { username } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const isOutOfStock = availableStock === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Not logged in
    if (!username) {
      toast("Login required to add items to cart", {
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    // Out of stock
    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    setLoading(true);

    const result = await addToCart(productId, 1);

    setLoading(false);

    if (result.success) {
      setAdded(true);

      toast.success(`${productName} added to cart`);

      setTimeout(() => setAdded(false), 2000);
    } else {
      toast.error(result.error || "Failed to add to cart");
    }
  };

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || isOutOfStock || added}
      className={`
        ${sizeClasses[size]}
        ${
          isOutOfStock
            ? "bg-gray-900 cursor-not-allowed"
            : added
            ? "bg-green-600 hover:bg-green-700"
            : "bg-indigo-600 hover:bg-indigo-700"
        }
        w-full text-white rounded-lg font-semibold transition-all
        duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Adding...
        </>
      ) : added ? (
        <>
          <Check size={20} />
          Added to Cart
        </>
      ) : isOutOfStock ? (
        "Out of Stock"
      ) : (
        <>
          <ShoppingCart size={20} />
          Add to Cart
        </>
      )}
    </button>
  );
}
