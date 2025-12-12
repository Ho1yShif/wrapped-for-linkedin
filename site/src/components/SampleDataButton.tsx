import React from 'react';
import '../styles/SampleDataButton.css';

interface SampleDataButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const SampleDataButton: React.FC<SampleDataButtonProps> = ({
  onClick,
  isLoading,
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="sample-data-button"
    aria-label="Load demo analytics"
    aria-busy={isLoading}
  >
    {isLoading ? (
      <>
        <span className="spinner"></span>
        <span>Loading demo data...</span>
      </>
    ) : (
      <>
        <img src="/icon-profile.svg" alt="Profile" className="sample-data-button-icon"/>
        <span className="sample-data-button-text">Try with sample data</span>
      </>
    )}
  </button>
);
