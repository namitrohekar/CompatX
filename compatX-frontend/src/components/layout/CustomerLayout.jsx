
import { Navigate, Outlet } from "react-router-dom"
import CustomerNavbar from "./CustomerNavbar"
import Footer from "../Footer"
import ScrollToTop from "../../lib/ScrollToTOp"
import useLenis from "../../lib/useLenis"
import useAuthStore from "../../stores/useAuthStore";
import Snowfall from "react-snowfall"


export default function CustomerLayout() {



  useLenis();


  const { role } = useAuthStore();

  // If admin tries to access customer pages, redirect to admin dashboard
  if (role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return (
    <div className="min-h-screen flex flex-col">
    {/* <Snowfall /> */}
      <ScrollToTop />
      <CustomerNavbar />

      <div className="flex-1 mt-6">
        <Outlet />
      </div>

      <Footer />
    </div>
  )
}
