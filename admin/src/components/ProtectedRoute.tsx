import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps protected admin routes. If the user is not authenticated, they are
 * redirected to the login page. Otherwise the requested component hierarchy is
 * rendered via <Outlet />.
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
