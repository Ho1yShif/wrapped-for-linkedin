import React, { useMemo } from 'react';
import { SpotifyDashboard } from '@components/SpotifyDashboard';
import { TopPostsDisplay } from '@components/TopPostsDisplay';
import { DemographicsView } from '@components/DemographicsView';
import { WrappedStoriesContainer } from '@components/WrappedStories/WrappedStoriesContainer';
import { FinalMessage } from '@components/FinalMessage';
import { generateShareableCards } from '@utils/cardDataMapper';
import type { EngagementMetrics, TopPost, DemographicInsights } from '@types';
import type { ParsedExcelData } from '@utils/excel/types';
import '@styles/UnifiedDashboard.css';

interface UnifiedDashboardProps {
  data: EngagementMetrics;
  demographics?: DemographicInsights;
  onUploadNewData?: () => void;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  data,
  demographics,
  onUploadNewData,
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
        <WrappedStoriesContainer 
          cards={wrappedCards} 
          autoPlayDuration={5000}
          onUploadNewData={onUploadNewData}
        />
      )}

      {/* Main Dashboard Section */}
      {discoveryData && (
        <SpotifyDashboard
          discovery={discoveryData}
          engagementByDay={data.engagementByDay}
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
          <h1 className="fallback-title">Your LinkedIn year in review</h1>

          {topPosts.length > 0 ? (
            <TopPostsDisplay posts={topPosts} />
          ) : (
            <div className="empty-state">
              <p>No analytics data available for this file.</p>
            </div>
          )}
        </div>
      )}

      {/* Final Message - That's a wrap! */}
      <FinalMessage />
    </div>
  );
};
