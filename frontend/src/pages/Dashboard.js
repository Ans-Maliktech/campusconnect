import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Modal, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import { AuthContext } from '../context/AuthContext';
import { updateUserProfile } from '../services/authService';
import API from '../services/api';
import ListingCard from '../components/ListingCard';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [myListings, setMyListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    phoneNumber: '',
    whatsapp: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Load user data into profile form when modal opens
  useEffect(() => {
    if (showProfileModal && user) {
      setProfileFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        whatsapp: user.whatsapp || '',
      });
      setProfileError('');
    }
  }, [showProfileModal, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [myListingsRes, savedListingsRes] = await Promise.all([
        API.get('/listings/user/mylistings'),
        API.get('/users/saved'),
      ]);
      setMyListings(myListingsRes.data);
      setSavedListings(savedListingsRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    const toastId = toast.loading('Updating status...');
    try {
      await API.put(`/listings/${id}`, { status: newStatus });
      setMyListings(myListings.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ));
      toast.success(newStatus === 'sold' ? 'Marked as Sold! 🏷️' : 'Marked as Available! ✅', { id: toastId });
    } catch (err) {
      toast.error('Failed to update status', { id: toastId });
    }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="text-center">
        <div className="mb-2" style={{ fontSize: '2rem' }}>🗑️</div>
        <p className="mb-3 fw-bold" style={{ color: 'var(--text-main)' }}>Delete this listing permanently?</p>
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-danger btn-sm px-4 shadow-sm"
            onClick={() => confirmDelete(id, t.id)}
            style={{ borderRadius: '20px' }}
          >
            Yes, Delete
          </button>
          <button
            className="btn btn-light btn-sm px-4 border shadow-sm"
            onClick={() => toast.dismiss(t.id)}
            style={{ borderRadius: '20px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const confirmDelete = async (id, toastId) => {
    toast.dismiss(toastId); 
    try {
      await API.delete(`/listings/${id}`);
      setMyListings(myListings.filter((listing) => listing._id !== id));
      toast.success('Listing deleted successfully');
    } catch (err) {
      toast.error('Failed to delete listing');
    }
  };

  // Handle profile form input change
  const handleProfileChange = (e) => {
    setProfileFormData({
      ...profileFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle profile update submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);
    toast.dismiss();

    // Validation
    if (!profileFormData.phoneNumber.trim()) {
      setProfileError('Phone number is required');
      toast.error('Phone number is required');
      setProfileLoading(false);
      return;
    }

    try {
      console.log('📤 Updating profile with:', profileFormData);

      // Call the updateUserProfile function from authService
      const updatedUser = await updateUserProfile(profileFormData);

      console.log('✅ Profile updated:', updatedUser);

      // This is the crucial step: Update AuthContext with the new user data
      // This immediately updates the phone number in the Avatar Dropdown and elsewhere
      setUser(updatedUser);

      // Show success message
      toast.success('✅ Profile updated! Contact info synced across all listings.', {
        duration: 5000,
      });

      // Close modal
      setShowProfileModal(false);

    } catch (err) {
      console.error('❌ Profile update error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      setProfileError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
           <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Dashboard</h2>
           <p style={{ color: 'var(--text-muted)' }}>
             Welcome back, <span className="text-gradient">{user?.name}</span>!
             {/* KEEPING: Edit Profile Button on the main dashboard */}
             <Button 
               variant="link" 
               className="text-decoration-none ms-2 p-0"
               style={{ fontSize: '0.9rem' }}
               onClick={() => setShowProfileModal(true)}
             >
               ✏️ Edit Profile
             </Button>
           </p>
        </div>
        <Link to="/create-listing" className="btn btn-primary shadow-sm rounded-pill px-4">
          + Post New Listing
        </Link>
      </div>

      <style>
        {`
          .custom-dashboard-tabs .nav-link { 
            color: var(--text-muted) !important; 
            font-weight: 600; 
            border: 1px solid transparent !important;
            margin-right: 5px;
            border-radius: 8px;
          }
          .custom-dashboard-tabs .nav-link.active { 
            background-color: var(--primary) !important;
            color: white !important;
            border: 1px solid var(--primary) !important;
          }
        `}
      </style>

      <Tabs defaultActiveKey="mylistings" className="mb-4 custom-dashboard-tabs border-0">
        <Tab eventKey="mylistings" title="My Listings">
          {myListings.length === 0 ? (
            <Card className="text-center p-5 shadow-sm border-0 rounded-4" style={{ background: 'var(--bg-surface)' }}>
              <Card.Body>
                <h5 style={{ color: 'var(--text-muted)' }}>You haven't posted any listings yet</h5>
                <Link to="/create-listing" className="btn btn-outline-primary mt-3 rounded-pill px-4">Create Your First Listing</Link>
              </Card.Body>
            </Card>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {myListings.map((listing) => (
                <Col key={listing._id}>
                  <Card className={`h-100 shadow border-0 overflow-hidden rounded-4 ${listing.status === 'sold' ? 'opacity-75' : ''}`} style={{ background: 'var(--bg-surface)' }}>
                    <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                        <Card.Img
                          variant="top"
                          src={listing.image || "https://via.placeholder.com/400x300?text=No+Image"}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: listing.status === 'sold' ? 'grayscale(100%)' : 'none' }}
                        />
                        {listing.status === 'sold' && (
                          <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{ top: 0, left: 0, background: 'rgba(0,0,0,0.5)' }}>
                            <span className="badge bg-danger fs-5 px-3">SOLD OUT</span>
                          </div>
                        )}
                        <div className="position-absolute top-0 start-0 m-2">
                            <span className="badge shadow-sm border" style={{ background: 'var(--bg-surface)', color: 'var(--primary)' }}>
                                {listing.category}
                            </span>
                        </div>
                    </div>
                    <Card.Body className="d-flex flex-column p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="fw-bold text-truncate w-75" style={{ color: 'var(--text-main)' }}>{listing.title}</Card.Title>
                        <h5 className="fw-bold mb-0" style={{ color: 'var(--primary)' }}>
                            <small style={{ fontSize: '0.7em', color: 'var(--text-muted)' }}>PKR</small> {listing.price ? listing.price.toLocaleString() : '0'}
                        </h5>
                      </div>
                      <div className="mb-3 d-grid">
                        <Button 
                          variant={listing.status === 'available' ? 'outline-success' : 'outline-secondary'}
                          size="sm"
                          className="fw-bold"
                          onClick={() => handleStatusChange(listing._id, listing.status)}
                        >
                          {listing.status === 'available' ? ' Mark as Sold' : '🔄 Mark Available'}
                        </Button>
                      </div>
                      <div className="d-flex gap-2 mt-auto">
                        {/* REMOVED: Edit Button from the listing card */}
                        <Button variant="outline-danger" size="sm" className="flex-grow-1 shadow-sm" style={{ borderRadius: '10px' }} onClick={() => handleDelete(listing._id)}>🗑️ Delete</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Tab>
        <Tab eventKey="saved" title="Saved Items">
          {savedListings.length === 0 ? (
            <Card className="text-center p-5 shadow-sm border-0 rounded-4" style={{ background: 'var(--bg-surface)' }}>
              <Card.Body>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>❤️</div>
                <h5 style={{ color: 'var(--text-muted)' }}>No saved listings yet</h5>
                <Link to="/listings" className="btn btn-primary mt-3 rounded-pill px-4">Browse Marketplace</Link>
              </Card.Body>
            </Card>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {savedListings.map((listing) => (
                <Col key={listing._id}>
                  <ListingCard listing={listing} />
                </Col>
              ))}
            </Row>
          )}
        </Tab>
      </Tabs>

      {/* Profile Edit Modal */}
      <Modal 
        show={showProfileModal} 
        onHide={() => setShowProfileModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--glass-border)' }}>
          <Modal.Title className="fw-bold">
            <span className="text-gradient">✏️ Edit Profile</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          {profileError && (
            <Alert variant="danger" dismissible onClose={() => setProfileError('')}>
              {profileError}
            </Alert>
          )}

          <Alert variant="info" className="mb-3">
            <small>
              💡 <strong>Note:</strong> Updating your contact info will automatically sync across all your listings.
            </small>
          </Alert>

          <Form onSubmit={handleProfileSubmit}>
            {/* Name */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Your full name"
                value={profileFormData.name}
                onChange={handleProfileChange}
                required
                disabled={profileLoading}
              />
            </Form.Group>

            {/* Email (Read-only) */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Email Address</Form.Label>
              <Form.Control
                type="email"
                value={user?.email || ''}
                disabled
                readOnly
              />
              <Form.Text className="text-muted">
                Email cannot be changed
              </Form.Text>
            </Form.Group>

            {/* Phone Number */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Phone Number *</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                placeholder="03001234567"
                value={profileFormData.phoneNumber}
                onChange={handleProfileChange}
                required
                disabled={profileLoading}
              />
              <Form.Text className="text-muted">
                This will be shown to buyers on your listings
              </Form.Text>
            </Form.Group>

            {/* WhatsApp */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">WhatsApp Number (Optional)</Form.Label>
              <Form.Control
                type="tel"
                name="whatsapp"
                placeholder="Your WhatsApp number"
                value={profileFormData.whatsapp}
                onChange={handleProfileChange}
                disabled={profileLoading}
              />
            </Form.Group>

            {/* Buttons */}
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                className="flex-grow-1"
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  '💾 Save Changes'
                )}
              </Button>
              <Button
                variant="secondary"
                className="flex-grow-1"
                onClick={() => setShowProfileModal(false)}
                disabled={profileLoading}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Dashboard;