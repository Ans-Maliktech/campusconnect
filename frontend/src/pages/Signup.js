import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // 🟢 Import Toast
import { AuthContext } from '../context/AuthContext';
import { signup } from '../services/authService';

/**
 * Signup Page
 * Handles new user registration
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

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // 🟢 Call API
      await signup(formData); // Note: We don't setUser here anymore!

      toast.success("Code sent! Check your email. 📧", { duration: 5000 });

      // 🟢 Navigate to Verify Page AND pass the email
      navigate('/verify-email', { state: { email: formData.email } });

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="shadow border-0">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4 fw-bold text-primary">Create Account</h2>
              <p className="text-center text-muted mb-4">Join the campus marketplace today</p>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* 🟢 Updated: Removed 'Optional' text and added 'required' */}
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    placeholder="0300 1234567"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>WhatsApp Number (Optional)</Form.Label>
                  <Form.Control
                    type="tel"
                    name="whatsapp"
                    placeholder="Your WhatsApp number"
                    value={formData.whatsapp}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="mb-0 text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none fw-bold">Login here</Link>
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