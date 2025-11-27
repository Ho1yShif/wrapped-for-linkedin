import React, { useMemo } from 'react';
import { SpotifyDashboard } from './SpotifyDashboard';
import { TopPostsDisplay } from './TopPostsDisplay';
import { DemographicsView } from './DemographicsView';
import { WrappedStoriesContainer } from './WrappedStories/WrappedStoriesContainer';
import { generateShareableCards } from '../utils/cardDataMapper';
import type { EngagementMetrics, TopPost, DemographicInsights } from '@types';
import type { ParsedExcelData } from '../utils/excel/types';
import '../styles/UnifiedDashboard.css';

interface UnifiedDashboardProps {
  data: EngagementMetrics;
  demographics?: DemographicInsights;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  data,
  demographics,
}) => {
  // Extract discovery data if available
  const discoveryData = data.discovery_data as any;
  const topPosts: TopPost[] = data.top_posts || [];

  // Generate shareable cards for wrapped stories
  const wrappedCards = useMemo(() => {
    if (!discoveryData) return [];
    const excelData: ParsedExcelData = {
      discovery_data: discoveryData,
      top_posts: data.top_posts,
      demographics,
      engagement_by_day: data.engagementByDay,
    };
    return generateShareableCards(excelData);
  }, [discoveryData, data.top_posts, demographics, data.engagementByDay]);

  return (
    <div className="unified-dashboard">
      {/* Wrapped Stories Section (at the top) */}
      {wrappedCards.length > 0 && (
        <WrappedStoriesContainer cards={wrappedCards} autoPlayDuration={5000} />
      )}

      {/* Main Dashboard Section */}
      {discoveryData && (
        <SpotifyDashboard
          discovery={discoveryData}
        />
      )}

      {/* Top posts Section */}
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
