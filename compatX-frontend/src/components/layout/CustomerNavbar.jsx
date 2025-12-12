import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogOut } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";

export default function CustomerNavbar() {
  const { pathname } = useLocation();
  const { username, logout } = useAuthStore();
  const { cartCount, fetchCartCount } = useCartStore();
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/products" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  const isLoggedIn = !!username;

  // Fetch cart count when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartCount();
    }
  }, [isLoggedIn, fetchCartCount]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-violet-200 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link
            to="/"
            className="font-semibold text-xl text-indigo-700 hover:scale-105 transition-transform"
          >
            CompatX
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex gap-8 text-sm font-medium">
            {navLinks.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  className={
                    "relative px-1 transition-all duration-200 " +
                    (active
                      ? "text-indigo-600 font-semibold after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:bg-indigo-600 after:scale-x-100 after:transition-transform after:duration-300"
                      : "text-gray-600 hover:text-indigo-600 after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:bg-indigo-500 after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">

            {/* Cart - ALWAYS VISIBLE */}
            <Link 
              to="/cart" 
              className="relative text-gray-700 hover:text-indigo-600 transition-colors"
              title={isLoggedIn ? `${cartCount} items in cart` : "View cart (login required)"}
            >
              <ShoppingCart size={20} />
              {/* Show count badge - 0 if not logged in */}
              <span className={`
                absolute -top-2 -right-2 
                ${cartCount > 0 ? 'bg-indigo-600' : 'bg-gray-400'}
                text-white text-[10px] px-1.5 py-0.5 
                rounded-full font-semibold 
                min-w-[18px] text-center
              `}>
                {isLoggedIn ? (cartCount > 99 ? '99+' : cartCount) : 0}
              </span>
            </Link>

            {/* User */}
            {isLoggedIn ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"
                >
                  <User size={20} />
                  <span className="text-sm font-medium">{username}</span>
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{username}</p>
                        <p className="text-xs text-gray-500">Customer</p>
                      </div>

                      <Link
                        to="/profile"
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User size={16} />
                        My Profile
                      </Link>

                      <Link
                        to="/orders"
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setShowDropdown(false)}
                      >
                        <ShoppingCart size={16} />
                        My Orders
                      </Link>

                      <Link
                        to="/cart"
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setShowDropdown(false)}
                      >
                        <ShoppingCart size={16} />
                        Cart {cartCount > 0 && `(${cartCount})`}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden md:block text-gray-700 hover:text-indigo-600 text-sm font-medium">
                Login / Register
              </Link>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="py-2 text-gray-700 hover:text-indigo-600"
                >
                  {n.label}
                </Link>
              ))}

              {/* Cart link in mobile */}
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="py-2 text-gray-700 hover:text-indigo-600 flex items-center gap-2"
              >
                <ShoppingCart size={16} />
                Cart {isLoggedIn && cartCount > 0 && `(${cartCount})`}
              </Link>

              {isLoggedIn ? (
                <>
                  <div className="border-t pt-3 mt-2">
                    <p className="text-sm font-semibold text-gray-900 mb-2">{username}</p>
                    
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="py-2 text-gray-700 hover:text-indigo-600 flex items-center gap-2"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setOpen(false)}
                      className="py-2 text-gray-700 hover:text-indigo-600 flex items-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="py-2 text-red-600 hover:text-red-700 flex items-center gap-2 w-full text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="py-2 text-indigo-600 font-medium"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}