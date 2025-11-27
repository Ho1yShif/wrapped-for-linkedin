/**
 * Excel-specific types and interfaces for parsing LinkedIn analytics data
 */

import type { TopPost } from '../../types';

export interface DiscoveryData {
  start_date: string;
  end_date: string;
  total_impressions: number;
  members_reached: number;
  total_engagements?: number;
  average_impressions_per_day?: number;
  new_followers?: number;
}

export interface DemographicItem {
  name: string;
  percentage: number;
}

export interface DemographicInsights {
  job_titles: DemographicItem[];
  locations: DemographicItem[];
  industries: DemographicItem[];
  seniority?: DemographicItem[];
  company_size?: DemographicItem[];
  companies?: DemographicItem[];
}

export interface EngagementByDay {
  date: string;
  engagement: number;
  impressions?: number;
}

export interface ParsedExcelData {
  discovery_data?: DiscoveryData;
  top_posts?: TopPost[];
  demographics?: DemographicInsights;
  engagement_by_day?: EngagementByDay[];
}
