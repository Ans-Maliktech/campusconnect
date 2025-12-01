import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Listing Card Component
 * Displays individual listing summary in the marketplace grid.
 * * Props:
 * @param {Object} listing - The product object containing title, price, etc.
 */
const ListingCard = ({ listing }) => {
  
  // Logic: Format date to be readable (e.g., "Oct 12, 2025")
  const formattedDate = new Date(listing.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <Card className="h-100 shadow-sm border-0 transition-hover">
      {/* 1. Product Image with fixed height for consistency */}
      <div style={{ position: 'relative' }}>
        <Card.Img
          variant="top"
          src={listing.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"} 
          alt={listing.title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        {/* Overlay Price Tag */}
        <div 
          className="position-absolute bg-white px-3 py-1 fw-bold shadow-sm" 
          style={{ bottom: '10px', right: '10px', borderRadius: '20px' }}
        >
          ${listing.price}
        </div>
      </div>

      <Card.Body className="d-flex flex-column p-4">
        {/* 2. Badges for quick info */}
        <div className="mb-2">
          <Badge bg="info" className="me-2 text-uppercase" style={{ fontSize: '0.7rem' }}>
            {listing.category}
          </Badge>
          <Badge bg={listing.condition === 'New' ? 'success' : 'secondary'} style={{ fontSize: '0.7rem' }}>
            {listing.condition}
          </Badge>
        </div>

        {/* 3. Title */}
        <Card.Title className="fw-bold text-dark mb-2">
            {listing.title}
        </Card.Title>

        {/* 4. Description (Truncated logic) */}
        <Card.Text className="text-muted small mb-4">
          {listing.description.length > 80 
            ? `${listing.description.substring(0, 80)}...` 
            : listing.description}
        </Card.Text>

        {/* 5. Footer Area: Sticks to bottom */}
        <div className="mt-auto d-flex justify-content-between align-items-center border-top pt-3">
            <small className="text-muted">
                Posted {formattedDate}
            </small>
            
            {/* Logic: Link to dynamic route /listing/:id */}
            <Link to={`/listing/${listing._id}`}>
                <Button variant="outline-primary" size="sm" className="rounded-pill px-3">
                    View Details
                </Button>
            </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ListingCard; 