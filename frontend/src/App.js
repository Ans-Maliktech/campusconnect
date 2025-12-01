import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavigationBar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Import Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AllListings from './pages/AllListings';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import ProductDetails from './pages/ProductDetails';
import NotFound from './pages/NotFound'; // Import the 404 page

// Import Bootstrap CSS and Custom CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

/**
 * Main App Component
 * Sets up routing, authentication context, and application structure.
 */
function App() {
  return (
    // 1. AuthProvider wraps everything to provide user context
    <AuthProvider>
      <Router>
        {/* Main application container - Use d-flex and flex-column to ensure the footer sticks to the bottom */}
        <div className="App d-flex flex-column min-vh-100">
          
          {/* Navigation Bar - Visible on all pages */}
          <NavigationBar />

          {/* Main Content Area - flex-grow-1 ensures it fills the available space */}
          <main className="flex-grow-1">
            <Routes>
              
              {/* === Home Route - Redirects to Listings (Marketplace) === */}
              <Route path="/" element={<Navigate to="/listings" replace />} />

              {/* === Public Routes - Accessible without login === */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/listings" element={<AllListings />} />
              <Route path="/listings/:id" element={<ProductDetails />} />

              {/* === Protected Routes - Require authentication using PrivateRoute === */}
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

              {/* === Fallback Route (404) - Must be the last Route defined === */}
              <Route path="*" element={<NotFound />} />
              
            </Routes>
          </main>
          
          {/* Note: Footer component should be included here if you have one, outside of the <main> tag.
          
          <Footer /> 
          
          */}

        </div> 
        {/* 2. Closing the main App container div */}
      </Router>
    </AuthProvider>
  );
}

export default App;