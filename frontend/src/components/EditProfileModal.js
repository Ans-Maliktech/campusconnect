import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast installed
import { AuthContext } from '../context/AuthContext';
import { updateUserProfile } from '../services/authService'; // Import the new service

const EditProfileModal = ({ show, handleClose }) => {
  const { user, setUser } = useContext(AuthContext);
  
  // Local state for form inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // specific useEffect to populate form when the modal opens or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Call the Professional Service
      const updatedUser = await updateUserProfile({ 
        name, 
        phone 
      });

      // 2. Update the Context (so the Navbar avatar updates immediately)
      setUser(updatedUser);

      // 3. UX Feedback
      toast.success("Profile updated successfully!");
      handleClose();

    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      {/* Added specific styling for Dark Mode compatibility 
         based on your "Deep Midnight" theme 
      */}
      <Modal.Header 
        closeButton 
        style={{ 
          borderBottom: '1px solid var(--border-subtle)', 
          background: 'var(--bg-surface)', 
          color: 'var(--text-main)' 
        }}
      >
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="0300..."
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
              className="px-4"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditProfileModal;