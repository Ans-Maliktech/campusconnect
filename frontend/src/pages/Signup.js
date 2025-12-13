import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signup } from '../services/authService';

// Simple SVG Icons for Password Toggle
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
  </svg>
);

/**
 * Signup Page
 * Handles new user registration with email verification
 */
const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    whatsapp: '',
    campusCode: '', // 🟢 Added new field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    toast.dismiss();

    // Client-side validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      toast.error('Phone number is required');
      setLoading(false);
      return;
    }

    // 🟢 Campus Code Validation
    if (!formData.campusCode.trim()) {
      setError('Campus Access Code is required to join');
      toast.error('Please enter the Campus Access Code found on posters');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting signup for:', formData.email);
      
      // Call signup API
      const response = await signup(formData);
      
      console.log('Signup successful:', response);

      // Show success message
      toast.success('Verification code sent! Check your email.', { 
        duration: 5000,
      });

      // Small delay to show toast, then navigate
      setTimeout(() => {
        console.log('Navigating to verify-email with email:', formData.email);
        navigate('/verify-email', { 
          state: { email: formData.email },
          replace: true  
        });
      }, 500);

    } catch (err) {
      console.error('Signup error:', err);
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Signup failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, { duration: 4000 });
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="glass-card shadow-lg">
            <Card.Body className="p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="fw-bold">
                  <span className="text-gradient">Create Account</span>
                </h2>
                <p className="text-muted">Join the Community marketplace today</p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Signup Form */}
              <Form onSubmit={handleSubmit}>
                {/* Full Name */}
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="name"
                  />
                </Form.Group>

                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                  <Form.Text className="text-muted">
                    We'll send a verification code to this email
                  </Form.Text>
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      style={{ borderLeft: 'none', borderColor: '#ced4da' }}
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                {/* Phone Number */}
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    placeholder="03001234567"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="tel"
                  />
                </Form.Group>

                {/* WhatsApp (Optional) */}
                <Form.Group className="mb-3">
                  <Form.Label>WhatsApp Number (Optional)</Form.Label>
                  <Form.Control
                    type="tel"
                    name="whatsapp"
                    placeholder="Your WhatsApp number"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="tel"
                  />
                </Form.Group>

                {/* 🟢 Campus Access Code (Strategic Feature) */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-primary">Campus Access Code <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="campusCode"
                    placeholder="e.g. CIT25"
                    value={formData.campusCode}
                    onChange={(e) => setFormData({...formData, campusCode: e.target.value.toUpperCase()})}
                    required
                    disabled={loading}
                    className="text-uppercase fw-bold"
                    style={{ letterSpacing: '2px' }}
                  />
                  <Form.Text className="text-muted" style={{ fontSize: '0.85rem' }}>
                    🔒 Found on campus posters. Ensures only real students join.
                  </Form.Text>
                </Form.Group>

                {/* Submit Button */}
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Form>

              {/* Login Link */}
              <div className="text-center mt-4">
                <p className="mb-0 text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none fw-bold text-gradient">
                    Login here
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Signup;