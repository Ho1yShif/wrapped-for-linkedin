import React from 'react';
import type { LinkedInTopPost } from '../types';
import '../styles/TopPostsDisplay.css';

interface TopPostsDisplayProps {
  posts: LinkedInTopPost[];
}

export const TopPostsDisplay: React.FC<TopPostsDisplayProps> = ({ posts }) => {
  const formatEngagements = (num: number): string => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
  };

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="top-posts-section">
      <h2 className="section-title">🏆 Top Performing Posts</h2>
      <p className="section-subtitle">Your most engaging content</p>

      <div className="posts-container">
        {posts.map((post) => (
          <div key={post.rank} className="post-card">
            <div className="post-header">
              <div className="post-rank-badge">#{post.rank}</div>
              <div className="post-date">{post.publish_date}</div>
            </div>

            <div className="post-content">
              <div className="post-preview">
                <div className="post-text">
                  <p className="post-desc">This is your top performing post on LinkedIn. Click below to view the full post and responses.</p>
                  <p className="post-link">
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                      View on LinkedIn ↗
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="post-stats">
              {post.impressions && post.impressions > 0 && (
                <div className="stat-box">
                  <div className="stat-icon">👁️</div>
                  <div className="stat-info">
                    <div className="stat-value">{formatEngagements(post.impressions)}</div>
                    <div className="stat-label">Impressions</div>
                  </div>
                </div>
              )}
              <div className="stat-box">
                <div className="stat-icon">👍</div>
                <div className="stat-info">
                  <div className="stat-value">{formatEngagements(post.engagements)}</div>
                  <div className="stat-label">Engagements</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
