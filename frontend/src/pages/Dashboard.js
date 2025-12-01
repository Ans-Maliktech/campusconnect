import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import ListingCard from '../components/ListingCard';
import Loader from '../components/Loader';

/**
 * Dashboard Page
 * Shows user's listings and saved items
 */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [myListings, setMyListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await API.delete(`/listings/${id}`);
        setMyListings(myListings.filter((listing) => listing._id !== id));
        alert('Listing deleted successfully');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete listing');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className="py-5">
      <h2 className="mb-4">Welcome, {user?.name}! 👋</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs defaultActiveKey="mylistings" className="mb-4">
        {/* My Listings Tab */}
        <Tab eventKey="mylistings" title={`My Listings (${myListings.length})`}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>My Posted Listings</h4>
            <Link to="/create-listing" className="btn btn-primary">
              + Post New Listing
            </Link>
          </div>

          {myListings.length === 0 ? (
            <Card className="text-center p-5">
              <Card.Body>
                <h5>You haven't posted any listings yet</h5>
                <p className="text-muted">Start selling your items to other students!</p>
                <Link to="/create-listing" className="btn btn-primary">
                  Create Your First Listing
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {myListings.map((listing) => (
                <Col key={listing._id}>
                  <Card className="h-100">
                    <Card.Img
                      variant="top"
                      src={listing.imageUrl}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Card.Body>
                      <Card.Title>{listing.title}</Card.Title>
                      <Card.Text className="text-muted">
                        {listing.description.substring(0, 80)}...
                      </Card.Text>
                      <h5 className="text-primary">₹{listing.price}</h5>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/edit-listing/${listing._id}`}
                          className="btn btn-warning btn-sm flex-grow-1"
                        >
                          Edit
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-grow-1"
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

        {/* Saved Listings Tab */}
        <Tab eventKey="saved" title={`Saved Items (${savedListings.length})`}>
          <h4 className="mb-4">Your Saved Listings</h4>

          {savedListings.length === 0 ? (
            <Card className="text-center p-5">
              <Card.Body>
                <h5>No saved listings yet</h5>
                <p className="text-muted">Browse the marketplace and save items you like!</p>
                <Link to="/listings" className="btn btn-primary">
                  Browse Listings
                </Link>
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

        {/* Profile Tab */}
        <Tab eventKey="profile" title="Profile">
          <Card>
            <Card.Body>
              <h4 className="mb-4">Your Profile</h4>
              <div className="mb-3">
                <strong>Name:</strong> {user?.name}
              </div>
              <div className="mb-3">
                <strong>Email:</strong> {user?.email}
              </div>
              <div className="mb-3">
                <strong>Role:</strong>{' '}
                <span className="badge bg-primary">{user?.role}</span>
              </div>
              <Alert variant="info" className="mt-4">
                💡 <strong>Tip:</strong> Keep your contact information updated so buyers can reach you easily!
              </Alert>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Dashboard;