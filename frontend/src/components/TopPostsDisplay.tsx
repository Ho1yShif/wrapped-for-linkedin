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

  // Calculate summary statistics from displayed posts
  const totalEngagements = displayedPosts.reduce((sum, post) => sum + (post.engagements || 0), 0);
  const totalImpressions = displayedPosts.reduce((sum, post) => sum + (post.impressions || 0), 0);
  const avgEngagementRate = displayedPosts.length > 0
    ? (
        displayedPosts.reduce((sum, post) => {
          const impressions = post.impressions || 1;
          return sum + (post.engagements / impressions) * 100;
        }, 0) / displayedPosts.length
      ).toFixed(2)
    : '0.00';

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
          <div className="summary-stat-number">{avgEngagementRate}%</div>
          <div className="summary-stat-label">Avg Engagement Rate</div>
        </div>
      </div>

      <div className="posts-container">
        {displayedPosts.map((post) => {
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
                <div className="stat-box">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <div className="stat-value">
                      {post.impressions && post.impressions > 0
                        ? ((post.engagements / post.impressions) * 100).toFixed(2)
                        : '0.00'}%
                    </div>
                    <div className="stat-label">Engagement Rate</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
