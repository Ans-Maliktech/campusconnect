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
  
  const [showEditModal, setShowEditModal] = useState(false);

  // 🟢 STATE 1: Profile Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🟢 STATE 2: Mobile Menu (Hamburger)
  const [expanded, setExpanded] = useState(false);
  const navbarRef = useRef(null); // Ref to detect clicks outside the menu

  const handleLogout = () => {
    logout();
    setUser(null);
    setExpanded(false); 
    navigate('/login');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // 🟢 UNIVERSAL "CLICK OUTSIDE" LOGIC
  // This forces the menu to close if you click ANYWHERE else on the screen
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 1. Close Profile Dropdown if clicked outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      
      // 2. Close Mobile Menu if clicked outside the Navbar area
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* 🟢 Ref attached here to detect clicks inside/outside navbar */}
      <div ref={navbarRef}> 
        <Navbar 
          className="navbar" 
          variant={theme === 'dark' ? 'dark' : 'light'} 
          expand="lg" 
          sticky="top"
          // 🟢 Force React to control the open/close state
          expanded={expanded} 
        >
          <Container>
            <Navbar.Brand 
              as={Link} 
              to="/" 
              className="d-flex align-items-center"
              onClick={() => setExpanded(false)}
            >
              <img 
                src={logo} 
                alt="CommunityMart" 
                style={{ height: '35px', width: 'auto', marginRight: '10px' }} 
              />
              <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>
                Community Mart
              </span>
            </Navbar.Brand>

            {/* 🟢 SIMPLIFIED TOGGLE LOGIC */}
            <Navbar.Toggle 
              aria-controls="basic-navbar-nav" 
              onClick={() => setExpanded(expanded ? false : true)}
            />
            
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto align-items-center">
                
                {user && (
                  <Nav.Link 
                    as={Link} 
                    to="/dashboard" 
                    className="nav-link"
                    onClick={() => setExpanded(false)}
                  >
                    Dashboard
                  </Nav.Link>
                )}

                <Nav.Link 
                  as={Link} 
                  to="/listings" 
                  className="nav-link"
                  onClick={() => setExpanded(false)}
                >
                  Browse Listings
                </Nav.Link>
                
                {user ? (
                  <>
                    <Nav.Link 
                      as={Link} 
                      to="/create-listing" 
                      className="nav-link"
                      onClick={() => setExpanded(false)}
                    >
                      Post Listing
                    </Nav.Link>
                    
                    {/* PROFILE DROPDOWN */}
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
                        show={isDropdownOpen}
                        onToggle={(isOpen) => setIsDropdownOpen(isOpen)}
                      >
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
                    <Nav.Link 
                      as={Link} 
                      to="/login" 
                      className="nav-link"
                      onClick={() => setExpanded(false)}
                    >
                      Login
                    </Nav.Link>
                    <Link 
                      to="/signup" 
                      className="btn btn-primary text-white ms-2 px-3 py-1 text-decoration-none"
                      onClick={() => setExpanded(false)}
                    >
                      Signup
                    </Link>
                  </>
                )}

                <ThemeToggle />
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>

      <EditProfileModal 
        show={showEditModal} 
        handleClose={() => setShowEditModal(false)} 
      />
    </>
  );
};

export default NavigationBar;