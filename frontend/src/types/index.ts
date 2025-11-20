export interface AnalyticsData {
  fileId: string;
  engagement?: EngagementMetrics;
  demographics?: DemographicInsights;
}

export interface EngagementMetrics {
  averageEngagement?: number;
  topPosts?: TopPost[];
  engagementByDay?: EngagementByDay[];
  peakEngagementTime?: string;
  discovery_data?: {
    start_date: string;
    end_date: string;
    total_impressions: number;
    members_reached: number;
  };
  top_posts?: LinkedInTopPost[];
}

export interface LinkedInTopPost {
  rank: number;
  url: string;
  publish_date: string;
  engagements: number;
  impressions?: number;
}

export interface TopPost {
  id: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  date: string;
  engagementRate: number;
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
