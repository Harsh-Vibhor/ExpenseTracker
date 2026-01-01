import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

/**
 * Protected route wrapper
 * - requires authentication
 * - optional role check for 'USER' or 'ADMIN'
 */
const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // If authenticated but wrong role, send to appropriate dashboard or login
    if (role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === 'USER') {
      return <Navigate to="/user/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
