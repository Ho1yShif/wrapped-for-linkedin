import '../styles/Header.css';

interface HeaderProps {
  onLogoClick?: () => void;
  onClearCache?: () => void;
  hasCachedData?: boolean;
}

export function Header({ onLogoClick, onClearCache, hasCachedData = false }: HeaderProps) {
  const handleHomeClick = () => {
    onLogoClick?.();
  };

  const handleClearCacheClick = () => {
    onClearCache?.();
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
                src="/title.svg"
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
            <span className="render-powered-text">POWERED BY AND DEPLOYED ON</span>
            <img
              src="/render-logo.png"
              alt="Render"
              className="render-logo"
            />
          </a>
          {hasCachedData && (
            <button
              className="cache-clear-btn"
              onClick={handleClearCacheClick}
              title="Clear cache and upload new data"
              aria-label="Clear cached data"
            >
              Upload new data
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
