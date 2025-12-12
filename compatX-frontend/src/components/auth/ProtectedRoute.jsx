import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

export default function ProtectedRoute() {
  
  const { username, role } = useAuthStore();

  // If not logged in, redirect to login
  if (!username || !role) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}