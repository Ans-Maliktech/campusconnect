import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import API from '../services/api';
import ListingCard from '../components/ListingCard';
import Loader from '../components/Loader';

/**
 * All Listings Page
 * Browse and filter marketplace listings
 */
const AllListings = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Textbooks', 'Notes', 'Hostel Supplies', 'Tutoring Services'];

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [selectedCategory, listings]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await API.get('/listings');
      setListings(response.data);
      setFilteredListings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    if (selectedCategory === 'All') {
      setFilteredListings(listings);
    } else {
      setFilteredListings(
        listings.filter((listing) => listing.category === selectedCategory)
      );
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className="py-5">
      <h2 className="mb-4">🛒 Browse Marketplace</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filter Section */}
      <div className="mb-4">
        <Form.Group>
          <Form.Label>Filter by Category</Form.Label>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <Alert variant="info" className="text-center">
          <h5>No listings found</h5>
          <p>Check back later or try a different category!</p>
        </Alert>
      ) : (
        <>
          <p className="text-muted mb-3">
            Showing {filteredListings.length} listing(s)
          </p>
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredListings.map((listing) => (
              <Col key={listing._id}>
                <ListingCard listing={listing} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default AllListings;