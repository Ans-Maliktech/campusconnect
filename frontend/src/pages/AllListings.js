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

  // 3. Local Input States (These allow typing without reloading)
  const [titleInput, setTitleInput] = useState('');
  const [uniInput, setUniInput] = useState('');

  // 🟢 UPDATED: Categories to match CreateListing.js
  const categories = [
    "All", // Keep 'All' for filtering
    "Textbooks & Course Materials",
    "Notes & Past Papers",
    "Electronics & Gadgets",
    "Medical Instruments",
    "Engineering & Art Tools",
    "Hostel Essentials",
    "Fashion & Uniforms",
    "Services (Tutoring/Freelance)",
    "Other"
  ];

  const cities = ['All', 'Abbottabad', 'Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Multan', 'Rawalpindi', 'Other'];

  // 🟢 NEW: Universities List for Smart Filtering
  const universities = [
    "All",
    "COMSATS University (CUI)",
    "NUST (National University of Sciences & Technology)",
    "LUMS (Lahore University of Management Sciences)",
    "FAST NUCES",
    "IBA (Institute of Business Administration)",
    "UET (University of Engineering & Technology)",
    "Punjab University (PU)",
    "Karachi University (KU)",
    "GIKI (Ghulam Ishaq Khan Institute)",
    "Bahria University",
    "Air University",
    "Quaid-e-Azam University (QAU)",
    "Medical College (KEMU/AIMC/RMU)",
    "Army Medical College (AMC)",
    "Other"
  ];

  // Fetch ONLY when the "Committed" filters change
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
      
      if (selectedCategory !== 'All') query += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedCity !== 'All') query += `&city=${encodeURIComponent(selectedCity)}`;
      
      // Use the COMMITTED states for the API call
      if (searchQuery.trim() !== '') query += `&search=${encodeURIComponent(searchQuery)}`;
      
      // Smart University Search: Use dropdown value OR typed text
      if (searchUniversity !== 'All' && searchUniversity.trim() !== '') {
         query += `&university=${encodeURIComponent(searchUniversity)}`;
      }

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

  // Trigger Search on "Enter" or Button Click
  const handleSearch = () => {
    setSearchQuery(titleInput);      // Commit title
    // If university dropdown is "All", clear it, otherwise use selected value
    setSearchUniversity(uniInput === 'All' ? '' : uniInput);   
    setPage(1);                      
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
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
    setUniInput(''); // Reset dropdown
    
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
                <Form.Control
                  type="text"
                  placeholder=" 🔍 Search item... (Press Enter)"
                  className="ps-3"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </InputGroup>
            </Col>

            {/* Filter by Category */}
            <Col md={3}>
              <Form.Select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? '📂 All Categories' : cat}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* Filter by City */}
            <Col md={2}>
              <Form.Select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city === 'All' ? '📍 All Cities' : city}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* 🟢 UPDATED: University Dropdown (Smart Filter) */}
            <Col md={3}>
              <Form.Select
                value={searchUniversity || 'All'} // Bind to committed state
                onChange={(e) => setSearchUniversity(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="All">🎓 All Universities</option>
                {universities.filter(u => u !== 'All').map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          
          {/* Mobile Apply Button */}
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