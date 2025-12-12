import React from 'react';
import { getWrappedYear } from '@utils/yearExtractor';
import { calculateBestMonth } from '@utils/bestMonthCalculator';
import type { EngagementByDay } from '@utils/excel/types';
import '../styles/SpotifyDashboard.css';

interface DiscoveryData {
  start_date: string;
  end_date: string;
  total_impressions: number;
  members_reached: number;
  total_engagements?: number;
  average_impressions_per_day?: number;
  new_followers?: number;
}

interface SpotifyDashboardProps {
  discovery?: DiscoveryData;
  engagementByDay?: EngagementByDay[];
}

export const SpotifyDashboard: React.FC<SpotifyDashboardProps> = ({
  discovery,
  engagementByDay,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const parseISODate = (dateString: string): Date => {
    // Parse ISO date string (YYYY-MM-DD) safely to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const year = discovery?.end_date ? getWrappedYear(discovery as any) : new Date().getFullYear();

  // Calculate best month from engagement data
  const bestMonth = engagementByDay && engagementByDay.length > 0 ? calculateBestMonth(engagementByDay) : null;

  return (
    <>
      {/* Your <year> Wrapped - Unified Metrics Section */}
      <div className="wrapped-section">
        <h2 className='section-title'>Year in review</h2>
        <h2 className="section-subtitle">
        Your Wrapped for LinkedIn {year}
      </h2>
        <p className="section-subtitle">
          {discovery?.start_date && discovery?.end_date ? (
            <>
              {parseISODate(discovery.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – {parseISODate(discovery.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </>
          ) : null}
        </p>
        <br></br>
        {/* Line 1: Total impressions, Members reached, New followers */}
        <div className="wrapped-metrics-grid line-1">
          {/* Total impressions Card */}
          <div className="metric-card">
            <div className="card-background gradient"></div>
            <div className="card-content">
              <h3 className="spotify-card-label">Total impressions</h3>
              <div className="spotify-card-value-container">
                <div className="spotify-card-value">
                  {formatNumber(discovery?.total_impressions || 0)}
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>

          {/* Members reached Card */}
          <div className="metric-card">
            <div className="card-background gradient"></div>
            <div className="card-content">
              <h3 className="spotify-card-label">Members reached</h3>
              <div className="spotify-card-value-container">
                <div className="spotify-card-value">
                  {formatNumber(discovery?.members_reached || 0)}
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>

          {/* New followers Card */}
          <div className="metric-card">
            <div className="card-background gradient"></div>
            <div className="card-content">
              <h3 className="spotify-card-label">New followers</h3>
              <div className="spotify-card-value-container">
                <div className="spotify-card-value">
                  {formatNumber(discovery?.new_followers || 0)}
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>
        </div>

        {/* Line 2: Total engagements, Best month, Median daily impressions */}
        <div className="wrapped-metrics-grid line-2">
          {/* Total engagements Card */}
          <div className="metric-card">
            <div className="card-background gradient"></div>
            <div className="card-content">
              <h3 className="spotify-card-label">Total engagements</h3>
              <div className="spotify-card-value-container">
                <div className="spotify-card-value">
                  {formatNumber(discovery?.total_engagements || 0)}
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>

          {/* Best month Card */}
          {bestMonth && (
            <div className="metric-card">
              <div className="card-background gradient"></div>
              <div className="card-content">
                <h3 className="spotify-card-label">Best month</h3>
                <div className="spotify-card-value-container">
                  <div className="spotify-card-value">
                    {bestMonth.monthYear}
                  </div>
                </div>
                <div className="card-accent"></div>
              </div>
            </div>
          )}

          {/* Median daily impressions Card */}
          <div className="metric-card">
            <div className="card-background gradient"></div>
              <div className="card-content">
                <h3 className="spotify-card-label">Median daily impressions</h3>
                <div className="spotify-card-value-container">
                <div className="spotify-card-value">
                  {formatNumber(discovery?.average_impressions_per_day || 0)}
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};
