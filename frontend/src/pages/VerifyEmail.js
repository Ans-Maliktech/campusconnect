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
  
  // 🟢 TIMER STATE (15 Minutes = 900 Seconds)
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

  // 🟢 TIMER LOGIC
  useEffect(() => {
    // If timer reaches 0, stop counting
    if (timeLeft <= 0) return;

    // Create interval to decrement timer every second
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Helper: Format seconds into MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
      const userData = await verifyEmail({ email, code });
      
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

  const handleResend = async () => {
    setResendLoading(true);
    toast.dismiss();
    try {
      await resendCode(email);
      toast.success("New code sent! Check your inbox 📧");
      // 🟢 RESET TIMER on successful resend
      setTimeLeft(900); 
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
            
            {/* 🟢 DYNAMIC TIMER DISPLAY */}
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
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-2 fw-bold shadow-sm"
              disabled={loading || timeLeft === 0} // Disable if expired
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </Button>
          </Form>
          
          <div className="text-center mt-4">
            <p className="text-muted small mb-1">Didn't receive the code?</p>
            
            {/* 🟢 SMART RESEND BUTTON */}
            <Button 
                variant="link" 
                className="p-0 text-decoration-none fw-bold" 
                onClick={handleResend}
                // Disable if loading OR if timer is still running
                disabled={resendLoading || timeLeft > 0}
                style={{ 
                  color: timeLeft > 0 ? '#6c757d' : '', 
                  cursor: timeLeft > 0 ? 'not-allowed' : 'pointer' 
                }}
            >
                {resendLoading ? 'Sending...' : timeLeft > 0 ? `Resend available in ${formatTime(timeLeft)}` : 'Resend Code Now'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifyEmail;