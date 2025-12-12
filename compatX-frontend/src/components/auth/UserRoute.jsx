import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

export default function UserRoute() {
  const { username, role } = useAuthStore();

  // Not logged in - redirect to login
  if (!username || !role) {
    return <Navigate to="/login" replace />;
  }

  // Admin trying to access user pages - redirect to admin dashboard
  if (role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Regular user - allow access
  return <Outlet />;
}