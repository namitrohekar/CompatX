import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  ListOrdered,
  PlusSquare,
  LogOut,
  Menu,
  Package,
  BarChart3,
} from "lucide-react";
import AdminNavbar from "./AdminNavbar";


const NavItem = React.memo(function NavItem({ to, icon: Icon, label, active, collapsed }) {
  return (
    <Link
      to={to}
      className={`flex items-center ${collapsed ? "justify-center" : "justify-start gap-3"
        } px-3 py-2 rounded-md transition-all ${active
          ? "bg-indigo-500 text-white font-semibold"
          : "text-gray-700 hover:bg-indigo-500 hover:text-white"
        }`}
    >
      <Icon size={22} strokeWidth={2} />
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  );
});




function AdminLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();

  return (
    <>

      <AdminNavbar />

      <div className="flex bg-gray-50 pt-[64px] min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div
          className={`${collapsed ? "w-20 px-3" : "w-64 px-2"
            } bg-white border-r shadow-sm flex flex-col justify-between  h-[calc(100vh-64px)] transition-all duration-300`}
        >
          {/* Top Section */}
          <div>
            <div className="flex items-center justify-between px-4 py-4 border-b">
              {!collapsed && <span className="text-lg font-semibold hover:scale-105 transition-transform cursor-context-menu">Admin</span>}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-gray-600 hover:text-black"
              >
                <Menu size={22} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col items-center md:items-start mt-4 space-y-1">
              <NavItem
                to="/admin/dashboard"
                icon={LayoutDashboard}
                label="Dashboard"
                collapsed={collapsed}
                active={location.pathname.startsWith("/admin/dashboard")}
              />
              <NavItem
                to="/admin/products"
                icon={Box}
                label="Products"
                collapsed={collapsed}
                active={location.pathname === "/admin/products"}
              />

              <NavItem
                to="/admin/products/create"
                icon={PlusSquare}
                label="Add Product"
                collapsed={collapsed}
                active={location.pathname.startsWith("/admin/products/create")}
              />
              <NavItem
                to="/admin/categories"
                icon={ListOrdered}
                label="Categories"
                collapsed={collapsed}
                active={location.pathname.startsWith("/admin/categories")}
              />
              <NavItem
                to="/admin/orders"
                icon={Package}
                label="Orders"
                collapsed={collapsed}
                active={location.pathname.startsWith("/admin/orders")}
              />
              <NavItem
                to="/admin/analytics"
                icon={BarChart3}
                label="Analytics"
                collapsed={collapsed}
                active={location.pathname.startsWith("/admin/analytics")}
              />
            </nav>
          </div>

          {/* Footer */}
          {/* <div className="border-t p-3 flex justify-center md:justify-start">
            <button className="flex items-center gap-3 text-gray-600 hover:text-black">
              <LogOut size={22} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div> */}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
          <div className="p-6">
            <Outlet />

          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(AdminLayout);
