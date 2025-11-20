import React from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SpotifyDashboard } from './SpotifyDashboard';
import type { EngagementMetrics } from '@types';
import '../styles/Analytics.css';

interface AnalyticsViewProps {
  data: EngagementMetrics;
}

const COLORS = ['#0A66C2', '#378FE9', '#4B9EFF', '#7CB9E8', '#B8D4F1'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ data }) => {
  // Extract discovery data if available
  const discoveryData = data.discovery_data as any;

  return (
    <div className="analytics-container">
      {/* Spotify Dashboard - Main View */}
      {discoveryData && (
        <SpotifyDashboard
          discovery={discoveryData}
        />
      )}

      {/* Legacy analytics sections */}
      {!discoveryData && (
        <>
          <h1 className="analytics-title">Your LinkedIn Year in Review</h1>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="card">
              <div className="card-label">Average Engagement</div>
              <div className="card-value">{data.averageEngagement?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
        </>
      )}


      {/* Engagement Over Time */}
      {data.engagementByDay && data.engagementByDay.length > 0 && (
        <div className="chart-section">
          <h2>Engagement Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.engagementByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#0A66C2"
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Posts */}
      {data.topPosts && data.topPosts.length > 0 && (
        <div className="chart-section">
          <h2>Top Posts</h2>
          <div className="posts-grid">
            {data.topPosts.slice(0, 6).map((post, index) => (
              <div key={post.id} className="post-card">
                <div className="post-rank">#{index + 1}</div>
                <p className="post-content">{post.content.substring(0, 100)}...</p>
                <div className="post-stats">
                  <div className="stat">
                    <span className="stat-label">Likes</span>
                    <span className="stat-value">{post.likes}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Comments</span>
                    <span className="stat-value">{post.comments}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Shares</span>
                    <span className="stat-value">{post.shares}</span>
                  </div>
                </div>
                <div className="engagement-rate">
                  Engagement Rate: {(post.engagementRate * 100).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Peak Engagement Time */}
      {data.peakEngagementTime && (
        <div className="insights-section">
          <h2>Key Insights</h2>
          <div className="insight-card">
            <p>Your peak engagement time: <strong>{data.peakEngagementTime}</strong></p>
          </div>
        </div>
      )}
    </div>
  );
};
