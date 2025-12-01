import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Private Route Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Show loader while checking authentication status
  if (loading) {
    return <Loader />;
  }

  // If user is authenticated, render the protected component
  // Otherwise, redirect to login page
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;