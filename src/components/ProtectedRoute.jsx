
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Handle Zero Point access
  if (role === "The Living Covenant" && !user.isZeroPoint) {
    return <Navigate to="/dashboard" />;
  }

  // Handle business dashboard access
  if (window.location.pathname === '/business-dashboard') {
    const hasApprovedBusiness = user.stewardData?.has_approved_business;
    if (!hasApprovedBusiness) {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
}

export default ProtectedRoute;
