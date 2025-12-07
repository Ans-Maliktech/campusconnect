import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import ListingCard from '../components/ListingCard';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [myListings, setMyListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  // 🟢 Handle Status Toggle (Available <-> Sold)
  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    const toastId = toast.loading('Updating status...');

    try {
      await API.put(`/listings/${id}`, { status: newStatus });
      
      // Update UI locally
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
        <p className="mb-3 fw-bold" style={{ color: '#000' }}>Delete this listing permanently?</p>
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

  if (loading) return <Loader />;

  return (
    <Container className="py-5">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
           <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Dashboard</h2>
           <p style={{ color: 'var(--text-muted)' }}>Welcome back, <span className="text-gradient">{user?.name}</span>!</p>
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
          .custom-dashboard-tabs .nav-link:hover {
            color: var(--primary) !important;
            background: var(--bg-elevated);
          }
          .custom-dashboard-tabs .nav-link.active:hover {
             color: white !important;
             background-color: var(--primary) !important;
          }
        `}
      </style>

      {/* Tabs */}
      <Tabs defaultActiveKey="mylistings" className="mb-4 custom-dashboard-tabs border-0">
        
        {/* MY LISTINGS TAB */}
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
                        {/* Sold Badge Overlay */}
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

                      {/* Status Toggle Button */}
                      <div className="mb-3 d-grid">
                        <Button 
                          variant={listing.status === 'available' ? 'outline-success' : 'outline-secondary'}
                          size="sm"
                          className="fw-bold"
                          onClick={() => handleStatusChange(listing._id, listing.status)}
                        >
                          {listing.status === 'available' ? '✅ Mark as Sold' : '🔄 Mark Available'}
                        </Button>
                      </div>
                      
                      <div className="d-flex gap-2 mt-auto">
                        <Link
                          to={`/edit-listing/${listing._id}`}
                          className="btn btn-outline-primary btn-sm flex-grow-1 shadow-sm"
                          style={{ borderRadius: '10px' }}
                        >
                          ✏️ Edit
                        </Link>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="flex-grow-1 shadow-sm"
                          style={{ borderRadius: '10px' }}
                          onClick={() => handleDelete(listing._id)}
                        >
                           Delete
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Tab>

        {/* SAVED ITEMS TAB */}
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
    </Container>
  );
};

export default Dashboard;