import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import CategoryList from "./pages/admin/CategoryList.jsx";
import CreateCatrogry from "./pages/admin/CreateCatrogry.jsx";
import CategoryEdit from "./pages/admin/CategoryEdit.jsx";
import ProductList from "./pages/admin/ProductList.jsx";
import ProductCreate from "./pages/admin/ProductCreate.jsx";
import ProductEdit from "./pages/admin/ProductEdit.jsx";
import ProductGallery from "./pages/customer/ProductGallery.jsx";
import ProductsDetails from "./pages/customer/ProductsDetails.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import Home from "./pages/customer/Home.jsx";
import CustomerLayout from "./components/layout/CustomerLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ErrorComponent from "./pages/shared/ErrorComponent.jsx";
import ProductView from "./pages/admin/ProductView.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails.jsx";
import OrderAnalytics from "./pages/admin/OrderAnalytics.jsx";
import About from "./pages/customer/home/About.jsx";
import Contact from "./pages/customer/home/Contact.jsx";
import AdminRoute from "./components/auth/AdminRoute.jsx";
import UserRoute from "./components/auth/UserRoute.jsx";
import Login from "./pages/shared/Login.jsx";
import TokenBootstrap from "./stores/TokenBootstrap.jsx";


import Profile from "./pages/customer/Profile.jsx";
import Orders from "./pages/customer/Orders.jsx";
import Cart from "./pages/customer/Cart.jsx";
import Unauthorized from "./pages/shared/Unauthorized.jsx";
import { Toaster } from "sonner";
import OrderDetails from "./pages/customer/OrderDetails.jsx";
import Checkout from "./pages/customer/Checkout.jsx";
import OrderSuccess from "./pages/customer/OrderSuccess.jsx";
import ForgotPassword from "./pages/shared/ForgotPassword.jsx";
import ResetPassword from "./pages/shared/ResetPassword.jsx";


const router = createBrowserRouter([
  // Login Route
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorComponent />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    errorElement: <ErrorComponent />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
    errorElement: <ErrorComponent />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />
  },

  // Admin Routes (Only Admins)
  {
    path: "/admin",
    element: <AdminRoute />,
    errorElement: <ErrorComponent />,
    children: [
      {

        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "categories",
            element: <CategoryList />,
          },
          {
            path: "categories/create",
            element: <CreateCatrogry />,
          },
          {
            path: "categories/edit/:id",
            element: <CategoryEdit />,
          },
          {
            path: "products",
            element: <ProductList />,
          },
          {
            path: "products/view/:id",
            element: <ProductView />,
          },
          {
            path: "products/create",
            element: <ProductCreate />,
          },
          {
            path: "products/edit/:id",
            element: <ProductEdit />,
          },
          {
            path: "orders",
            element: <AdminOrders />,
          },
          {
            path: "orders/:orderId",
            element: <AdminOrderDetails />,
          },
          {
            path: "analytics",
            element: <OrderAnalytics />,
          },
        ],
      },
    ],
  },

  // Customer Routes
  {
    path: "/",
    element: <CustomerLayout />,
    errorElement: <ErrorComponent />,
    children: [
      // Public Routes (Everyone can access)
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "products",
        element: <ProductGallery />,
      },
      {
        path: "products/:id",
        element: <ProductsDetails />,
      },

      // Protected User Routes , logged in users only 
      {
        element: <UserRoute />,
        children: [
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "orders",
            element: <Orders />,
          },
          {
            path: "cart",
            element: <Cart />,
          },
          {
            path: "orders/:orderId",
            element: <OrderDetails />,
          },
          {
            path: "checkout",
            element: <Checkout />,
          },
          {
            path: "order-success/:orderId",
            element: <OrderSuccess />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <TokenBootstrap>
    <Toaster richColors closeButton position="top-right" />
    <RouterProvider router={router} />
  </TokenBootstrap>
);