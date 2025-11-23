import React, { useRef } from 'react';
import { ShareButton } from './ShareButton';
import type { ShareableCard } from '../../types/wrappedStories';

interface StoryCardProps {
  card: ShareableCard;
  isActive: boolean;
  cardIndex: number;
  cardRef?: React.RefObject<HTMLDivElement>;
  allCards?: React.RefObject<HTMLDivElement>[];
}

export const StoryCard: React.FC<StoryCardProps> = ({
  card,
  isActive,
  cardIndex,
  cardRef: externalCardRef,
  allCards,
}) => {
  const internalCardRef = useRef<HTMLDivElement>(null);
  const cardRef = externalCardRef || internalCardRef;

  return (
    <div
      ref={cardRef}
      className={`story-card ${card.type} ${isActive ? 'active' : ''}`}
      style={{
        '--card-gradient': card.gradient,
        '--card-bg-color': card.backgroundColor,
      } as React.CSSProperties & { [key: string]: string }}
      role="region"
      aria-label={`Card ${cardIndex + 1}: ${card.title}`}
    >
      {/* Card Content */}
      <div className="card-content-wrapper">
        <div className="card-header">
          <h2 className="card-title">{card.title}</h2>
        </div>

        {/* Circular Logo */}
        <img
          src="/wrapped-logo.png"
          alt="LinkedIn Wrapped"
          className="card-circular-logo"
        />


        <div className="card-body">
          <span className="card-icon">{card.data.icon}</span>

          {card.type === 'year-summary' ? (
            // Summary card with multiple metrics
            <div className="summary-metrics">
              <div className="metric-row">
                <div className="metric">
                  <div className="metric-value">{card.data.impressions}</div>
                  <div className="metric-label">Total impressions</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{card.data.membersReached}</div>
                  <div className="metric-label">Members reached</div>
                </div>
              </div>
              <div className="metric-row">
                <div className="metric">
                  <div className="metric-value">{card.data.engagements}</div>
                  <div className="metric-label">Total engagements</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{card.data.newFollowers}</div>
                  <div className="metric-label">New followers</div>
                </div>
              </div>
            </div>
          ) : card.type === 'top-post' ? (
            // Peak Performer card with LinkedIn embed and metrics
            <div className="peak-performer-content">
              {/* Metrics Display */}
              <div className="peak-post-metrics">
                <div className="peak-metric">
                  <div className="peak-metric-icon">❤️</div>
                  <div className="peak-metric-info">
                    <div className="peak-metric-value">{card.data.value}</div>
                    <div className="peak-metric-label">Engagements</div>
                  </div>
                </div>
                {card.data.impressions && (
                  <div className="peak-metric">
                    <div className="peak-metric-icon">✨</div>
                    <div className="peak-metric-info">
                      <div className="peak-metric-value">{card.data.impressions}</div>
                      <div className="peak-metric-label">Impressions</div>
                    </div>
                  </div>
                )}
              </div>

              {/* LinkedIn Post Embed */}
              <div className="peak-post-embed-wrapper">
                {card.data.url ? (
                  <div className="peak-post-embed-container">
                    <iframe
                      src={`https://www.linkedin.com/embed/feed/update/${card.data.url.split('/').pop()}`}
                      height="300"
                      width="100%"
                      allowFullScreen
                      loading="lazy"
                      className="peak-post-iframe"
                      title="Peak Performer Post"
                    />
                  </div>
                ) : (
                  <div className="peak-post-fallback">
                    <div className="fallback-emoji">📌</div>
                    <p className="fallback-message">Top Post</p>
                  </div>
                )}
              </div>

              {/* Post Context */}
              {card.data.date && (
                <div className="peak-post-context">
                  Your most impactful moment
                </div>
              )}
            </div>
          ) : (
            <>
              {card.data.value && (
                <div className="card-value">{card.data.value}</div>
              )}

              {card.data.label && (
                <div className="card-label">{card.data.label}</div>
              )}

              {card.data.context && (
                <div className="card-context">{card.data.context}</div>
              )}
            </>
          )}
        </div>

        <div className="card-footer">
          <div className="branding">LinkedIn Wrapped</div>
          <ShareButton
            cardId={card.id}
            shareText={card.shareText}
            cardRef={cardRef as React.RefObject<HTMLDivElement>}
            allCards={allCards}
          />
        </div>
      </div>
    </div>
  );
};
