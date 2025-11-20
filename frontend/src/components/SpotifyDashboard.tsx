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

  // Calculate metrics directly from source data
  const totalEngagement = (totalLikes || 0) + (totalComments || 0) + (totalShares || 0);
  const avgImpressionsPerDay =
    discovery?.total_impressions && startDate && endDate
      ? Math.round(
          discovery.total_impressions /
            ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        )
      : 0;
  const engagementRatePerDay =
    discovery?.total_impressions && avgImpressionsPerDay > 0
      ? ((totalEngagement / avgImpressionsPerDay) * 100).toFixed(2)
      : '0.00';

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

        {/* Line 1: Impressions and Members Reached (2 cards at 50% each) */}
        <div className="glance-metrics-grid line-1">
          {/* Total Impressions Card */}
          <div className="metric-card">
            <div className="card-background gradient-1"></div>
            <div className="card-content">
              <h3 className="card-label">Total Impressions</h3>
              <div className="card-value-container">
                <div className="card-value">
                  {formatNumber(discovery?.total_impressions || 0)}
                </div>
                <div className="card-unit">impressions</div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>

          {/* Members Reached Card */}
          <div className="metric-card">
            <div className="card-background gradient-2"></div>
            <div className="card-content">
              <h3 className="card-label">Members Reached</h3>
              <div className="card-value-container">
                <div className="card-value">
                  {formatNumber(discovery?.members_reached || 0)}
                </div>
                <div className="card-unit">people</div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>
        </div>

        {/* Line 2: Likes, Comments, Shares (3 cards) */}
        <div className="glance-metrics-grid line-2">
          {/* Likes Card */}
          <div className="metric-card">
            <div className="card-background gradient-3"></div>
            <div className="card-content">
              <h3 className="card-label">Likes</h3>
              <div className="card-value-container">
                <div className="card-value">
                  {formatNumber(totalLikes)}
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>

          {/* Comments Card */}
          <div className="metric-card">
            <div className="card-background gradient-1"></div>
            <div className="card-content">
              <h3 className="card-label">Comments</h3>
              <div className="card-value-container">
                <div className="card-value">
                  {formatNumber(totalComments)}
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>

          {/* Shares Card */}
          <div className="metric-card">
            <div className="card-background gradient-2"></div>
            <div className="card-content">
              <h3 className="card-label">Shares</h3>
              <div className="card-value-container">
                <div className="card-value">
                  {formatNumber(totalShares)}
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>
        </div>

        {/* Line 3: Total Engagements, Total Impressions, Average Engagement Rate per Day (3 cards) */}
        <div className="glance-metrics-grid line-3">
          {/* Total Engagements Card */}
          <div className="metric-card">
            <div className="card-background gradient-2"></div>
            <div className="card-content">
              <h3 className="card-label">Total Engagements</h3>
              <div className="card-value-container">
                <div className="card-value">
                  {formatNumber(totalEngagement)}
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>

          {/* Total Impressions Card */}
          <div className="metric-card">
            <div className="card-background gradient-1"></div>
            <div className="card-content">
              <h3 className="card-label">Total Impressions</h3>
              <div className="card-value-container">
                <div className="card-value">
                  {formatNumber(discovery?.total_impressions || 0)}
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>

          {/* Avg Engagement Rate per Day Card */}
          <div className="metric-card">
            <div className="card-background gradient-3"></div>
            <div className="card-content">
              <h3 className="card-label">Avg Engagement Rate per Day</h3>
              <div className="card-value-container">
                <div className="card-value">
                  {engagementRatePerDay}%
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
