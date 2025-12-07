import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; // 🟢 Import Toast for notifications
import { formatDistanceToNow } from 'date-fns';
// A placeholder image in case the ad has no photo
const DEFAULT_IMAGE = "https://via.placeholder.com/600x400?text=No+Image+Available";

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the specific ad details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        // Use the Dynamic URL from env or localhost
        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        const response = await axios.get(`${backendUrl}/listings/${id}`);

        setListing(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("Could not load listing details.");
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // --- 🟢 FIXED CONTACT LOGIC ---
  const handleContact = (method) => {
    if (!listing) return;

    // 1. DIVE INTO THE SELLER OBJECT
    // The data is inside listing.seller, not directly on listing
    const seller = listing.seller || {};
    const phoneNumber = seller.phoneNumber;
    const whatsappNumber = seller.whatsapp || phoneNumber; // Fallback to phone if WA not set

    if (!phoneNumber) {
      toast.error("This seller hasn't provided contact details.", { icon: '🚫' });
      return;
    }

    if (method === 'call') {
      // Open Phone Dialer
      window.location.href = `tel:${phoneNumber}`;
    }
    else if (method === 'whatsapp') {
      // 2. CLEAN THE NUMBER FOR API
      // Remove spaces, dashes, parentheses to make a valid link
      const cleanNumber = whatsappNumber.replace(/\D/g, '');

      // 3. GENERATE LINK
      const message = `Hi ${seller.name || 'there'}, I saw your listing for "${listing.title}" on CampusConnect. Is it still available?`;
      const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

      // Open in new tab
      window.open(url, '_blank');
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="text-center mt-5">
      <h3>Listing not found</h3>
      <button onClick={() => navigate('/listings')} className="btn btn-primary mt-3">Go Back</button>
    </div>
  );

  return (
    <div className="container mt-5 mb-5">
      {/* CARD WRAPPER */}
      <div className="card shadow-lg overflow-hidden border-0">

        <div className="row g-0">
          {/* LEFT SIDE: IMAGE */}
          <div className="col-md-6 d-flex align-items-center justify-content-center bg-light">
            <img
              src={listing.image || DEFAULT_IMAGE}
              alt={listing.title}
              className="img-fluid"
              style={{
                maxHeight: '600px',
                width: '100%',
                objectFit: 'contain' // Ensures the whole book cover is seen
              }}
            />
          </div>

          {/* RIGHT SIDE: DETAILS */}


          <div className="col-md-6">
            <div className="card-body p-4 p-md-5 d-flex flex-column h-100">
              <div className="mb-3">
                <span className="badge bg-light text-dark border me-2">
                  📍 {listing.city}, {listing.university}
                </span>
                {/* 🟢 Add this where you want the date to appear */}
                <span className="ms-3 text-muted" style={{ fontSize: '0.9rem' }}>
                  🕒 Posted {listing.createdAt ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true }) : 'Just now'}
                </span>
              </div>
              {/* CATEGORY & CONDITION BADGES */}
              <div className="mb-3 d-flex gap-2">
                <span className="badge bg-primary px-3 py-2 text-uppercase">
                  {listing.category || 'General'}
                </span>
                <span className={`badge px-3 py-2 text-uppercase ${listing.condition === 'New' ? 'bg-success' : 'bg-secondary'}`}>
                  {listing.condition || 'Used'}
                </span>
              </div>

              {/* TITLE & PRICE */}
              <h2 className="card-title fw-bold mb-2 display-6">
                {listing.title}
              </h2>
              <h3 className="text-primary fw-bold mb-4">
                PKR {listing.price ? listing.price.toLocaleString() : 'N/A'}
              </h3>

              {/* SELLER INFO (Optional but helpful) */}
              <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm me-3" style={{ width: '45px', height: '45px' }}>
                  👤
                </div>
                <div>
                  <small className="text-muted d-block">Posted by</small>
                  <strong>{listing.seller?.name || "Unknown Student"}</strong>
                </div>
              </div>

              <hr className="my-2" style={{ opacity: 0.1 }} />

              {/* DESCRIPTION */}
              <h5 className="fw-bold mt-3">Description</h5>
              <p className="card-text text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
                {listing.description}
              </p>

              {/* ACTION BUTTONS */}
              <div className="mt-auto pt-4">
                <div className="d-grid gap-3">
                  {/* WhatsApp Button */}
                  <button
                    onClick={() => handleContact('whatsapp')}
                    className="btn btn-success btn-lg shadow-sm d-flex align-items-center justify-content-center gap-2"
                  >
                    <span></span> Chat on WhatsApp
                  </button>

                  <div className="d-flex gap-3">
                    {/* Call Button */}
                    <button
                      onClick={() => handleContact('call')}
                      className="btn btn-outline-primary btn-lg flex-grow-1"
                    >
                      📞 Call Seller
                    </button>

                    {/* Back Button */}
                    <button
                      onClick={() => navigate('/listings')}
                      className="btn btn-outline-secondary btn-lg flex-grow-1"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;