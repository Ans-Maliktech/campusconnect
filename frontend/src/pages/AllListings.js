import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Card, Button } from 'react-bootstrap';
import toast from 'react-hot-toast'; 
import API from '../services/api';
import ListingCard from '../components/ListingCard';
import Loader from '../components/Loader';

const AllListings = () => {
  // 1. Data States
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 2. Filter States (These trigger the API fetch)
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');      // Committed Search
  const [searchUniversity, setSearchUniversity] = useState(''); // Committed University

  // 3. 🟢 Local Input States (These allow typing without reloading)
  const [titleInput, setTitleInput] = useState('');
  const [uniInput, setUniInput] = useState('');

  const categories = ['All', 'Textbooks', 'Notes', 'Hostel Supplies', 'Electronics', 'Tutoring Services', 'Freelancing Services', 'Other'];
  const cities = ['All', 'Abbottabad', 'Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Multan', 'Rawalpindi', 'Other'];

  // 🟢 Fetch ONLY when the "Committed" filters change (not while typing)
  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line
  }, [selectedCategory, selectedCity, searchQuery, searchUniversity, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedCity, searchQuery, searchUniversity]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      
      let query = `/listings?page=${page}&limit=9&status=available`;
      
      if (selectedCategory !== 'All') query += `&category=${selectedCategory}`;
      if (selectedCity !== 'All') query += `&city=${selectedCity}`;
      
      // Use the COMMITTED states for the API call
      if (searchQuery.trim() !== '') query += `&search=${searchQuery}`;
      if (searchUniversity.trim() !== '') query += `&university=${searchUniversity}`;

      const response = await API.get(query);
      
      setListings(response.data.listings || []);
      setTotalPages(response.data.totalPages || 1);
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Trigger Search on "Enter" or Button Click
  const handleSearch = () => {
    setSearchQuery(titleInput);      // Commit title
    setSearchUniversity(uniInput);   // Commit university
    setPage(1);                      // Reset to page 1
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Stop form submit
      handleSearch();
    }
  };

  const clearFilters = () => {
    // Reset API States
    setSelectedCategory('All');
    setSelectedCity('All');
    setSearchQuery('');
    setSearchUniversity('');
    
    // Reset Local Inputs
    setTitleInput('');
    setUniInput('');
    
    setPage(1);
  };

  if (loading) return <Loader />;

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary">Browse Marketplace</h2>
        <p className="text-muted">Find textbooks, notes, and services from students near you.</p>
      </div>

      {/* ADVANCED FILTER CARD */}
      <Card className="shadow-sm border-0 mb-5">
        <Card.Body className="p-4">
          <Row className="g-3">
            {/* Search by Title */}
            <Col md={4}>
              <InputGroup>
                {/* 🟢 Clickable Search Icon */}
                {/* <InputGroup.Text 
                    className="bg-transparent border-end-0" 
                    style={{ cursor: 'pointer' }}
                    onClick={handleSearch}
                >
                    
                </InputGroup.Text> */}
                <Form.Control
                  type="text"
                  placeholder="  Search item... (Press Enter)"
                  className="border-start-0 ps-0"
                  // 🟢 Bind to Local State
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={handleKeyDown}
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
                placeholder="University..."
                // 🟢 Bind to Local State
                value={uniInput}
                onChange={(e) => setUniInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Col>
          </Row>
          
          {/* Optional: Explicit Search Button for Mobile */}
          <div className="d-block d-md-none mt-3">
             <Button variant="primary" className="w-100" onClick={handleSearch}>Apply Filters</Button>
          </div>
        </Card.Body>
      </Card>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-5">
          <h4 className="mt-3 text-muted">No listings found</h4>
          <Button variant="outline-primary" className="mt-2" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <p className="text-muted mb-4 fw-bold">Showing {listings?.length} result(s)</p>
          <Row xs={1} md={2} lg={3} className="g-4">
            {listings?.map((listing) => (
              <Col key={listing?._id}>
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