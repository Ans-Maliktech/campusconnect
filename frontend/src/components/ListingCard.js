import React, { useContext } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const ListingCard = ({ listing }) => {
  // 🟢 Access User Context to check saved status
  const { user, setUser } = useContext(AuthContext);

  const formattedDate = new Date(listing.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const formattedPrice = listing.price ? listing.price.toLocaleString() : '0';

  // 🟢 Check if this listing is in the user's saved list
  const isSaved = user?.savedListings?.includes(listing._id);

  // 🟢 Handle Heart Click
  const toggleHeart = async (e) => {
    e.preventDefault(); // Prevent clicking the card link
    
    if (!user) {
      toast.error("Please login to save items");
      return;
    }

    try {
      // Call API
      const { data } = await API.put(`/users/save/${listing._id}`);
      
      // Update Global User State (So the heart turns red immediately)
      setUser({ ...user, savedListings: data.savedListings });
      
      // Show Toast
      if (data.saved) {
        toast.success("Added to Wishlist ❤️");
      } else {
        toast.success("Removed from Wishlist 💔");
      }
    } catch (err) {
      toast.error("Failed to save item");
    }
  };

  return (
    <Card className="h-100 shadow-sm border-0 overflow-hidden" style={{ transition: 'transform 0.2s' }}>
      <div style={{ position: 'relative' }}>
        <Card.Img
          variant="top"
          src={listing.image || "https://via.placeholder.com/300x200?text=No+Image"} 
          alt={listing.title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        
        <div 
          className="position-absolute bg-white text-dark px-3 py-1 fw-bold shadow-sm" 
          style={{ bottom: '10px', right: '10px', borderRadius: '20px', fontSize: '0.9rem' }}
        >
          PKR {formattedPrice}
        </div>

        {/* 🟢 HEART BUTTON (Top Right) */}
        <div 
            onClick={toggleHeart}
            className="position-absolute bg-white shadow-sm d-flex align-items-center justify-content-center"
            style={{ 
                top: '10px', 
                right: '10px', 
                width: '35px', 
                height: '35px', 
                borderRadius: '50%',
                cursor: 'pointer',
                zIndex: 10
            }}
        >
            {/* SVG Heart Icon */}
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                fill={isSaved ? "#dc3545" : "#ccc"} // Red if saved, Grey if not
                className="bi bi-heart-fill" 
                viewBox="0 0 16 16"
                style={{ transition: 'fill 0.2s' }}
            >
                <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
            </svg>
        </div>
      </div>

      <Card.Body className="d-flex flex-column p-4">
        <div className="mb-2">
          <Badge bg="light" text="primary" className="me-2 border border-primary text-uppercase" style={{ fontSize: '0.7rem' }}>
            {listing.category}
          </Badge>
          <Badge bg={listing.condition?.includes('New') ? 'success' : 'secondary'} style={{ fontSize: '0.7rem' }}>
            {listing.condition}
          </Badge>
        </div>

        <Card.Title className="fw-bold text-dark mb-2 text-truncate">
            {listing.title}
        </Card.Title>

        <Card.Text className="text-muted small mb-4 flex-grow-1">
          {listing.description.length > 60 
            ? `${listing.description.substring(0, 60)}...` 
            : listing.description}
        </Card.Text>

        <div className="mt-auto d-flex justify-content-between align-items-center border-top pt-3">
            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                Posted {formattedDate}
            </small>
            
            <Link to={`/listing/${listing._id}`}>
                <Button variant="outline-primary" size="sm" className="rounded-pill px-3 fw-bold">
                    View Details
                </Button>
            </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ListingCard;