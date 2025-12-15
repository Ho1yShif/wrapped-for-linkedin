import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { exportCardAsImage } from '@exports/imageExport';
import { exportCardsAsPDFBatch } from '@exports/pdfExport';
import { DownloadInstructions } from '@components/WrappedStories/DownloadInstructions';
import type { ShareableCard } from '@/types/wrappedStories';
import '@styles/ShareButton.css';

interface ShareButtonProps {
  cardId: string;
  card: ShareableCard;
  cardRef: React.RefObject<HTMLDivElement>;
  allCards?: React.RefObject<HTMLDivElement>[];
  summaryMetrics?: {
    impressions: string;
    membersReached: string;
  };
  onPauseAutoplay?: () => void;
}

type ExportOption = 'current-card' | 'all-cards' | null;

/**
 * ShareButton component with dropdown menu for export options
 * Supports PNG export for single cards and PDF export for all cards
 */
export const ShareButton: React.FC<ShareButtonProps> = ({
  cardId,
  cardRef,
  allCards = [],
  summaryMetrics,
  onPauseAutoplay,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [exportType, setExportType] = useState<ExportOption>(null);
  const [error, setError] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: string; left: string }>({ top: '0px', left: '0px' });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update dropdown position when it opens
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth <= 480;

      if (isMobile) {
        // On mobile, center the menu in viewport
        const top = '50%';
        const left = '50%';
        setDropdownPosition({ top, left });
      } else {
        // On desktop, position below button
        const top = rect.bottom + 10; // 10px below button
        const left = rect.left + (rect.width / 2) - 140; // Center dropdown (280px / 2)

        // Keep dropdown within viewport
        const adjustedLeft = Math.max(10, Math.min(window.innerWidth - 290, left));

        setDropdownPosition({ top: `${top}px`, left: `${adjustedLeft}px` });
      }
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }

    return undefined;
  }, [isDropdownOpen]);

  /**
   * Handle single card PNG export
   */
  const handlePNGExport = useCallback(async () => {
    if (!cardRef.current) {
      setError('Card element not found');
      return;
    }

    setIsExporting(true);
    setError(null);
    setIsDropdownOpen(false);
    setExportType('current-card');

    try {
      const imageDataUrl = await exportCardAsImage(cardRef.current);

      // Download image from data URL
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = `wrapped-for-linkedin-${cardId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show instructions
      setShowInstructions(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export card';
      setError(errorMessage);
      console.error('Card export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [cardRef, cardId]);

  /**
   * Handle PDF export of all cards using optimized batch processing
   * Waits for all cards to be rendered as they auto-play through
   */
  const handlePDFExport = useCallback(async () => {
    if (!allCards || allCards.length === 0) {
      setError('No cards available for PDF export');
      return;
    }

    setIsExporting(true);
    setError(null);
    setIsDropdownOpen(false);
    setExportType('all-cards');

    try {
      // Collect all card elements - some might not be refs yet, so wait for them
      const cardElements: HTMLElement[] = [];

      // First, add any already-rendered cards from the refs
      for (const ref of allCards) {
        if (ref && ref.current) {
          cardElements.push(ref.current);
        }
      }

      // If we don't have all cards yet, wait for them to be rendered
      if (cardElements.length < allCards.length) {
        // Wait a bit for all refs to be populated
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try again to get all card elements
        cardElements.length = 0;
        for (const ref of allCards) {
          if (ref && ref.current) {
            cardElements.push(ref.current);
          }
        }
      }

      if (cardElements.length === 0) {
        setError('Card elements not found. Make sure cards are displayed first.');
        return;
      }

      const year = new Date().getFullYear();
      const filename = `wrapped-for-linkedin-${year}.pdf`;

      // Use optimized batch export
      await exportCardsAsPDFBatch(cardElements, filename);

      // Show instructions
      setShowInstructions(true);
    } catch (err) {
      if (err instanceof Error && err.message === 'Export cancelled') {
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to export PDF';
        setError(errorMessage);
        console.error('PDF export failed:', err);
      }
    } finally {
      setIsExporting(false);
    }
  }, [allCards]);

  /**
   * Handle export option selection
   */
  const handleExportOption = useCallback(
    (option: ExportOption) => {
      if (option === 'current-card') {
        handlePNGExport();
      } else if (option === 'all-cards') {
        handlePDFExport();
      }
    },
    [handlePNGExport, handlePDFExport]
  );

  /**
   * Toggle dropdown visibility
   */
  const handleToggleDropdown = useCallback(() => {
    if (!isExporting) {
      setIsDropdownOpen(prev => !prev);
      // Pause autoplay when share button is clicked
      if (!isDropdownOpen && onPauseAutoplay) {
        onPauseAutoplay();
      }
    }
  }, [isExporting, isDropdownOpen, onPauseAutoplay]);

  return (
    <div className="share-button-wrapper">
      <div className="share-button-container">
        {/* Main Share Button */}
        <button
          ref={buttonRef}
          className="share-button"
          onClick={handleToggleDropdown}
          disabled={isExporting}
          aria-label="Share and export Wrapped for LinkedIn"
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
        >
          {isExporting ? (
            <>
              <span className="share-spinner" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <img
                src="/images/dashboard/linkedin-logo.png"
                alt="LinkedIn"
                className="linkedin-logo-btn"
              />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Dropdown Menu - Rendered as Portal to escape stacking context */}
      {isDropdownOpen && !isExporting && createPortal(
        <>
          <div className="share-dropdown-backdrop" onClick={() => setIsDropdownOpen(false)} />
          <div
            className="share-dropdown-menu"
            role="menu"
            style={dropdownPosition}
            ref={dropdownRef}
          >
            <button
              className="dropdown-option"
              onClick={() => handleExportOption('current-card')}
              role="menuitem"
            >
              <img src="/images/share/png-file.png" alt="PNG" className="option-icon" style={{ height: '2rem' }} />
              <div className="option-content">
                <div className="option-title">PNG</div>
                <div className="option-description">Export current card as a PNG</div>
              </div>
            </button>

            <button
              className="dropdown-option"
              onClick={() => handleExportOption('all-cards')}
              role="menuitem"
            >
              <img src="/images/share/pdf-file.png" alt="PDF" className="option-icon" style={{ height: '2rem' }} />
              <div className="option-content">
                <div className="option-title">PDF</div>
                <div className="option-description">Export all cards as a single PDF</div>
              </div>
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Error Message */}
      {error && (
        <div className="share-feedback error">
          ❌ {error}
        </div>
      )}

      {/* Download Instructions Modal - Rendered as Portal to escape stacking context */}
      {showInstructions && createPortal(
        <DownloadInstructions
          isVisible={showInstructions}
          impressions={summaryMetrics?.impressions || '0'}
          membersReached={summaryMetrics?.membersReached || '0'}
          exportType={exportType ?? 'current-card'}
          onDismiss={() => setShowInstructions(false)}
        />,
        document.body
      )}
    </div>
  );
};
