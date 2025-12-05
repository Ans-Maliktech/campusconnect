import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Card, Button } from 'react-bootstrap';
import toast from 'react-hot-toast'; 
import API from '../services/api';
import ListingCard from '../components/ListingCard';
import Loader from '../components/Loader';

const AllListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  // 🟢 New Filter States
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchUniversity, setSearchUniversity] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ['All', 'Textbooks', 'Notes', 'Hostel Supplies', 'Electronics', 'Tutoring Services', 'Freelancing Services', 'Other'];
  // 🟢 Cities List
  const cities = ['All', 'Abbottabad', 'Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Multan', 'Rawalpindi', 'Other'];

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line
  }, [selectedCategory, searchQuery, selectedCity, searchUniversity, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, selectedCity, searchUniversity]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // 🟢 Updated Query Builder with City & University
      let query = `/listings?page=${page}&limit=9&status=available`;
      
      if (selectedCategory !== 'All') query += `&category=${selectedCategory}`;
      if (selectedCity !== 'All') query += `&city=${selectedCity}`;
      if (searchQuery.trim() !== '') query += `&search=${searchQuery}`;
      if (searchUniversity.trim() !== '') query += `&university=${searchUniversity}`;

      const response = await API.get(query);
      setListings(response.data.listings);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary">Browse Marketplace</h2>
        <p className="text-muted">Find textbooks, notes, and services from students near you.</p>
      </div>

      {/* 🟢 ADVANCED FILTER CARD */}
      <Card className="shadow-sm border-0 mb-5">
        <Card.Body className="p-4">
          <Row className="g-3">
            {/* Search by Title */}
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search item..."
                  className="border-start-0 ps-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>

            {/* Filter by Category */}
            <Col md={3}>
              <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? '📂 All Categories' : cat}</option>)}
              </Form.Select>
            </Col>

            {/* Filter by City */}
            <Col md={3}>
              <Form.Select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                {cities.map(city => <option key={city} value={city}>{city === 'All' ? '📍 All Cities' : city}</option>)}
              </Form.Select>
            </Col>

            {/* Search by University */}
            <Col md={2}>
              <Form.Control
                type="text"
                placeholder="🎓 University..."
                value={searchUniversity}
                onChange={(e) => setSearchUniversity(e.target.value)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Listings Grid (Same as before) */}
      {listings.length === 0 ? (
        <div className="text-center py-5">
          <h4 className="mt-3 text-muted">No listings found</h4>
          <button className="btn btn-outline-primary mt-2" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setSelectedCity('All'); setSearchUniversity(''); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-muted mb-4 fw-bold">Showing {listings.length} result(s)</p>
          <Row xs={1} md={2} lg={3} className="g-4">
            {listings.map((listing) => (
              <Col key={listing._id}>
                <ListingCard listing={listing} />
              </Col>
            ))}
          </Row>
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-3 mt-5">
                <Button variant="outline-primary" disabled={page === 1} onClick={() => setPage(page - 1)}>&larr; Previous</Button>
                <span className="align-self-center fw-bold text-muted">Page {page}</span>
                <Button variant="outline-primary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next &rarr;</Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default AllListings;