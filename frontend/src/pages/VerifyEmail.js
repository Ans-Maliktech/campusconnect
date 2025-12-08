import React, { useState, useContext, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { verifyEmail, resendCode } from '../services/authService';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  
  // Timer state (15 Minutes = 900 Seconds)
  const [timeLeft, setTimeLeft] = useState(900);

  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;

  // Handle case where user navigates directly without context
  useEffect(() => {
    if (!email) {
      toast.error("No email found. Please login or signup first.");
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 🟢 CRITICAL FIX: Handle verification submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    // Validate code length
    if (code.length !== 6) {
      toast.error("Code must be 6 digits.");
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting verification with:', { email, code });
      
      // 🟢 Call verification API with trimmed code
      const userData = await verifyEmail({ 
        email: email.trim(), 
        code: code.trim() 
      });
      
      console.log('✅ Verification successful, received user data:', userData);
      
      // 🟢 Update auth context with complete user data
      setUser(userData);
      
      toast.success("Email Verified! Welcome aboard! 🎉", { duration: 3000 });
      
      // 🟢 CORRECTED: Navigate to /listings (your actual route)
      setTimeout(() => {
        navigate('/listings', { replace: true });
      }, 500);
      
    } catch (err) {
      console.error('❌ Verification failed:', err);
      
      const errorMessage = err.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(errorMessage, { duration: 4000 });
      
      // 🟢 If code expired, prompt to resend
      if (errorMessage.includes('expired')) {
        toast.error('Please request a new code.', { duration: 3000 });
      }
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Handle resend code
  const handleResend = async () => {
    setResendLoading(true);
    toast.dismiss();
    
    try {
      console.log('📨 Requesting new verification code for:', email);
      
      await resendCode(email.trim());
      
      toast.success("New code sent! Check your inbox 📧", { duration: 3000 });
      
      // Reset timer on successful resend
      setTimeLeft(900);
      setCode(''); // Clear old code input
      
    } catch (err) {
      console.error('❌ Resend failed:', err);
      
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
            
            {/* Dynamic timer display */}
            {timeLeft > 0 ? (
              <p className={`small fw-bold ${timeLeft < 60 ? 'text-danger' : 'text-primary'}`}>
                Code expires in: {formatTime(timeLeft)}
              </p>
            ) : (
              <p className="small text-danger fw-bold">Code expired. Please request a new one.</p>
            )}
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
                disabled={loading}
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-2 fw-bold shadow-sm"
              disabled={loading || timeLeft === 0 || code.length !== 6}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </Button>
          </Form>
          
          <div className="text-center mt-4">
            <p className="text-muted small mb-1">Didn't receive the code?</p>
            
            <Button 
              variant="link" 
              className="p-0 text-decoration-none fw-bold" 
              onClick={handleResend}
              disabled={resendLoading || timeLeft > 0}
              style={{ 
                color: timeLeft > 0 ? '#6c757d' : '', 
                cursor: timeLeft > 0 ? 'not-allowed' : 'pointer' 
              }}
            >
              {resendLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : timeLeft > 0 ? (
                `Resend available in ${formatTime(timeLeft)}`
              ) : (
                'Resend Code Now'
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifyEmail;