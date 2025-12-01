import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

/**
 * 404 Not Found Page
 * Displayed when user tries to access a non-existent route
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="text-center py-5">
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {/* 404 Error Display */}
        <h1 className="display-1 fw-bold text-primary" style={{ fontSize: '8rem' }}>
          404
        </h1>
        
        {/* Error Message */}
        <h2 className="mb-4">Oops! Page Not Found</h2>
        
        <p className="text-muted mb-4" style={{ maxWidth: '500px' }}>
          The page you're looking for doesn't exist or has been moved. 
          It might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Emoji for visual appeal */}
        <div className="mb-4" style={{ fontSize: '4rem' }}>
          📚🔍
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-3 flex-wrap justify-content-center">
          <Link to="/" className="btn btn-primary btn-lg">
            🏠 Go to Home
          </Link>
          
          <Link to="/listings" className="btn btn-outline-primary btn-lg">
            🛒 Browse Listings
          </Link>
          
          <Button 
            variant="outline-secondary" 
            size="lg"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-5">
          <p className="text-muted mb-2">Looking for something specific?</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/login" className="text-decoration-none">
              Login
            </Link>
            <span className="text-muted">•</span>
            <Link to="/signup" className="text-decoration-none">
              Sign Up
            </Link>
            <span className="text-muted">•</span>
            <Link to="/dashboard" className="text-decoration-none">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default NotFound;