import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
// For better icons, install react-icons and uncomment the line below:
// import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="btn nav-link d-flex align-items-center justify-content-center"
      style={{ 
        fontSize: '1.2rem', 
        padding: '0.5rem', 
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        marginLeft: '1rem',
        width: '40px',
        height: '40px',
        borderRadius: '50%'
      }}
      aria-label="Toggle Theme"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      {/* Emoji Version (Simple) */}
      {theme === 'light' ? '🌙' : '☀️'}

      {/* React Icons Version (Recommended - requires react-icons) */}
      {/* {theme === 'light' ? <FiMoon /> : <FiSun />} */}
    </button>
  );
};

export default ThemeToggle;