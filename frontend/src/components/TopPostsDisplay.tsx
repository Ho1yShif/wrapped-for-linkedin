import React from 'react';
import type { LinkedInTopPost } from '@types';
import '../styles/TopPostsDisplay.css';

interface TopPostsDisplayProps {
  posts: LinkedInTopPost[];
}

// Clean up LinkedIn URL to be embeddable
const getCleanLinkedInUrl = (url: string): string => {
  try {
    // Remove any trailing slashes and query parameters
    return url.split('?')[0].replace(/\/$/, '');
  } catch {
    return url;
  }
};

export const TopPostsDisplay: React.FC<TopPostsDisplayProps> = ({ posts }) => {
  const formatEngagements = (num: number): string => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (!posts || posts.length === 0) {
    return null;
  }

  // Display exactly 6 posts maximum in 2x3 grid layout
  const displayedPosts = posts.slice(0, 6);

  return (
    <div className="top-posts-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Top posts</h2>
          <p className="section-subtitle">Your 6 most engaging LinkedIn posts</p>
        </div>
      </div>

      {/* Disclaimer Callout */}
      <details className="metrics-disclaimer">
        <summary className="disclaimer-summary">ℹ️ Why do metrics differ between exports and LinkedIn? </summary>
        <div className="disclaimer-content">
          <p>
            Your LinkedIn analytics export includes more engagement types than what's publicly visible on posts. Export totals include reactions, comments, shares, reposts, and content clicks, while LinkedIn posts only display reactions and comments by default.
          </p>
        </div>
      </details>

      <div className="posts-container">
        {displayedPosts.map((post) => {
          const cleanUrl = getCleanLinkedInUrl(post.url);

          const handlePostClick = () => {
            window.open(post.url, '_blank');
          };

          return (
            <div key={post.url} className="post-card" onClick={handlePostClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handlePostClick()}>
              <div className="post-header">
                <div className="post-rank-badge">{post.rank}</div>
                <div className="post-date">{formatDate(post.publish_date)}</div>
              </div>

              <div className="post-content">
                <div className="post-embed-wrapper">
                  {/* LinkedIn post embed using iframe */}
                  <iframe
                    src={`https://www.linkedin.com/embed/feed/update/${cleanUrl.split('/').pop()}`}
                    height="350"
                    width="100%"
                    frameBorder="0"
                    allowFullScreen
                    className="linkedin-iframe"
                    title={`LinkedIn post #${post.rank}`}
                  />
                </div>
              </div>

              <div
                className="top-post-stats"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <div
                  className="top-post-stat-box"
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-card) 100%)',
                    borderRadius: '12px',
                    border: '2px solid var(--border-color-light)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                >
                  <div className="top-post-stat-icon" style={{ fontSize: '1.8rem', flexShrink: 0, display: 'flex', alignItems: 'center' }}>❤️</div>
                  <div className="top-post-stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                    <div className="top-post-stat-value" style={{ fontWeight: 700, fontSize: '1.5rem', color: '#0A8FFF', lineHeight: 1 }}>{formatEngagements(post.engagements)}</div>
                    <div className="top-post-stat-label" style={{ fontSize: '0.75rem', color: '#B3B3B3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1 }}>Engagements</div>
                  </div>
                </div>
                {post.impressions && post.impressions > 0 && (
                  <div
                    className="top-post-stat-box"
                    style={{
                      flex: 1,
                      minWidth: '130px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-card) 100%)',
                      borderRadius: '12px',
                      border: '2px solid var(--border-color-light)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="top-post-stat-icon" style={{ fontSize: '1.8rem', flexShrink: 0, display: 'flex', alignItems: 'center' }}>✨</div>
                    <div className="top-post-stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                      <div className="top-post-stat-value" style={{ fontWeight: 700, fontSize: '1.5rem', color: '#0A8FFF', lineHeight: 1 }}>{formatEngagements(post.impressions)}</div>
                      <div className="top-post-stat-label" style={{ fontSize: '0.75rem', color: '#B3B3B3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1 }}>Impressions</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
