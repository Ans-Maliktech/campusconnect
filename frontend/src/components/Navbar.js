import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { logout } from '../services/authService';
import ThemeToggle from './ThemeToggle';
import EditProfileModal from './EditProfileModal'; 
import logo from '../logocc.png'; 

const NavigationBar = () => {
  const { user, setUser } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  // State for the Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);

  // 🟢 NEW: Manual state for Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

  // Helper to get initials for the avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // 🟢 NEW: Handle Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is outside the dropdown ref, close it
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <Navbar className="navbar" variant={theme === 'dark' ? 'dark' : 'light'} expand="lg" sticky="top">
        <Container>
          {/* LOGO */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img 
              src={logo} 
              alt="CampusConnect" 
              style={{ height: '35px', width: 'auto', marginRight: '10px' }} 
            />
            <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>
              CampusConnect
            </span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              
              {/* DASHBOARD (Visible only if logged in) */}
              {user && (
                <Nav.Link as={Link} to="/dashboard" className="nav-link">
                  Dashboard
                </Nav.Link>
              )}

              {/* BROWSE LISTINGS */}
              <Nav.Link as={Link} to="/listings" className="nav-link">
                Browse Listings
              </Nav.Link>
              
              {user ? (
                <>
                  <Nav.Link as={Link} to="/create-listing" className="nav-link">
                    Post Listing
                  </Nav.Link>
                  
                  {/* 🟢 UPDATED: PROFILE DROPDOWN WITH REF AND MANUAL STATE */}
                  <div ref={dropdownRef}>
                    <NavDropdown 
                      title={
                        <div className="d-inline-flex align-items-center justify-content-center" 
                             style={{
                               width: '40px',
                               height: '40px',
                               borderRadius: '50%',
                               background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                               color: '#fff',
                               fontWeight: 'bold',
                               boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                             }}>
                          {getInitials(user.name)}
                        </div>
                      } 
                      id="user-dropdown" 
                      align="end"
                      className="ms-2"
                      // Bind the state to the show prop
                      show={isDropdownOpen}
                      // Handle internal toggle (clicking the icon)
                      onToggle={(isOpen) => setIsDropdownOpen(isOpen)}
                    >
                      {/* USER INFO SECTION */}
                      <div className="px-3 py-2 border-bottom">
                        <div style={{fontWeight: '600', color: 'var(--text-main)'}}>
                          {user.name}
                        </div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                          {user.email}
                        </div>
                        <div style={{fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500', marginTop: '2px'}}>
                          📞 {user.phone || user.phoneNumber || "No phone added"}
                        </div>
                      </div>
                      
                      <NavDropdown.Divider />
                      
                      <NavDropdown.Item onClick={handleLogout} className="text-danger">
                         Logout
                      </NavDropdown.Item>
                    </NavDropdown>
                  </div>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="nav-link">Login</Nav.Link>
                  <Link to="/signup" className="btn btn-primary text-white ms-2 px-3 py-1 text-decoration-none">
                    Signup
                  </Link>
                </>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Render the Modal here */}
      <EditProfileModal 
        show={showEditModal} 
        handleClose={() => setShowEditModal(false)} 
      />
    </>
  );
};

export default NavigationBar;