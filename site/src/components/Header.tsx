import '../styles/Header.css';

interface HeaderProps {
  onLogoClick?: () => void;
  onClearCache?: () => void;
  hasCachedData?: boolean;
}

export function Header({ onLogoClick }: HeaderProps) {
  const handleHomeClick = () => {
    onLogoClick?.();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <button
            className="wrapped-for-linkedin-title-container"
            onClick={handleHomeClick}
            aria-label="Navigate to home"
            title="Wrapped for LinkedIn home"
          >
            <div className="logo-wrapper">
              <img
                src="/images/title.svg"
                alt="Wrapped for LinkedIn"
                className="wrapped-for-linkedin-title-svg"
              />
            </div>
          </button>
        </div>
        <div className="header-right">
          <a
            href="https://render.com"
            target="_blank"
            rel="noopener noreferrer"
            className="render-logo-link"
            aria-label="Visit Render.com"
          >
            <span className="render-powered-text" data-mobile-text="DEPLOYED ON">POWERED BY AND DEPLOYED ON</span>
            <img
              src="/images/render-logo.png"
              alt="Render"
              className="render-logo"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
