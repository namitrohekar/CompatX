export default function ErrorComponent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white px-6 select-none">
      
      
      <h1
        className="text-9xl font-extrabold tracking-[10px] text-red-600 drop-shadow-[0_0_25px_rgba(255,0,0,0.7)]
                   animate-pulse-slow"
      >
        404
      </h1>

      
      <p className="mt-4 text-2xl text-gray-300 animate-fade-in">
        Page Not Found <span className="text-red-400">:(</span>
      </p>

      <p className="text-gray-500 mt-1">
        The page you’re looking for doesn't exist.
      </p>

      <button
        onClick={() => (window.location.href = "/")}
        className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg
                   shadow-lg hover:shadow-red-600/50 transition-all duration-300"
      >
        Go to Homepage
      </button>
    </div>
  );
}
