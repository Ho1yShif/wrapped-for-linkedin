import React, { useMemo } from 'react';
import type { DemographicInsights, DemographicItem } from '@types';
import '../styles/Demographics.css';

interface DemographicsViewProps {
  demographics: DemographicInsights;
}

const DemographicCategory: React.FC<{
  title: string;
  items: DemographicItem[];
  icon: string;
}> = ({ title, items, icon }) => {
  const topItems = useMemo(() => items.slice(0, 5), [items]);

  if (topItems.length === 0) return null;

  return (
    <div className="demographic-category">
      <div className="category-header">
        <span className="category-icon">{icon}</span>
        <h3 className="category-title">{title}</h3>
      </div>
      <div className="category-items">
        {topItems.map((item, index) => (
          <div key={index} className="demographic-item">
            <div className="item-info">
              <span className="item-name">{item.name}</span>
              <span className="item-percentage">{Math.round(item.percentage * 100)}%</span>
            </div>
            <div className="item-bar">
              <div
                className="item-bar-fill"
                style={{ width: `${Math.min(item.percentage * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DemographicsView: React.FC<DemographicsViewProps> = ({ demographics }) => {
  const hasData =
    demographics?.job_titles?.length > 0 ||
    demographics?.locations?.length > 0 ||
    demographics?.industries?.length > 0;

  if (!hasData) {
    return (
      <div className="demographics-view empty-state">
        <p>No demographic data available</p>
      </div>
    );
  }

  return (
    <div className="demographics-view">
      <div className="demographics-header">
        <h2 className="section-title">Your audience</h2>
        <p className="demographics-subtitle">
          Who engaged with your content
        </p>
      </div>

      <div className="demographics-grid">
        {demographics?.job_titles?.length > 0 && (
          <DemographicCategory
            title="Job titles"
            items={demographics.job_titles}
            icon="💼"
          />
        )}

        {demographics?.locations?.length > 0 && (
          <DemographicCategory
            title="Locations"
            items={demographics.locations}
            icon="📍"
          />
        )}

        {demographics?.industries?.length > 0 && (
          <DemographicCategory
            title="Industries"
            items={demographics.industries}
            icon="🛠️"
          />
        )}

        {demographics?.seniority && demographics.seniority.length > 0 && (
          <DemographicCategory
            title="Seniority levels"
            items={demographics.seniority}
            icon="⭐"
          />
        )}

        {demographics?.company_size && demographics.company_size.length > 0 && (
          <DemographicCategory
            title="Company size"
            items={demographics.company_size}
            icon="👥"
          />
        )}

        {demographics?.companies && demographics.companies.length > 0 && (
          <DemographicCategory
            title="Companies"
            items={demographics.companies}
            icon="🏢"
          />
        )}
      </div>
    </div>
  );
};
