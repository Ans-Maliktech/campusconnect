import React, { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
// 1. Import Theme Provider
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import NavigationBar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AllListings from './pages/AllListings';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import ListingDetails from './pages/ListingDetails';
import NotFound from './pages/NotFound';

import './App.css';

/**
 * Custom Toaster wrapper that adapts to the current Theme
 */
const AppToaster = () => {
  const { theme } = useContext(ThemeContext);

  const toastStyle = {
    background: theme === 'dark' ? '#1e2538' : '#ffffff',
    color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
  };

  return (
    <Toaster 
      position="top-center" 
      toastOptions={{ 
        duration: 4000,
        style: toastStyle 
      }} 
    />
  );
};

const AppContent = () => {
  useContext(AuthContext);

  return (
    <>
      <div className="App d-flex flex-column min-vh-100">
        <NavigationBar />

        <main className="flex-grow-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/listings" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/listings" element={<AllListings />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Listing Details */}
            <Route path="/listing/:id" element={<ListingDetails />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-listing"
              element={
                <PrivateRoute>
                  <CreateListing />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-listing/:id"
              element={
                <PrivateRoute>
                  <EditListing />
                </PrivateRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer style={{
          background: 'var(--bg-surface)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '2rem 0',
          marginTop: '4rem',
          textAlign: 'center',
          transition: 'all 0.3s ease'
        }}>
          <div className="container">
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              © 2025 <span className="text-gradient" style={{ fontWeight: '700' }}>CampusConnect</span> by <span className="text-gradient">Ans Abdullah</span>. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      {/* 2. Wrap app in ThemeProvider */}
      <ThemeProvider>
        <Router>
          {/* 3. Use Custom Toaster */}
          <AppToaster />
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;