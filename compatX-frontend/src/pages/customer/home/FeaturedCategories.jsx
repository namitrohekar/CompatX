import { Link } from "react-router-dom";
import { Laptop, Monitor, Headphones, Cpu } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Laptop",
    icon: Laptop
  },
  {
    id: 2,
    name: "MacBook",
    icon: Monitor
  },
  {
    id: 4,
    name: "Accessories",
    icon: Headphones
  },
  {
    id: 5,
    name: "PC Component",
    icon: Cpu
  }
];

export default function FeaturedCategories() {
  return (
    <section className="max-w-7xl mx-auto mt-20 px-6">
      
      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center hover:scale-105 transition-transform
        hover:underline hover:decoration-indigo-500 ">
        Featured Categories
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map(({ id, name, icon: Icon }) => (
          <Link
            key={id}
            to={`/products?categoryId=${id}`}
            className="group p-6 rounded-xl bg-gradient-to-b from-indigo-400  to-indigo-600 shadow-md
                       border border-gray-200 hover:shadow-lg hover:bg-indigo-600/45
                       hover:scale-110
                       transition-all  h-48 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-full
                            
                            bg-indigo-200 text-indigo-600 mt-4 group-hover:bg-indigo-100 transition">
              <Icon size={28} />
            </div>

            <p className="text-white font-medium text-lg group-hover:text-white">
              {name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
