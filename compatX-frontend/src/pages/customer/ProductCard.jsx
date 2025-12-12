import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import AddToCartButton from "../../components/cart/AddToCartButton";

export default function ProductCard({ product }) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      className="
        group 
        rounded-xl p-4
        bg-white/10 backdrop-blur-xl
        border border-white/20
        shadow-[0_8px_30px_rgba(0,0,0,0.15)]
        hover:shadow-indigo-300
        hover:scale-[1.03]
        transition-all duration-300
        relative
      "
    >
      {/* Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
          Out of Stock
        </div>
      )}

      {isLowStock && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
          Only {product.stock} left
        </div>
      )}

      {/* Clickable Product Area */}
      <Link to={`/products/${product.id}`} className="block">
        {/* IMAGE */}
        <div
          className="
            w-full h-40 
            rounded-lg overflow-hidden 
            bg-white
            flex items-center justify-center
            relative
            group-hover:ring-2 group-hover:ring-indigo-300
            transition-all
          "
        >
          <img
            src={product.imageUrl?.replace(
              "/upload/",
              "/upload/w_400,dpr_auto,f_auto,q_auto:good/"
            )}
            alt={product.productName}
            className="
              w-full h-full object-contain
              group-hover:scale-105 transition
            "
          />

          {/* View Overlay */}
          <div className="
            absolute inset-0 
            bg-black/0 group-hover:bg-black/20
            flex items-center justify-center
            opacity-0 group-hover:opacity-100
            transition-all duration-300
          ">
            {/* <div className="bg-white rounded-full p-2 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <Eye size={20} className="text-indigo-600" />
            </div> */}
          </div>
        </div>

        {/* NAME */}
        <div
          className="
            mt-4
            font-semibold 
            text-gray-900
            group-hover:text-indigo-700
            line-clamp-2
            min-h-[2.5rem]
          "
          title={product.productName}
        >
          {product.productName}
        </div>

        {/* BRAND */}
        <div className="text-sm text-gray-600 mt-1">
          {product.brand}
        </div>

        {/* PRICE */}
        <div className="mt-2 text-lg font-bold text-indigo-700">
          ₹{product.price?.toLocaleString()}
        </div>
      </Link>

      {/* ADD TO CART BUTTON */}
      <AddToCartButton
        productId={product.id}
        productName={product.productName}
        availableStock={product.stock}
        className="mt-3 w-full"
      />

    </div>
  );
}
