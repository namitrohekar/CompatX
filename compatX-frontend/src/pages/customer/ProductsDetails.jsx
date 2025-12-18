// src/pages/customer/ProductDetails.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../../lib/axiosClient";
import AddToCartButton from "../../components/cart/AddToCartButton";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // MAIN PRODUCT
  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data.data;
        setProduct(p);

        // fetch related
        axiosClient
          .get(`/products/related`, {
            params: {
              categoryId: p.categoryId,
              excludeId: p.id,
            },
          })
          .then((r) => {
            setRelated(r.data.data || []);
          });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !product)
    return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 mt-[100px]">
      {/* PRODUCT MAIN SECTION */}
          <div className="flex flex-col md:flex-row gap-8 mb-12 overflow-hidden">
        <img
          src={product.imageUrl?.replace(
            "/upload/",
            "/upload/w_500,dpr_auto,f_auto,q_auto:good/"
          )}
          alt={product.productName}
          className="w-full md:w-[320px] h-[200px] object-contain rounded-xl bg-white shadow-sm p-3 hover:scale-[1.03] transition-transform
          duration-300"
        />

        <div className="flex-1 mt-4 md:mt-0">
          <h1 className="text-2xl font-bold">{product.productName}</h1>

          <div className="text-gray-600 mt-1">{product.brand}</div>

          <div className="text-2xl font-bold mt-4 text-indigo-600">
            ₹{product.price}
          </div>

          <p className="mt-4 leading-relaxed text-gray-700 text-sm md:text-base">
            {product.description}
            
         
          </p>
         <div className="mt-5 w-48">
      {product.stock > 0 ? (
        <AddToCartButton product={product} />
      ) : (
        <button
          disabled
          className="w-full py-2.5 rounded-lg bg-gray-400 text-white font-semibold cursor-not-allowed"
        >
          Out of Stock
    </button>
  )}
</div>

        </div>
      </div>


      {/* RELATED PRODUCTS */}
      <div className="mt-12 ">
        <h2 className="text-2xl font-semibold mb-6">Related Products</h2>

        {related.length === 0 ? (
          <div className="text-gray-500">No related products.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 ">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/products/${r.id}`}
                 className="rounded-xl border bg-white p-3 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
              >
                <img
                  src={r.imageUrl?.replace(
                    "/upload/",
                    "/upload/w_300,dpr_auto,f_auto,q_auto:good/"
                  )}
                  alt={r.productName}
                  className="w-full h-32 object-contain bg-white rounded mb-3"
                />

                <div className="font-medium text-sm">{r.productName}</div>
                <div className="text-xs text-gray-500">{r.brand}</div>

                <div className="font-semibold mt-1 text-indigo-700">
                  ₹{r.price}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
