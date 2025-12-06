import React, { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
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

// Import Bootstrap CSS and Custom CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

/**
 * Main Content Wrapper
 * Uses Context to enable authentication logic
 */
const AppContent = () => {
  const { user, setUser } = useContext(AuthContext);

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
            {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
            
            {/* Listing Details (Dynamic Route) */}
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

        {/* Footer */}
        <footer style={{
          background: 'rgba(26, 26, 36, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2rem 0',
          marginTop: '4rem',
          textAlign: 'center'
        }}>
          <div className="container">
            <p style={{ margin: 0, color: '#a0a0b8', fontSize: '0.875rem' }}>
              © 2025 <span className="text-gradient" style={{ fontWeight: '700' }}>CampusConnect</span> by <span className="text-gradient">Ans Abdullah</span>. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

/**
 * Main App Component
 * Sets up routing, authentication context, and application structure.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;