import React, { useEffect, useState } from 'react'
import axiosClient from '../../../lib/axiosClient';

import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard';

export default function PopularProducts() {

const [products , setProducts] = useState([]);
const [loading , setLoading] = useState(true);

useEffect(() =>{

    let mounted = true;
    const load = async ()=>{
        try {
            const res = await axiosClient.get("/products");
            const all = res.data?.data?.items || [];

            const sorted = [...all].sort((a,b) =>{
                const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
                const tb = b.createdAt ? Date.parse(b.createdAt) : 0;

                return tb-ta;
            });
            if(mounted) setProducts(sorted.slice(0,8));
        } catch (err) {
            
            console.error("popularProducts load failed :(" , err);
            if(mounted) setProducts([]);
        }
        finally{
            if(mounted) setLoading(false);
        }
    };

    load();

    return () =>{
        mounted = false;
    }

},[])

  const imageFor = (p) =>
    p?.imageUrl
      ? p.imageUrl.replace(
          "/upload/",
          "/upload/w_400,h_300,c_fill,q_auto,f_auto/"
        )
      : "/placeholder.png";


  return (
   <>
    <section className="max-w-7xl mx-auto px-6 mt-16 mb-20">
        <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-center 
        hover:underline hover:decoration-indigo-500 hover:scale-110 transition-transform ">
            Popular Products
        </h2>

        
        {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                key={i}
                className="h-48 bg-gray-200 animate-pulse rounded-xl"
                />
            ))}
            </div>
        )}

          
            {!loading && products.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                No products found.
                </div>
            )}

        
        {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
           

                {products.map((p) => (
                    <ProductCard 
                        key={p.id} 
                        product={{ ...p, imageUrl: imageFor(p) }} 
                    />

      ))}

            </div>
        )}
</section>

   
   
   
   </>
  )
}
