export interface EngagementMetrics {
  discovery_data?: {
    start_date: string;
    end_date: string;
    total_impressions: number;
    members_reached: number;
    total_engagements?: number;
    average_impressions_per_day?: number;
    new_followers?: number;
  };
  top_posts?: TopPost[];
  engagementByDay?: EngagementByDay[];
}

export interface TopPost {
  rank: number;
  url: string;
  publish_date: string;
  engagements: number;
  impressions?: number;
}

export interface EngagementByDay {
  date: string;
  engagement: number;
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

export interface UploadResponse {
  success: boolean;
  fileId: string;
  message: string;
}
