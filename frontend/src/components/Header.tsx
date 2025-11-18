import { useState } from 'react';
import '../styles/Header.css';

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleHomeClick = () => {
    onLogoClick?.();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <button
          className="linkedin-wrapped-title-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleHomeClick}
          aria-label="Navigate to home"
          title="LinkedIn Wrapped home"
        >
          <div className="logo-wrapper">
            {/* Bow decoration */}
            <img
              src="/bow.png"
              alt="Bow decoration"
              className={`ribbon-bow ${isHovered ? 'visible' : ''}`}
            />
            <h1 className={`linkedin-wrapped-title ${isHovered ? 'hovered' : ''}`}>
              LinkedIn Wrapped
            </h1>
          </div>
        </button>
      </div>
    </header>
  );
}
