import '../styles/Header.css';

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  const handleHomeClick = () => {
    onLogoClick?.();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <button
          className="linkedin-wrapped-title-container"
          onClick={handleHomeClick}
          aria-label="Navigate to home"
          title="LinkedIn Wrapped home"
        >
          <div className="logo-wrapper">
            <img
              src="/gift.png"
              alt="Gift decoration"
              className="gift-icon"
            />
            <h1 className="linkedin-wrapped-title">
              LinkedIn Wrapped
            </h1>
          </div>
        </button>
      </div>
    </header>
  );
}
