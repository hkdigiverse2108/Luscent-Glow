import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { toast } from "sonner";

const AdminProtectedRoute = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the intended destination for post-login redirect
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!user?.isAdmin) {
    toast.error("Access Denied: Admin Privileges Required");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
