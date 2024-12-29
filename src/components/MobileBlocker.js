import React, { useEffect } from 'react';
import './MobileBlocker.css';

/**
 * Component that displays a full-screen overlay blocking mobile device access
 * 
 * Renders a message informing users that the application is desktop-only,
 * prevents scrolling on mobile devices, and provides a link to the repository.
 * Automatically handles adding/removing scroll-blocking CSS class on mount/unmount.
 * 
 * @component
 * @returns {JSX.Element} Full-screen mobile blocking overlay
 */
const MobileBlocker = () => {
  useEffect(() => {
    document.body.classList.add('mobile-blocked');
    
    return () => {
      document.body.classList.remove('mobile-blocked');
    };
  }, []);

  return (
    <div className="mobile-blocker">
      <div className="mobile-blocker-content">
        <i className="fas fa-desktop"></i>
        <h1>Desktop only!</h1>
        <p>This application is designed for desktop use only. Please access it from a desktop computer.</p>
        <a 
          href="https://github.com/davidsarratgonzalez/git-brush"
          target="_blank"
          rel="noopener noreferrer"
          className="repo-link"
        >
          <i className="fab fa-github"></i>
          View repository
        </a>
      </div>
    </div>
  );
};

export default MobileBlocker;