import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword, resetPassword } from '../services/authService';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send Code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    try {
      await forgotPassword(email.trim());
      toast.success("Reset code sent to your email!", { duration: 3000 });
      setStep(2);
    } catch (err) {
      console.error('❌ Send code failed:', err);
      toast.error(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // 🟢 Ensure code is trimmed
      await resetPassword({ 
        email: email.trim(), 
        code: code.trim(), 
        newPassword: password 
      });
      
      toast.success("Password reset successful! Please login.", { duration: 3000 });
      
      setTimeout(() => {
        navigate('/login');
      }, 500);
      
    } catch (err) {
      console.error('❌ Reset password failed:', err);
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow-lg border-0 p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <div style={{ fontSize: '3rem' }}>🔑</div>
            <h3 className="fw-bold text-primary">Recover Account</h3>
            <p className="text-muted">
              {step === 1 ? "Enter your email to receive a code" : "Enter the code and your new password"}
            </p>
          </div>

          {step === 1 ? (
            <Form onSubmit={handleSendCode}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </Form.Group>
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 fw-bold py-2" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleReset}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Verification Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                  maxLength="6"
                  className="text-center fw-bold"
                  required
                  disabled={loading}
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  disabled={loading}
                />
              </Form.Group>
              <Button 
                variant="success" 
                type="submit" 
                className="w-100 fw-bold py-2" 
                disabled={loading || code.length !== 6}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </Form>
          )}
          
          <div className="text-center mt-3">
            <Button 
              variant="link" 
              className="text-decoration-none" 
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              ← Back to Login
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPassword;