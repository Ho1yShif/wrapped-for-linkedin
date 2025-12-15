import React, { useCallback } from 'react';
import { openLinkedInShare } from '@utils/linkedinShareLink';
import '@styles/WrappedStories.css';

type ExportType = 'current-card' | 'all-cards';

interface DownloadInstructionsProps {
  isVisible: boolean;
  impressions?: string | number;
  membersReached?: string | number;
  exportType?: ExportType;
  onDismiss?: () => void;
}

/**
 * Component that displays instructions after downloading wrapped cards
 * Guides users to attach the downloaded file to their LinkedIn post
 * and provides a button to open LinkedIn sharing
 * Shows different instructions based on export type (single card PNG or multi-card PDF)
 */
export const DownloadInstructions: React.FC<DownloadInstructionsProps> = ({
  isVisible,
  impressions,
  membersReached,
  exportType = 'current-card',
  onDismiss,
}) => {
  const handleShareOnLinkedIn = useCallback(() => {
    // Open LinkedIn share with card data
    openLinkedInShare(impressions, membersReached);
  }, [impressions, membersReached]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="download-instructions-overlay">
      <div className="download-instructions-modal">
        {/* Header */}
        <div className="instructions-header">
          <h3 className="instructions-title">
            <img 
              src="/images/share/check.png" 
              alt="Check" 
              className="instructions-check-icon"
            />
            Download complete
          </h3>
          <button
            className="instructions-close-btn"
            onClick={onDismiss}
            aria-label="Close instructions"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="instructions-content">
          <p className="instructions-text">
            Follow these steps to share your Wrapped for LinkedIn:
          </p>

          <div className="instructions-steps">
            <p className="instruction-step">1. <b>Open LinkedIn.</b> Click the button below to open LinkedIn with a prepared post.</p>
            <p className="instruction-step"><strong>Note:</strong> Close the link preview by clicking <strong>X</strong> before attaching media.</p>
            <img src="/images/share/close-embed.png" alt="Close the link embed" className="instruction-image" />
            {exportType === 'current-card' ? (
              <>
                <p className="instruction-step">2. <b>Attach your card.</b> Click the image icon in the bottom left of the post modal. Select your Wrapped for LinkedIn card image (PNG file).</p>
                <img src="/images/share/add-media.png" alt="Click the image icon" className="instruction-image" />
              </>
            ) : (
              <>
                <p className="instruction-step">2. <b>Attach your cards.</b> Click the <b>+</b> icon at the bottom of the post modal to expand options. Click the document icon (second from the right) to upload a file and select your Wrapped for LinkedIn PDF file.
                </p>
                <div className="instruction-images-column">
                  <img src="/images/share/more.png" alt="Click the plus icon to expand options" className="instruction-image" />
                  <img src="/images/share/add-a-document.png" alt="Click the document icon to upload" className="instruction-image" />
                </div>
              </>
            )}
          </div>

          {/* Disclaimer */}
          <div className="instructions-disclaimer">
            <p className="disclaimer-text">
              𝒊 &nbsp; &nbsp; We can't automatically attach the file to your LinkedIn post without violating LinkedIn's terms of service.
              These manual steps ensure we stay compliant and respect LinkedIn's policies.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="instructions-actions">
          <button
            className="btn-share-linkedin"
            onClick={handleShareOnLinkedIn}
            aria-label="Share on LinkedIn with prepared text"
          >
            <img
              src="/images/dashboard/linkedin-logo.png"
              alt="LinkedIn"
              className="btn-linkedin-icon"
            />
            Share on LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
};
