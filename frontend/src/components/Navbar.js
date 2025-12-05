import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { logout } from '../services/authService';

// IMPORT THE LOGO HERE
// (Assumes NavigationBar is in src/components/ and logo is in src/)
import logo from '../logocc.png'; 

const NavigationBar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

  return (
    // 'navbar-custom' uses the Navy Blue from your new CSS
    <Navbar className="navbar" variant="dark" expand="lg" sticky="top">
      <Container>
        {/* LOGO SECTION */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img 
            src={logo} 
            alt="CampusConnect" 
            style={{ 
              height: '35px', 
              width: 'auto', 
              marginRight: '10px' 
            }} 
          />
          <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>
            CampusConnect
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/listings" className="nav-link">
              Browse Listings
            </Nav.Link>
            
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard" className="nav-link">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/create-listing" className="nav-link">
                  Post Listing
                </Nav.Link>
                <Button 
                  variant="outline-light" 
                  size="sm" 
                  onClick={handleLogout}
                  className="ms-3"
                  style={{ borderRadius: '20px', padding: '5px 15px' }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link">
                  Login
                </Nav.Link>
                {/* Highlight Signup button */}
                <Button 
                  as={Link} 
                  to="/signup" 
                  variant="light" 
                  size="sm"
                  className="ms-2 fw-bold"
                  style={{ color: '#002D62' }}
                >
                  Signup
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;