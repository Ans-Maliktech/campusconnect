import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
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

  // --- CONTACT LOGIC ---
  const handleContact = (method) => {
    if (!listing) return;

    const seller = listing.seller || {};
    const phoneNumber = seller.phoneNumber;
    const whatsappNumber = seller.whatsapp || phoneNumber;

    if (!phoneNumber) {
      toast.error("This seller hasn't provided contact details.", { icon: '🚫' });
      return;
    }

    if (method === 'call') {
      window.location.href = `tel:${phoneNumber}`;
    }
    else if (method === 'whatsapp') {
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      const message = `Hi ${seller.name || 'there'}, I saw your listing for "${listing.title}" on CommunityMart. Is it still available?`;
      const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  // --- 🟢 NEW: SHARE LOGIC ---
  const handleShare = async () => {
    const shareData = {
      title: `Check out this ad: ${listing.title}`,
      text: `Hey, I found this on CommunityMart: ${listing.title} for PKR ${listing.price}. Check it out here:`,
      url: window.location.href, // Gets the current page URL
    };

    // 1. Try Native Share (Mobile "Sheet" Experience)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Opened share menu!');
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } 
    // 2. Fallback to Direct WhatsApp Share (Desktop)
    else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
      window.open(whatsappUrl, '_blank');
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
                objectFit: 'contain'
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
                <span className="ms-3 text-muted" style={{ fontSize: '0.9rem' }}>
                  🕒 Posted {listing.createdAt ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true }) : 'Just now'}
                </span>
              </div>

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

              {/* SELLER INFO */}
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

              <h5 className="fw-bold mt-3">Description</h5>
              <p className="card-text text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
                {listing.description}
              </p>

              {/* ACTION BUTTONS */}
              <div className="mt-auto pt-4">
                <div className="d-grid gap-3">
                  
                  {/* Primary: Chat on WhatsApp */}
                  <button
                    onClick={() => handleContact('whatsapp')}
                    className="btn btn-success btn-lg shadow-sm d-flex align-items-center justify-content-center gap-2"
                  >
                     {/* Simple WhatsApp-like icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592z"/>
                    </svg>
                    Chat on WhatsApp
                  </button>

                  <div className="d-flex gap-3">
                    {/* Call Button */}
                    <button
                      onClick={() => handleContact('call')}
                      className="btn btn-outline-primary btn-lg flex-grow-1"
                    >
                      📞 Call Seller
                    </button>

                    {/* 🟢 NEW SHARE BUTTON */}
                    <button
                      onClick={handleShare}
                      className="btn btn-outline-dark btn-lg flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      title="Share this ad"
                    >
                      {/* Professional Share Icon (SVG) */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                      </svg>
                      Share
                    </button>
                  </div>
                  
                   {/* Go Back Link - Made smaller to prioritize actions */}
                   <div className="text-center mt-2">
                      <button onClick={() => navigate('/listings')} className="btn btn-link text-muted text-decoration-none">
                        ← Back to listings
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