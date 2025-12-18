import { Link } from "react-router-dom";
import Laptop3D from "../../../components/3D/Laptop3D";

export default function HeroSection() {
  return (
    <section
      className="
        mt-[90px] rounded-2xl mx-auto max-w-7xl
        bg-gradient-to-r from-indigo-500 via-white-500 to-indigo-600
        text-white p-10 shadow-xl
        flex flex-col md:flex-row items-center justify-between
        gap-10
      "
    >
      {/* LEFT SIDE */}
      <div className="max-w-lg space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight drop-shadow">
          Welcome to <span className="text-indigo-900">CompatX</span>
        </h1>

        <p className="text-lg text-indigo-100">
          Your one-stop shop for premium laptop parts, PC components, and
          accessories.
        </p>

        <div className="flex gap-4 mt-6">
          <Link
            to="/products"
            className="bg-white text-indigo-700 font-semibold px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform"
          >
            Shop Now
          </Link>

          <Link
            to="/products?categoryId=4"
            className="bg-white text-indigo-700 font-semibold px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform"
          >
            Browse Accessories
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE – 3D MODEL PANEL */}
      <div
        className="
          relative w-[430px] h-[380px] rounded-2xl border-none
          bg-black/10 backdrop-blur-xl
          shadow-[0_0_80px_-20px_rgba(120,80,255,0.6)]
          flex items-center justify-center overflow-hidden
        "
      >
        {/* Glow Background */}
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle_at_center,rgba(120,80,255,0.35),transparent_70%)]
            blur-2xl opacity-80
          "
        />

        {/* Glass Panel */}
        <div
          className="
            relative bg-white/5 backdrop-blur-xl p-4 rounded-xl
            shadow-[0_0_40px_-10px_rgba(255,255,255,0.15)]
            w-[360px] h-[320px]
            flex items-center justify-center
          "
        >
          <Laptop3D />
        </div>
      </div>
    </section>
  );
}
