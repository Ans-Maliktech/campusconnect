import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // 🟢 Import Toast
import { AuthContext } from '../context/AuthContext';
import { login } from '../services/authService';

/**
 * Login Page
 * Handles user authentication with beautiful notifications
 */
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    // Dismiss any previous toasts so they don't stack up
    toast.dismiss();

    try {
      const userData = await login(formData);
      setUser(userData);

      // 🟢 Success Toast
      toast.success("Welcome back to CampusConnect!", {
        duration: 4000,
        position: 'top-center',
      });

      navigate('/dashboard');
    } catch (err) {
      // 🔴 Error Toast
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      });
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
              <h2 className="text-center mb-4 fw-bold text-primary">🎓 CampusConnect</h2>
              <h5 className="text-center mb-4 text-muted">Welcome Back</h5>

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
                    className="py-2"
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
                    className="py-2"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
                <div className="d-flex justify-content-end mb-3">
                  <Link to="/forgot-password" className="text-decoration-none small">Forgot Password?</Link>
                </div>
              </Form>

              <div className="text-center mt-4">
                <p className="mb-0 text-muted">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-decoration-none fw-bold">Sign up here</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Login;