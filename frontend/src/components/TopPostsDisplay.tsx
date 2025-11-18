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

  // Calculate summary statistics
  const totalEngagements = posts.reduce((sum, post) => sum + post.engagements, 0);
  const totalImpressions = posts.reduce((sum, post) => sum + (post.impressions || 0), 0);
  const topPostEngagements = posts[0]?.engagements || 0;

  return (
    <div className="top-posts-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">🏆 Top posts</h2>
          <p className="section-subtitle">Your most engaging LinkedIn content with previews</p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats">
        <div className="summary-stat-card">
          <div className="summary-stat-number">{formatEngagements(totalEngagements)}</div>
          <div className="summary-stat-label">Total Engagements</div>
        </div>
        <div className="summary-stat-card">
          <div className="summary-stat-number">{formatEngagements(totalImpressions)}</div>
          <div className="summary-stat-label">Total Impressions</div>
        </div>
        <div className="summary-stat-card">
          <div className="summary-stat-number">{formatEngagements(topPostEngagements)}</div>
          <div className="summary-stat-label">Top Post Engagements</div>
        </div>
      </div>

      <div className="posts-container">
        {posts.map((post) => {
          const cleanUrl = getCleanLinkedInUrl(post.url);

          return (
            <div key={post.url} className="post-card">
              <div className="post-header">
                <div className="post-rank-badge">#{post.rank}</div>
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

              <div className="post-stats">
                <div className="stat-box">
                  <div className="stat-icon">❤️</div>
                  <div className="stat-info">
                    <div className="stat-value">{formatEngagements(post.engagements)}</div>
                    <div className="stat-label">Engagements</div>
                  </div>
                </div>
                {post.impressions && post.impressions > 0 && (
                  <div className="stat-box">
                    <div className="stat-icon">✨</div>
                    <div className="stat-info">
                      <div className="stat-value">{formatEngagements(post.impressions)}</div>
                      <div className="stat-label">Impressions</div>
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
