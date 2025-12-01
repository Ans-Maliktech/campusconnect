import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Badge, Button, Alert, Row, Col, ListGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api'; // Assumes API is an Axios instance
import Loader from '../components/Loader';
import { FaHeart, FaShare, FaUser, FaClock, FaTag, FaEnvelope, FaLock } from 'react-icons/fa';

/**
 * Product Details Page
 * Shows complete listing information for CampusConnect
 */
const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext); // Get user state from context

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [saved, setSaved] = useState(false); // Tracks if the current listing is saved by the user

  useEffect(() => {
    fetchListing();
    if (user) {
        checkIfSaved(); // Check saved status only if user is logged in
    }
  }, [id, user]); // Re-fetch or re-check if 'id' or 'user' changes

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError('');
      // Endpoint: GET /listings/:id
      const response = await API.get(`/listings/${id}`);
      setListing(response.data);
      // Logic to initialize saved state from listing data (if the listing includes user-specific data)
      // If the backend returns a field like `isSavedByUser`, use that to set 'saved'.
      // For simplicity here, we assume checkIfSaved handles it separately.
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load listing.');
    } finally {
      setLoading(false);
    }
  };

  // Logic: Check if the listing is already in the user's saved list
  const checkIfSaved = async () => {
    try {
        // Endpoint: GET /users/issaved/:id (Requires auth header)
        const response = await API.get(`/users/issaved/${id}`);
        setSaved(response.data.isSaved);
    } catch (err) {
        console.error('Failed to check saved status:', err);
    }
  };

  // Logic: Handle saving/unsaving the listing
  const handleSave = async () => {
    if (!user) {
      alert('Please login to save listings to your dashboard.');
      return;
    }

    try {
      // Endpoint: PUT /users/save/:id - toggles the saved state
      // The API should expect a JWT token in the header to identify the user
      const response = await API.put(`/users/save/${id}`); 
      
      // Update the state based on the API response
      setSaved(response.data.saved); 
      alert(response.data.message);

    } catch (err) {
      // Completed error handling logic
      const message = err.response?.data?.message || 'Action failed. Please try again.';
      setError(message);
    }
  };

  // --- RENDERING LOGIC ---

  if (loading) {
    return <Container className="my-5"><Loader /></Container>;
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          Error: {error}
        </Alert>
        <Link to="/marketplace">Go back to listings</Link>
      </Container>
    );
  }

  if (!listing) {
    return <Container className="my-5"><Alert variant="info">Listing not found.</Alert></Container>;
  }

  // Helper for date formatting
  const postedDate = new Date(listing.createdAt || Date.now()).toLocaleDateString();

  return (
    <Container className="py-5">
      <Row>
        <Col md={7}>
          {/* 1. Image Carousel/Main Image */}
          <Card className="shadow-sm mb-4">
            <Card.Img 
                variant="top" 
                src={listing.imageUrl || "https://via.placeholder.com/700x500?text=Product+Image"}
                alt={listing.title}
                style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
          </Card>

          {/* 2. Detailed Description */}
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title className="mb-3">Item Description</Card.Title>
              <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
                {listing.description}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          {/* 3. Price and Title Card */}
          <Card className="shadow-lg mb-4 border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="display-4 text-primary fw-bold">
                  ${listing.price}
                </h1>
                <Button 
                  variant={saved ? "danger" : "outline-danger"} 
                  onClick={handleSave} 
                  className="rounded-circle"
                  disabled={!user}
                  title={user ? (saved ? 'Unsave Listing' : 'Save Listing') : 'Login to Save'}
                >
                  <FaHeart />
                </Button>
              </div>
              <Card.Title as="h2" className="mb-4">{listing.title}</Card.Title>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                <Button 
                    variant="success" 
                    size="lg" 
                    className="fw-bold"
                    onClick={() => setShowContact(true)}
                    disabled={!user}
                >
                    {user ? 'Reveal Contact Details' : <><FaLock className="me-2" /> Login to Contact</>}
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* 4. Seller and Contact Info */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light fw-bold">Seller Information</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <FaUser className="me-2 text-primary" /> 
                Seller: <span className="fw-semibold">{listing.sellerName || 'Anonymous Student'}</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <FaClock className="me-2 text-secondary" />
                Posted On: {postedDate}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaTag className="me-2 text-info" />
                Condition: <Badge bg={listing.condition === 'New' ? 'success' : 'warning'}>{listing.condition}</Badge>
              </ListGroup.Item>

              {/* Gated Contact Information */}
              <ListGroup.Item className={showContact && user ? 'bg-success-light' : 'bg-light'}>
                {showContact && user ? (
                  <>
                    <FaEnvelope className="me-2 text-success" />
                    Contact: <span className="fw-bold text-success">{listing.contactEmail || 'No contact provided'}</span>
                  </>
                ) : (
                  <span className="text-muted">Contact details are hidden. Click 'Reveal Contact' above.</span>
                )}
              </ListGroup.Item>

            </ListGroup>
          </Card>
          
          {/* 5. Back Button */}
          <Link to="/marketplace" className="btn btn-outline-secondary w-100">
            &larr; Back to Marketplace
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails;