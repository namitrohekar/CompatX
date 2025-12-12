import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

export default function AdminRoute() {
  const { username, role } = useAuthStore();

  // Not logged in at all - redirect to login
  if (!username || !role) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but NOT admin - show unauthorized
  if (role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Admin - allow access
  return <Outlet />;
}