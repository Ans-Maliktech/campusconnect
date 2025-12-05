import React, { useState, useContext, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { verifyEmail } from '../services/authService';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email passed from Signup page
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("No email found. Please sign up first.");
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    try {
      // 🟢 Verify Code
      const userData = await verifyEmail({ email, code });
      
      // If success, NOW we log them in
      setUser(userData);
      toast.success("Email Verified! Welcome aboard! 🎉");
      navigate('/dashboard');
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow-lg border-0 p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <div style={{ fontSize: '3rem' }}>📧</div>
            <h3 className="fw-bold text-primary">Verify Email</h3>
            <p className="text-muted">
              We sent a 6-digit code to <br /> 
              <strong>{email}</strong>
            </p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Enter Verification Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength="6"
                className="text-center fw-bold fs-4 py-2 letter-spacing-2"
                required
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-2 fw-bold shadow-sm"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </Button>
          </Form>
          
          <div className="text-center mt-3">
            <small className="text-muted">Didn't receive it? Check Spam folder.</small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifyEmail; 