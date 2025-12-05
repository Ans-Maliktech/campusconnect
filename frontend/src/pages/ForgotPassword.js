import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword, resetPassword } from '../services/authService';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: Code & New Pass
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send Code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Reset code sent to your email!");
      setStep(2); // Move to next step
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ email, code, newPassword: password });
      toast.success("Password reset successful! Please login.");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow-lg border-0 p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body>
          <div className="text-center mb-4">
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
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100 fw-bold" disabled={loading}>
                {loading ? "Sending..." : "Send Verification Code"}
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
                  onChange={(e) => setCode(e.target.value)}
                  maxLength="6"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </Form.Group>
              <Button variant="success" type="submit" className="w-100 fw-bold" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </Form>
          )}
          
          <div className="text-center mt-3">
            <Button variant="link" className="text-decoration-none" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPassword;