  import React, { useState } from 'react';
  import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
  import { Link, useNavigate } from 'react-router-dom';
  import toast from 'react-hot-toast';
  import { signup } from '../services/authService';

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
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

      try {
        console.log('📤 Submitting signup for:', formData.email);
        
        // Call signup API (returns email, not token)
        const response = await signup(formData);
        
        console.log('✅ Signup successful:', response);

        // Show success message
        toast.success('✅ Verification code sent! Check your email.', { 
          duration: 5000,
          icon: '📧'
        });

        // Small delay to show toast, then navigate
        setTimeout(() => {
          console.log('🔄 Navigating to verify-email with email:', formData.email);
          navigate('/verify-email', { 
            state: { email: formData.email },
            replace: true  // Replace current history entry
          });
        }, 500);

      } catch (err) {
        console.error('❌ Signup error:', err);
        
        const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage, { duration: 4000 });
        setLoading(false);
      }
      // Don't set loading false here - let navigation happen
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
                  <p className="text-muted">Join the campus marketplace today</p>
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
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      autoComplete="new-password"
                    />
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
                  <Form.Group className="mb-4">
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
