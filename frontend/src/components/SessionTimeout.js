import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logout } from '../services/authService';

// 2 Minutes in milliseconds
const TIMEOUT_DURATION = 2 * 60 * 1000; 

const SessionTimeout = ({ isAuthenticated, setUser }) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const handleLogout = useCallback(() => {
    if (isAuthenticated) {
      logout(); // Clear localStorage
      setUser(null); // Clear Global State
      toast.error("Session expired due to inactivity.", { icon: '⏳' });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, setUser]);

  // Function to reset the timer whenever user moves mouse/types
  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_DURATION);
  }, [isAuthenticated, handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Events to listen for
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Start the timer initially
    resetTimer();

    // Attach listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup listeners on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, resetTimer]);

  return null; // This component doesn't render anything visible
};

export default SessionTimeout;