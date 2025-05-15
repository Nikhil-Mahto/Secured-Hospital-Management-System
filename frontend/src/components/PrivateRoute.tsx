import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireRole }) => {
  const isLoggedIn = AuthService.isLoggedIn();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  if (requireRole && !AuthService.hasRole(requireRole)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

export default PrivateRoute; 