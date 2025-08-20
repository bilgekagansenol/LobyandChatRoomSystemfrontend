import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requirePremium = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requirePremium && !user?.is_premium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="card max-w-md mx-4 text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">Premium Required</h2>
          <p className="text-gray-400 mb-6">
            This feature is only available for premium users. Upgrade your account to access this content.
          </p>
          <button className="btn-premium">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;