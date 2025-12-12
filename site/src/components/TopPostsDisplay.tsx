import React, { useCallback, useMemo } from 'react';
import type { TopPost } from '@types';
import '../styles/TopPostsDisplay.css';

interface TopPostsDisplayProps {
  posts: TopPost[];
}

interface PostWithEmbedUrl extends TopPost {
  embedUrl: string | null;
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

// Generate embed URL from LinkedIn post URL
const generateEmbedUrl = (url: string): string | null => {
  try {
    const cleanUrl = getCleanLinkedInUrl(url);
    const postId = cleanUrl.split('/').pop();
    return postId ? `https://www.linkedin.com/embed/feed/update/${postId}` : null;
  } catch {
    return null;
  }
};

export const TopPostsDisplay: React.FC<TopPostsDisplayProps> = ({ posts }) => {
  // Memoized formatter functions with useCallback
  const formatEngagements = useCallback((num: number): string => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : String(Math.round(num));
  }, []);

  const formatDate = useCallback((dateStr: string): string => {
    if (!dateStr) return dateStr;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime())
        ? dateStr
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
    } catch {
      return dateStr;
    }
  }, []);

  if (!posts || posts.length === 0) {
    return null;
  }

  // Memoize displayed posts and embed URLs calculation
  const displayedPosts = useMemo(() => {
    return posts.slice(0, 6).map(post => ({
      ...post,
      embedUrl: generateEmbedUrl(post.url)
    })) as PostWithEmbedUrl[];
  }, [posts]);

  return (
    <div className="top-posts-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Top posts</h2>
          <p className="section-subtitle">What resonated most</p>
        </div>
      </div>

      {/* Disclaimer Callout */}
      <details className="metrics-disclaimer">
        <summary className="disclaimer-summary">𝒊 &nbsp; Why don't my exported numbers match what I see on my LinkedIn posts? </summary>
        <div className="disclaimer-content">
          <p>
            <strong>Time window:</strong> Your LinkedIn export captures the last 365 days of activity only. Older posts display metrics from within this rolling window, not their all-time totals.
          </p>
          <p>
            <strong>Engagement types:</strong> The export includes all engagement types (reactions, comments, shares, reposts, and clicks), while LinkedIn posts publicly show only reactions and comments.
          </p>
        </div>
      </details>

      <div className="posts-container">
        {displayedPosts.map((post) => {
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
                  {/* LinkedIn post embed using iframe with lazy loading */}
                  {post.embedUrl ? (
                    <iframe
                      src={post.embedUrl}
                      height="350"
                      width="100%"
                      allowFullScreen
                      loading="lazy"
                      className="linkedin-iframe"
                      title={`LinkedIn post #${post.rank}`}
                    />
                  ) : (
                    <div className="post-fallback">
                      <div className="fallback-icon">📌</div>
                      <p className="fallback-text">View post on LinkedIn</p>
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="fallback-link">
                        Open post
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="top-post-stats">
                <div className="top-post-stat-box">
                  <div className="top-post-stat-icon">
                    <img src="/images/dashboard/heart.png" alt="Engagements" />
                  </div>
                  <div className="top-post-stat-info">
                    <div className="top-post-stat-value">{formatEngagements(post.engagements)}</div>
                    <div className="top-post-stat-label">Engagements</div>
                  </div>
                </div>
                {post.impressions && post.impressions > 0 && (
                  <div className="top-post-stat-box">
                    <div className="top-post-stat-icon">
                      <img src="/images/dashboard/sparkle.png" alt="Impressions" />
                    </div>
                    <div className="top-post-stat-info">
                      <div className="top-post-stat-value">{formatEngagements(post.impressions)}</div>
                      <div className="top-post-stat-label">Impressions</div>
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
