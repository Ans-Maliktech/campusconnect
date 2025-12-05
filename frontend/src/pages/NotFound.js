import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

/**
 * 404 Not Found Page - Modern Dark Theme
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="text-center py-5">
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* 404 Display with Gradient */}
        <h1 
          className="display-1 fw-bold text-gradient animate-fade-in" 
          style={{ 
            fontSize: '10rem',
            lineHeight: 1,
            marginBottom: '2rem'
          }}
        >
          404
        </h1>
        
        {/* Error Message */}
        <h2 className="mb-4 animate-fade-in stagger-1" style={{ color: 'var(--color-text-primary)' }}>
          Page Lost in the Digital Void
        </h2>
        
        <p className="text-muted mb-4 animate-fade-in stagger-2" style={{ 
          maxWidth: '500px',
          fontSize: '1.125rem',
          color: 'var(--color-text-secondary)'
        }}>
          The page you're looking for doesn't exist or has been moved to another dimension.
        </p>

        {/* Icon */}
        <div className="mb-5 animate-fade-in stagger-3" style={{ fontSize: '4rem', opacity: 0.7 }}>
          🔍📚
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-3 flex-wrap justify-content-center animate-fade-in stagger-4">
          <Link to="/" className="btn btn-primary">
            🏠 Return Home
          </Link>
          
          <Link to="/listings" className="btn btn-outline-primary">
            🛒 Browse Marketplace
          </Link>
          
          <Button 
            variant="ghost"
            className="btn-ghost"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-5 animate-fade-in stagger-5">
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            QUICK NAVIGATION
          </p>
          <div className="d-flex gap-4 justify-content-center flex-wrap">
            <Link to="/login" style={{ 
              color: 'var(--color-text-secondary)', 
              textDecoration: 'none',
              transition: 'color 0.3s'
            }}>
              Login
            </Link>
            <span style={{ color: 'var(--color-text-muted)' }}>•</span>
            <Link to="/signup" style={{ 
              color: 'var(--color-text-secondary)', 
              textDecoration: 'none',
              transition: 'color 0.3s'
            }}>
              Sign Up
            </Link>
            <span style={{ color: 'var(--color-text-muted)' }}>•</span>
            <Link to="/dashboard" style={{ 
              color: 'var(--color-text-secondary)', 
              textDecoration: 'none',
              transition: 'color 0.3s'
            }}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default NotFound;