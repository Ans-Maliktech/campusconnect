import React, { useState, useContext, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { verifyEmail, resendCode } from '../services/authService'; // 🟢 Import resendCode

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false); // 🟢 New State for Resend
  const { setUser } = useContext(AuthContext);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email passed from Signup/Login page state
  const email = location.state?.email;

  // Handle case where user navigates directly without context
  useEffect(() => {
    if (!email) {
      toast.error("No email found. Please login or signup first.");
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    if (code.length !== 6) {
        toast.error("Code must be 6 digits.");
        setLoading(false);
        return;
    }

    try {
      // 🟢 Call API to verify code
      const userData = await verifyEmail({ email, code });
      
      // If success, log them in
      setUser(userData);
      toast.success("Email Verified! Welcome aboard! 🎉", { duration: 3000 });
      navigate('/dashboard', { replace: true });
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 NEW: Handle Resend Code
  const handleResend = async () => {
    setResendLoading(true);
    toast.dismiss();
    try {
      await resendCode(email);
      toast.success("New code sent! Check your inbox 📧");
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend code.';
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow-lg border-0 p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <div style={{ fontSize: '3rem' }}>📧</div>
            <h3 className="fw-bold text-primary">Verify Email</h3>
            <p className="text-muted mb-2">
              We sent a 6-digit code to: <br /> 
              <strong className="text-dark">{email}</strong>
            </p>
            <p className="small text-danger">Code expires in 15 minutes.</p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Enter Verification Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                maxLength="6"
                className="text-center fw-bold fs-4 py-2"
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
          
          <div className="text-center mt-4">
            {/* 🟢 UPDATED: Using a Button for Resend instead of Link */}
            <p className="text-muted small mb-1">Didn't receive the code?</p>
            <Button 
                variant="link" 
                className="p-0 text-decoration-none fw-bold" 
                onClick={handleResend}
                disabled={resendLoading}
            >
                {resendLoading ? 'Sending...' : 'Resend Code'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifyEmail;