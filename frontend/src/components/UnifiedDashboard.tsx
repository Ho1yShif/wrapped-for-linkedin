import React from 'react';
import { SpotifyDashboard } from './SpotifyDashboard';
import { TopPostsDisplay } from './TopPostsDisplay';
import type { EngagementMetrics, LinkedInTopPost } from '../types';
import '../styles/UnifiedDashboard.css';

interface UnifiedDashboardProps {
  data: EngagementMetrics;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ data }) => {
  // Extract discovery data if available
  const discoveryData = data.discovery_data as any;
  const topPosts: LinkedInTopPost[] = data.top_posts || [];

  return (
    <div className="unified-dashboard">
      {/* Main Dashboard Section */}
      {discoveryData && (
        <SpotifyDashboard
          discovery={discoveryData}
          totalLikes={data.totalLikes || 0}
          totalComments={data.totalComments || 0}
          totalShares={data.totalShares || 0}
        />
      )}

      {/* Top Posts Section */}
      {topPosts.length > 0 && (
        <TopPostsDisplay posts={topPosts} />
      )}

      {/* Fallback content if no discovery data */}
      {!discoveryData && (
        <div className="fallback-section">
          <h1 className="fallback-title">Your LinkedIn Year in Review</h1>

          {topPosts.length > 0 ? (
            <TopPostsDisplay posts={topPosts} />
          ) : (
            <div className="empty-state">
              <p>No analytics data available for this file.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
