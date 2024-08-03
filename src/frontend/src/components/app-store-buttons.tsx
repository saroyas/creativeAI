import React from 'react';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

const styles = {
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    color: '#000',
    padding: '0.3rem 0.8rem',
    borderRadius: '5px',
    textDecoration: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease, color 0.3s ease',
    fontSize: '0.9rem',
  },
  buttonHover: {
    backgroundColor: '#f8f8f8',
  },
  buttonDisabled: {
    backgroundColor: '#ddd',
    color: '#999',
    cursor: 'not-allowed',
  },
  icon: {
    marginRight: '0.3rem',
  },
};

const AppStoreButtons = () => {
  return (
    <div style={styles.buttonContainer}>
      <a
        href="https://apps.apple.com/gb/app/ai-uncensored/id6584514348"
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...styles.button }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor)}
      >
        <FaApple size={25} style={styles.icon} />
        <span>App Store</span>
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=info.aiuncensored.app"
        style={{ ...styles.button}}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor)}
      >
        <FaGooglePlay size={25} style={styles.icon} />
        <span>Play Store</span>
      </a>
    </div>
  );
};

export default AppStoreButtons;
