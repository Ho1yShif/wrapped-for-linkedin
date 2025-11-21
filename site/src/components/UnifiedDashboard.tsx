import React from 'react';
import { SpotifyDashboard } from './SpotifyDashboard';
import { TopPostsDisplay } from './TopPostsDisplay';
import { DemographicsView } from './DemographicsView';
import type { EngagementMetrics, LinkedInTopPost, DemographicInsights } from '@types';
import '../styles/UnifiedDashboard.css';

interface UnifiedDashboardProps {
  data: EngagementMetrics;
  demographics?: DemographicInsights;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ data, demographics }) => {
  // Extract discovery data if available
  const discoveryData = data.discovery_data as any;
  const topPosts: LinkedInTopPost[] = data.top_posts || [];

  return (
    <div className="unified-dashboard">
      {/* Main Dashboard Section */}
      {discoveryData && (
        <SpotifyDashboard
          discovery={discoveryData}
        />
      )}

      {/* Top Posts Section */}
      {topPosts.length > 0 && (
        <TopPostsDisplay posts={topPosts} />
      )}

      {/* Demographics Section */}
      {demographics && (
        <DemographicsView demographics={demographics} />
      )}

      {/* Fallback content if no discovery data */}
      {!discoveryData && !demographics && (
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
