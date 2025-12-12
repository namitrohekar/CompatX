import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import { LogOut, User } from "lucide-react";

function AdminNavbar() {
  const { pathname } = useLocation();
  const { username, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const navLinks = [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Products", to: "/admin/products" },
    { label: "Categories", to: "/admin/categories" },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-violet-200 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/admin"
          className="font-semibold text-lg tracking-wide text-indigo-700 drop-shadow-[0_0_6px_rgba(99,102,241,0.6)] hover:scale-105 transition-transform"
        >
          CompatX
        </Link>

        {/* Nav Links */}
        {/* <div className="flex gap-8 text-sm font-medium">
          {navLinks.map(({ label, to }) => {
            const active = pathname === to;

            return (
              <Link
                key={label}
                to={to}
                className={`relative px-1 transition-all duration-200
                  ${active
                    ? "text-indigo-600 font-semibold drop-shadow-[0_0_6px_rgba(99,102,241,0.7)] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:bg-indigo-600 after:scale-x-100 after:transition-transform after:duration-300"
                    : "text-gray-600 hover:text-indigo-600 hover:drop-shadow-[0_0_6px_rgba(99,102,241,0.6)] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:bg-indigo-500 after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </div> */}

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <User size={18} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{username}</span>
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform ${showDropdown ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />

              {/* Dropdown content */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-900">{username}</p>
                  <p className="text-xs text-indigo-600">Admin</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

export default React.memo(AdminNavbar);