import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { login } from '../services/authService';

/**
 * Login Page
 * Handles user authentication with verification check
 */
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
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
    setError('');
    setLoading(true);
    toast.dismiss();

    try {
      const userData = await login(formData);
      setUser(userData);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login error:', err);
      
      const errorData = err.response?.data;
      
      // 🟢 CHECK IF USER NEEDS TO VERIFY EMAIL
      if (errorData?.requiresVerification) {
        toast.error('Please verify your email first', { duration: 5000 });
        // Redirect to verification page
        navigate('/verify-email', { 
          state: { email: errorData.email } 
        });
      } else {
        const errorMessage = errorData?.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="glass-card shadow-lg">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">
                  <span className="text-gradient">Welcome Back</span>
                </h2>
                <p className="text-muted">Login to your CampusConnect account</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="mb-2 text-muted">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-decoration-none fw-bold text-gradient">
                    Sign up here
                  </Link>
                </p>
                <Link to="/forgot-password" className="text-muted text-decoration-none small">
                  Forgot password?
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Login;