/**
 * Excel-specific types and interfaces for parsing LinkedIn analytics data
 */

export interface DiscoveryData {
  start_date: string;
  end_date: string;
  total_impressions: number;
  members_reached: number;
  total_engagements?: number;
  average_impressions_per_day?: number;
  new_followers?: number;
}

export interface LinkedInTopPost {
  rank: number;
  url: string;
  publish_date: string;
  engagements: number;
  impressions?: number;
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
  top_posts?: LinkedInTopPost[];
  demographics?: DemographicInsights;
  engagement_by_day?: EngagementByDay[];
}
