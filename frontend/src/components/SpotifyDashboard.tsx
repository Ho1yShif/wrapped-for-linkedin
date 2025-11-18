import React from 'react';
import '../styles/SpotifyDashboard.css';

interface DiscoveryData {
  start_date: string;
  end_date: string;
  total_impressions: number;
  members_reached: number;
}

interface SpotifyDashboardProps {
  discovery?: DiscoveryData;
  totalLikes?: number;
  totalComments?: number;
  totalShares?: number;
}

export const SpotifyDashboard: React.FC<SpotifyDashboardProps> = ({
  discovery,
  totalLikes = 0,
  totalComments = 0,
  totalShares = 0,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const startDate = discovery?.start_date ? new Date(discovery.start_date) : null;
  const endDate = discovery?.end_date ? new Date(discovery.end_date) : null;

  // Calculate metrics with fallbacks
  const totalEngagement = (totalLikes || 0) + (totalComments || 0) + (totalShares || 0);
  const avgImpressionsPerDay =
    discovery?.total_impressions && startDate && endDate
      ? Math.round(
          discovery.total_impressions /
            ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        )
      : 0;
  const engagementRate =
    discovery?.total_impressions && discovery?.total_impressions > 0
      ? (((totalLikes || 0) + (totalComments || 0) + (totalShares || 0)) /
          discovery.total_impressions) *
        100
      : 0;

  return (
    <div className="spotify-dashboard">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">
              Your professional year in review
            </h1>
        <div className="hero-content">
          {startDate && endDate && (
            <h2 className="hero-subtitle">
                {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — {endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
          )}
        </div>
      </div>

      {/* Your Year at a Glance - Unified Metrics Section */}
      <div className="year-at-glance-section">
        <h2 className="section-heading">Your year at a glance</h2>

        <div className="glance-metrics-grid">
          {/* Primary Stat Card - Impressions */}
          <div className="metric-card primary-card">
            <div className="card-background gradient-1"></div>
            <div className="card-content">
              <h3 className="card-label">Total Impressions</h3>
              <div className="card-value-container">
                <div className="card-value primary-value">
                  {formatNumber(discovery?.total_impressions || 0)}
                </div>
                <div className="card-unit">impressions</div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>

          {/* Secondary Stat Card - Reach */}
          <div className="metric-card secondary-card">
            <div className="card-background gradient-2"></div>
            <div className="card-content">
              <h3 className="card-label">Members Reached</h3>
              <div className="card-value-container">
                <div className="card-value secondary-value">
                  {formatNumber(discovery?.members_reached || 0)}
                </div>
                <div className="card-unit">people</div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>

          {/* Engagement Trio */}
          <div className="metric-card engagement-card">
            <div className="card-background gradient-3"></div>
            <div className="card-content engagement-content">
              <h3 className="card-label">Engagement</h3>
              <div className="engagement-metrics">
                <div className="engagement-item">
                  <div className="engagement-icon likes">❤️</div>
                  <div className="engagement-value">{formatNumber(totalLikes)}</div>
                  <div className="engagement-label">Likes</div>
                </div>
                <div className="engagement-item">
                  <div className="engagement-icon comments">💬</div>
                  <div className="engagement-value">{formatNumber(totalComments)}</div>
                  <div className="engagement-label">Comments</div>
                </div>
                <div className="engagement-item">
                  <div className="engagement-icon shares">↗️</div>
                  <div className="engagement-value">{formatNumber(totalShares)}</div>
                  <div className="engagement-label">Shares</div>
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="detailed-stats">
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-label">Total Engagement</div>
              <div className="stat-value">
                {formatNumber(totalEngagement)}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Average Impressions per Day</div>
              <div className="stat-value">
                {avgImpressionsPerDay > 0 ? formatNumber(avgImpressionsPerDay) : '—'}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Engagement Rate</div>
              <div className="stat-value">
                {engagementRate > 0 ? engagementRate.toFixed(2) + '%' : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
